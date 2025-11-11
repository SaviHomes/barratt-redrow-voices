import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image as ImageIcon, Search, Trash2, Download, Images, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEvidencePhotos } from "@/hooks/useEvidencePhotos";
import EvidenceLightbox from "@/components/EvidenceLightbox";
import JSZip from "jszip";
import BackToDashboard from "@/components/BackToDashboard";
import { EditEvidenceDialog } from "@/components/evidence/EditEvidenceDialog";

const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export default function MyEvidence() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [evidence, setEvidence] = useState<any[]>([]);
  const [filteredEvidence, setFilteredEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [evidenceToEdit, setEvidenceToEdit] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 2 rows × 5 columns

  const { evidenceWithPhotos, loading: photosLoading, deletePhoto, refetch: refetchPhotos } = useEvidencePhotos(evidence, user?.id);

  useEffect(() => {
    if (user) {
      fetchEvidence();
    }
  }, [user]);

  useEffect(() => {
    filterEvidence();
  }, [evidenceWithPhotos, searchTerm, categoryFilter, severityFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, severityFilter]);

  const fetchEvidence = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('evidence')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
    } catch (error) {
      console.error('Error fetching evidence:', error);
      toast({
        title: "Error",
        description: "Failed to load evidence",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEvidence = () => {
    let filtered = evidenceWithPhotos;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (severityFilter !== "all") {
      filtered = filtered.filter(item => item.severity === severityFilter);
    }

    setFilteredEvidence(filtered);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // First, delete associated photos from storage
      const { data: files } = await supabase.storage
        .from('evidence-photos')
        .list(`${user?.id}/${deleteId}`);

      if (files && files.length > 0) {
        const filePaths = files.map(file => `${user?.id}/${deleteId}/${file.name}`);
        await supabase.storage.from('evidence-photos').remove(filePaths);
      }

      // Then delete the evidence record
      const { error } = await supabase
        .from('evidence')
        .delete()
        .eq('id', deleteId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast({
        title: "Evidence deleted",
        description: "Your evidence has been successfully removed.",
      });

      setEvidence(prev => prev.filter(item => item.id !== deleteId));
      refetchPhotos();
    } catch (error) {
      console.error('Error deleting evidence:', error);
      toast({
        title: "Error",
        description: "Failed to delete evidence",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const openLightbox = (evidenceId: string, photoIndex: number) => {
    setSelectedEvidenceId(evidenceId);
    setSelectedPhotoIndex(photoIndex);
    setLightboxOpen(true);
  };

  const handleEditEvidence = (item: any) => {
    setEvidenceToEdit(item);
    setEditDialogOpen(true);
  };

  const handleDeletePhoto = async (photoPath: string) => {
    const result = await deletePhoto(selectedEvidenceId!, photoPath);
    return result;
  };

  const handleBulkDownload = async (evidenceId: string, evidenceTitle: string) => {
    const item = evidenceWithPhotos.find(e => e.id === evidenceId);
    if (!item || item.photos.length === 0) return;

    try {
      toast({
        title: "Preparing download",
        description: "Creating zip file...",
      });

      const zip = new JSZip();
      
      // Download all photos and add to zip
      await Promise.all(
        item.photos.map(async (photo, index) => {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          const ext = photo.name.split('.').pop();
          zip.file(`${evidenceTitle}_${index + 1}.${ext}`, blob);
        })
      );

      // Generate zip file
      const content = await zip.generateAsync({ type: "blob" });
      
      // Trigger download
      const url = window.URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${evidenceTitle}_photos_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download complete",
        description: `All ${item.photos.length} photos downloaded successfully.`,
      });
    } catch (error) {
      console.error("Error downloading photos:", error);
      toast({
        title: "Download failed",
        description: "Failed to download photos. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedEvidence = evidenceWithPhotos.find(e => e.id === selectedEvidenceId);

  // Flatten all photos into a single paginated array
  const allPhotos = filteredEvidence.flatMap(item =>
    item.photos.map(photo => ({
      ...photo,
      evidenceId: item.id,
      evidenceTitle: item.title,
      evidenceCategory: item.category,
      evidenceSeverity: item.severity
    }))
  );

  const totalPages = Math.ceil(allPhotos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPhotos = allPhotos.slice(startIndex, startIndex + itemsPerPage);

  if (loading || photosLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading evidence...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <BackToDashboard />
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Evidence</h1>
              <p className="text-muted-foreground">
                Manage all your submitted evidence and documentation
              </p>
            </div>
            <Button asChild>
              <Link to="/upload-evidence">Upload New Evidence</Link>
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search evidence..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="structural">Structural Issues</SelectItem>
                    <SelectItem value="electrical">Electrical Problems</SelectItem>
                    <SelectItem value="plumbing">Plumbing Issues</SelectItem>
                    <SelectItem value="finishing">Poor Finishing</SelectItem>
                    <SelectItem value="external">External/Landscaping</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery Grid */}
          {allPhotos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No photos found</h3>
                <p className="text-muted-foreground mb-4">
                  {evidence.length === 0
                    ? "You haven't uploaded any evidence yet."
                    : "No photos match your search criteria."}
                </p>
                {evidence.length === 0 && (
                  <Button asChild>
                    <Link to="/upload-evidence">Upload Your First Evidence</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Gallery Grid - 5 columns, 2 rows */}
              <div className="grid grid-cols-5 gap-4">
                {paginatedPhotos.map((photo) => {
                  const evidenceIndex = filteredEvidence.findIndex(e => e.id === photo.evidenceId);
                  const photoIndex = filteredEvidence[evidenceIndex]?.photos.findIndex(p => p.path === photo.path) ?? 0;
                  
                  return (
                    <div
                      key={`${photo.evidenceId}-${photo.path}`}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 border-border hover:border-primary transition-all"
                      onClick={() => openLightbox(photo.evidenceId, photoIndex)}
                    >
                      {isVideoFile(photo.name) ? (
                        <>
                          <video
                            src={photo.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          {/* Play icon overlay */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/20">
                            <div className="bg-black/60 rounded-full p-3 backdrop-blur-sm">
                              <Play className="h-6 w-6 text-white fill-white" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <img
                          src={photo.url}
                          alt={photo.evidenceTitle}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      )}
                      
                      {/* Evidence info overlay on hover */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate">{photo.evidenceTitle}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs px-1 py-0">{photo.evidenceCategory}</Badge>
                          <Badge variant={getSeverityColor(photo.evidenceSeverity)} className="text-xs px-1 py-0">
                            {photo.evidenceSeverity}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this evidence and all associated photos. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Edit Evidence Dialog */}
          <EditEvidenceDialog
            evidence={evidenceToEdit}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onUpdate={() => {
              fetchEvidence();
              refetchPhotos();
            }}
          />

          {/* Lightbox */}
          {selectedEvidence && (
            <EvidenceLightbox
              photos={selectedEvidence.photos}
              initialIndex={selectedPhotoIndex}
              isOpen={lightboxOpen}
              onClose={() => setLightboxOpen(false)}
              onDeletePhoto={handleDeletePhoto}
              evidenceTitle={selectedEvidence.title}
            />
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
