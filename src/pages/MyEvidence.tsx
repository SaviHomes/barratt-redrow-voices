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
import { Image as ImageIcon, Search, Trash2, Download, Images, Play, Edit, MessageSquare, ArrowUp, ArrowDown, Star } from "lucide-react";
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
import { PhotoCaptionEditor } from "@/components/evidence/PhotoCaptionEditor";

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
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [evidenceToEdit, setEvidenceToEdit] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 2 rows × 5 columns
  const [captionEditorOpen, setCaptionEditorOpen] = useState(false);
  const [photoToEdit, setPhotoToEdit] = useState<any | null>(null);
  const [editPhotoEvidenceId, setEditPhotoEvidenceId] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<{ path: string, evidenceId: string } | null>(null);

  const { evidenceWithPhotos, loading: photosLoading, deletePhoto, refetch: refetchPhotos } = useEvidencePhotos(evidence);

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
  }, [searchTerm, categoryFilter, severityFilter, mediaTypeFilter]);

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

  const handleEditPhotoCaption = (photo: any, evidenceId: string) => {
    setPhotoToEdit(photo);
    setEditPhotoEvidenceId(evidenceId);
    setCaptionEditorOpen(true);
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
    item.photos.map((photo, index) => ({
      ...photo,
      evidenceId: item.id,
      evidenceTitle: item.title,
      evidenceCategory: item.category,
      evidenceSeverity: item.severity,
      order_index: index,
      featuredImageIndex: item.featured_image_index
    }))
  );

  // Helper function to determine photo position within its evidence group
  const getPhotoPosition = (photo: any) => {
    // Get all photos for this evidence item
    const evidencePhotos = allPhotos.filter(p => p.evidenceId === photo.evidenceId);
    const currentIndex = evidencePhotos.findIndex(p => p.path === photo.path);
    
    return {
      isFirst: currentIndex === 0,
      isLast: currentIndex === evidencePhotos.length - 1,
      currentIndex,
      evidencePhotos
    };
  };

  // Delete single photo from gallery
  const handleDeleteSinglePhoto = async (photoPath: string, evidenceId: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('evidence-photos')
        .remove([photoPath]);
      
      if (storageError) throw storageError;
      
      // Delete caption record
      const { error: dbError } = await supabase
        .from('evidence_photo_captions')
        .delete()
        .eq('photo_path', photoPath);
      
      if (dbError) throw dbError;
      
      toast({ 
        title: "Photo deleted", 
        description: "Photo has been removed successfully." 
      });
      
      refetchPhotos();
      fetchEvidence();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({ 
        title: "Error", 
        description: "Failed to delete photo", 
        variant: "destructive" 
      });
    } finally {
      setPhotoToDelete(null);
    }
  };

  // Move photo up or down
  const handleMovePhoto = async (photo: any, direction: 'up' | 'down') => {
    const { evidencePhotos, currentIndex } = getPhotoPosition(photo);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= evidencePhotos.length) return;
    
    const currentPhoto = evidencePhotos[currentIndex];
    const targetPhoto = evidencePhotos[targetIndex];
    
    try {
      // Update the current photo's order_index
      const { error: error1 } = await supabase
        .from('evidence_photo_captions')
        .update({ order_index: targetPhoto.order_index })
        .eq('id', currentPhoto.captionId);
      
      if (error1) throw error1;
      
      // Update the target photo's order_index
      const { error: error2 } = await supabase
        .from('evidence_photo_captions')
        .update({ order_index: currentPhoto.order_index })
        .eq('id', targetPhoto.captionId);
      
      if (error2) throw error2;
      
      toast({ 
        title: "Photo moved", 
        description: `Photo moved ${direction}` 
      });
      
      refetchPhotos();
    } catch (error) {
      console.error('Error moving photo:', error);
      toast({ 
        title: "Error", 
        description: "Failed to move photo", 
        variant: "destructive" 
      });
    }
  };

  // Set photo as thumbnail
  const handleSetThumbnail = async (evidenceId: string, orderIndex: number) => {
    try {
      const { error } = await supabase
        .from('evidence')
        .update({ featured_image_index: orderIndex })
        .eq('id', evidenceId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast({
        title: "Thumbnail updated",
        description: "Photo set as thumbnail successfully"
      });
      
      fetchEvidence();
      refetchPhotos();
    } catch (error) {
      console.error('Error updating thumbnail:', error);
      toast({
        title: "Error",
        description: "Failed to update thumbnail",
        variant: "destructive"
      });
    }
  };

  // Filter by media type
  const filteredPhotos = allPhotos.filter(photo => {
    if (mediaTypeFilter === "photos") return !isVideoFile(photo.name);
    if (mediaTypeFilter === "videos") return isVideoFile(photo.name);
    return true; // "all"
  });

  const totalPages = Math.ceil(filteredPhotos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPhotos = filteredPhotos.slice(startIndex, startIndex + itemsPerPage);

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <Select value={mediaTypeFilter} onValueChange={setMediaTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by media type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Media</SelectItem>
                    <SelectItem value="photos">Photos Only</SelectItem>
                    <SelectItem value="videos">Videos Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Photo Gallery Grid */}
          {filteredPhotos.length === 0 ? (
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {paginatedPhotos.map((photo) => {
                  const evidenceIndex = filteredEvidence.findIndex(e => e.id === photo.evidenceId);
                  const photoIndex = filteredEvidence[evidenceIndex]?.photos.findIndex(p => p.path === photo.path) ?? 0;
                  const { isFirst, isLast } = getPhotoPosition(photo);
                  const isThumbnail = photo.featuredImageIndex === photo.order_index;
                  
                  return (
                    <div key={`${photo.evidenceId}-${photo.path}`} className="space-y-2">
                      {/* Photo/Video container */}
                      <div
                        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 border-border hover:border-primary transition-all"
                        onClick={() => openLightbox(photo.evidenceId, photoIndex)}
                      >
                        {/* Star icon - top left, always visible if thumbnail */}
                        <div className="absolute top-2 left-2 z-10 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant={isThumbnail ? "default" : "secondary"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetThumbnail(photo.evidenceId, photo.order_index);
                            }}
                            className={`h-7 w-7 p-0 ${isThumbnail ? "bg-yellow-500 hover:bg-yellow-600 opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                            title={isThumbnail ? "Current thumbnail" : "Set as thumbnail"}
                          >
                            <Star className={`h-3 w-3 ${isThumbnail ? "fill-white" : ""}`} />
                          </Button>
                        </div>

                        {/* Label badge - below star if exists */}
                        {photo.label && (
                          <div className="absolute top-11 left-2 z-10">
                            <Badge variant="secondary" className="text-xs px-2 py-1 bg-black/70 text-white backdrop-blur-sm border-none">
                              {photo.label}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Caption indicator - top right when not hovering */}
                        {photo.caption && (
                          <div className="absolute top-2 right-2 z-10 opacity-100 group-hover:opacity-0 transition-opacity">
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-500/90 text-white border-blue-300">
                              <MessageSquare className="h-3 w-3" />
                            </Badge>
                          </div>
                        )}

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
                            alt={photo.label || photo.evidenceTitle}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                          />
                        )}
                        
                        {/* Action buttons overlay - shows on hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          {/* Move buttons - top right */}
                          <div className="absolute top-2 right-2 flex gap-1 pointer-events-auto z-20" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMovePhoto(photo, 'up');
                              }}
                              disabled={isFirst}
                              className="h-7 w-7 p-0"
                            >
                              <ArrowUp className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMovePhoto(photo, 'down');
                              }}
                              disabled={isLast}
                              className="h-7 w-7 p-0"
                            >
                              <ArrowDown className="h-3 w-3" />
                            </Button>
                          </div>
                          
                    {/* Edit and Delete buttons - bottom right */}
                    <div className="absolute bottom-2 right-2 flex gap-1 pointer-events-auto z-20" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPhotoCaption(photo, photo.evidenceId);
                              }}
                              className="h-7 px-2"
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotoToDelete({ path: photo.path, evidenceId: photo.evidenceId });
                              }}
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Evidence title overlay on hover - bottom left */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity pr-20">
                          <p className="text-white text-xs font-medium truncate">{photo.evidenceTitle}</p>
                        </div>
                      </div>
                      
                      {/* Caption text below photo - bold and visible */}
                      {photo.caption && (
                        <p className="text-sm font-semibold text-foreground line-clamp-2 px-1">
                          {photo.caption}
                        </p>
                      )}
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

          {/* Delete Single Photo Confirmation Dialog */}
          <AlertDialog open={!!photoToDelete} onOpenChange={(open) => !open && setPhotoToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this photo. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => photoToDelete && handleDeleteSinglePhoto(photoToDelete.path, photoToDelete.evidenceId)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
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

          {/* Photo Caption Editor Dialog */}
          <PhotoCaptionEditor
            photo={photoToEdit}
            evidenceId={editPhotoEvidenceId}
            open={captionEditorOpen}
            onOpenChange={setCaptionEditorOpen}
            onSave={refetchPhotos}
          />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
