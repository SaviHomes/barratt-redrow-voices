import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Download, Trash2, ZoomIn, ZoomOut, Play } from "lucide-react";
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
import { EvidencePhoto } from "@/hooks/useEvidencePhotos";

const isVideoFile = (filename: string): boolean => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

interface EvidenceLightboxProps {
  photos: EvidencePhoto[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onDeletePhoto: (photoPath: string) => Promise<{ success: boolean }>;
  evidenceTitle: string;
}

export default function EvidenceLightbox({
  photos,
  initialIndex,
  isOpen,
  onClose,
  onDeletePhoto,
  evidenceTitle,
}: EvidenceLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [deletePhotoPath, setDeletePhotoPath] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
  }, [initialIndex, isOpen]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    setZoom(1);
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setZoom(1);
  }, [photos.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          handlePrevious();
          break;
        case "ArrowRight":
          handleNext();
          break;
        case "Escape":
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

  const handleDownload = async () => {
    try {
      const photo = photos[currentIndex];
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${evidenceTitle}_${currentIndex + 1}.${photo.name.split('.').pop()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Photo downloaded",
        description: "The photo has been saved to your device.",
      });
    } catch (error) {
      console.error("Error downloading photo:", error);
      toast({
        title: "Download failed",
        description: "Failed to download the photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!deletePhotoPath) return;

    const result = await onDeletePhoto(deletePhotoPath);
    
    if (result.success) {
      toast({
        title: "Photo deleted",
        description: "The photo has been successfully removed.",
      });

      // If we deleted the last photo, close the lightbox
      if (photos.length === 1) {
        onClose();
      } else if (currentIndex >= photos.length - 1) {
        // If we deleted the last photo in the list, go to previous
        setCurrentIndex(photos.length - 2);
      }
    } else {
      toast({
        title: "Delete failed",
        description: "Failed to delete the photo. Please try again.",
        variant: "destructive",
      });
    }

    setDeletePhotoPath(null);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  if (photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];
  const isVideo = isVideoFile(currentPhoto.name);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-4 py-2 rounded-md">
              {currentIndex + 1} / {photos.length}
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2 bg-black/50 p-2 rounded-lg">
              {!isVideo && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomOut}
                    disabled={zoom <= 1}
                    className="text-white hover:bg-white/20"
                  >
                    <ZoomOut className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="text-white hover:bg-white/20"
                  >
                    <ZoomIn className="h-5 w-5" />
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                className="text-white hover:bg-white/20"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletePhotoPath(currentPhoto.path)}
                className="text-destructive hover:bg-white/20"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Previous Button */}
            {photos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            )}

            {/* Next Button */}
            {photos.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 text-white hover:bg-white/20 h-12 w-12"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            )}

            {/* Image or Video */}
            <div className="w-full h-full flex items-center justify-center p-16 overflow-auto">
              {isVideo ? (
                <video
                  src={currentPhoto.url}
                  controls={true}
                  autoPlay={true}
                  className="max-w-full max-h-[85vh] w-auto h-auto rounded shadow-2xl"
                />
              ) : (
                <img
                  src={currentPhoto.url}
                  alt={`${evidenceTitle} - Photo ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom})` }}
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePhotoPath} onOpenChange={() => setDeletePhotoPath(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this photo. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
