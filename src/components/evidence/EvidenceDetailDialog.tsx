import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Image as ImageIcon, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { EvidenceWithPhotos } from "@/hooks/useEvidencePhotos";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface PhotoCaption {
  id: string;
  photo_path: string;
  label: string | null;
  caption: string | null;
  order_index: number;
}

interface EvidenceDetailDialogProps {
  evidence: EvidenceWithPhotos | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EvidenceDetailDialog({ evidence, open, onOpenChange }: EvidenceDetailDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [captions, setCaptions] = useState<PhotoCaption[]>([]);
  const [loadingCaptions, setLoadingCaptions] = useState(false);

  useEffect(() => {
    if (evidence && open) {
      loadCaptions();
    }
  }, [evidence, open]);

  const loadCaptions = async () => {
    if (!evidence) return;
    
    setLoadingCaptions(true);
    try {
      const { data, error } = await supabase
        .from('evidence_photo_captions')
        .select('*')
        .eq('evidence_id', evidence.id)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setCaptions(data || []);
    } catch (error) {
      console.error('Error loading captions:', error);
    } finally {
      setLoadingCaptions(false);
    }
  };

  if (!evidence) return null;

  const hasImages = evidence.photos.length > 0;
  const currentPhoto = evidence.photos[currentImageIndex];
  const currentCaption = captions.find(c => c.photo_path === currentPhoto?.path);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? evidence.photos.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === evidence.photos.length - 1 ? 0 : prev + 1));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        <ScrollArea className="max-h-[90vh]">
          {hasImages && (
            <div className="relative w-full aspect-video bg-black">
              <img
                src={evidence.photos[currentImageIndex].url}
                alt={`${evidence.title} - ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              
              {evidence.photos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    onClick={handlePrevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    onClick={handleNextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {evidence.photos.length}
                  </div>
                </>
              )}

              {/* Label overlay */}
              {currentCaption?.label && (
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-md text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {currentCaption.label}
                </div>
              )}
            </div>
          )}

          {/* Caption below current image */}
          {hasImages && currentCaption?.caption && (
            <div className="px-6 pt-4 pb-2 bg-muted/30 border-b">
              <p className="text-sm text-muted-foreground italic">
                "{currentCaption.caption}"
              </p>
            </div>
          )}

          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-2xl">{evidence.title}</DialogTitle>
            </DialogHeader>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                {evidence.category}
              </Badge>
              <Badge className={getSeverityColor(evidence.severity)}>
                {evidence.severity}
              </Badge>
              {hasImages && (
                <Badge variant="outline">
                  <ImageIcon className="h-3 w-3 mr-1" />
                  {evidence.photos.length} {evidence.photos.length === 1 ? 'photo' : 'photos'}
                </Badge>
              )}
            </div>

            {evidence.description && (
              <div className="space-y-2">
                <h4 className="font-semibold">Overall Description</h4>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {evidence.description}
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(evidence.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
            </div>

            {hasImages && evidence.photos.length > 1 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">All Photos</h4>
                <div className="grid grid-cols-4 gap-2">
                  {evidence.photos.map((photo, idx) => {
                    const photoCaption = captions.find(c => c.photo_path === photo.path);
                    return (
                      <button
                        key={photo.path}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          "relative aspect-square rounded-md overflow-hidden border-2 transition-all group",
                          idx === currentImageIndex ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img
                          src={photo.url}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {photoCaption?.label && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 py-0.5 truncate">
                            {photoCaption.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
