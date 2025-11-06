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
import { Image as ImageIcon, Search, Trash2, Download, Images } from "lucide-react";
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
import { useEvidencePhotos } from "@/hooks/useEvidencePhotos";
import EvidenceLightbox from "@/components/EvidenceLightbox";
import JSZip from "jszip";
import BackToDashboard from "@/components/BackToDashboard";

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

  const { evidenceWithPhotos, loading: photosLoading, deletePhoto, refetch: refetchPhotos } = useEvidencePhotos(evidence, user?.id);

  useEffect(() => {
    if (user) {
      fetchEvidence();
    }
  }, [user]);

  useEffect(() => {
    filterEvidence();
  }, [evidenceWithPhotos, searchTerm, categoryFilter, severityFilter]);

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

          {/* Evidence Grid */}
          {filteredEvidence.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No evidence found</h3>
                <p className="text-muted-foreground mb-4">
                  {evidence.length === 0
                    ? "You haven't uploaded any evidence yet."
                    : "No evidence matches your search criteria."}
                </p>
                {evidence.length === 0 && (
                  <Button asChild>
                    <Link to="/upload-evidence">Upload Your First Evidence</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvidence.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{item.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {new Date(item.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(item.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-3">
                      <Badge variant={getSeverityColor(item.severity)}>
                        {item.severity}
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {item.description}
                      </p>
                    )}

                    {/* Photo Gallery */}
                    {item.photos && item.photos.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Images className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {item.photos.length} {item.photos.length === 1 ? 'photo' : 'photos'}
                            </span>
                          </div>
                          {item.photos.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBulkDownload(item.id, item.title)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download All
                            </Button>
                          )}
                        </div>

                        {/* Photo Thumbnails Grid */}
                        <div className="grid grid-cols-4 gap-2">
                          {item.photos.slice(0, 4).map((photo, index) => (
                            <div
                              key={photo.path}
                              className="relative aspect-square rounded-md overflow-hidden cursor-pointer group border border-border hover:border-primary transition-colors"
                              onClick={() => openLightbox(item.id, index)}
                            >
                              <img
                                src={photo.url}
                                alt={`${item.title} - Photo ${index + 1}`}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              />
                              {index === 3 && item.photos.length > 4 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                                  +{item.photos.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {item.photos.length > 4 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => openLightbox(item.id, 0)}
                          >
                            View All {item.photos.length} Photos
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-dashed border-border rounded-md">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">No photos uploaded</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
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
