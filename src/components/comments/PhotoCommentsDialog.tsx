import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import PhotoCommentForm from "./PhotoCommentForm";
import PhotoCommentsList from "./PhotoCommentsList";

interface PhotoCommentsDialogProps {
  photo: {
    captionId: string;
    name: string;
    url: string;
    label?: string;
    path: string;
  } | null;
  evidenceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PhotoCommentsDialog({ 
  photo, 
  evidenceId, 
  open, 
  onOpenChange 
}: PhotoCommentsDialogProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const isVideo = (filename: string) => {
    const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
    return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['photo-comments', photo?.captionId, refreshKey],
    queryFn: async () => {
      if (!photo?.captionId) return [];
      
      const { data, error } = await supabase
        .from('photo_comments')
        .select('*')
        .eq('photo_caption_id', photo.captionId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!photo?.captionId && open
  });

  const handleCommentSubmitted = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            Comments on: {photo.label || "Photo"}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Photo/Video Preview */}
            <div className="relative rounded-lg overflow-hidden bg-muted max-h-[300px] flex items-center justify-center">
              {isVideo(photo.name) ? (
                <div className="relative w-full">
                  <video
                    src={photo.url}
                    className="w-full h-auto max-h-[300px] object-contain"
                    controls
                    preload="metadata"
                  />
                  <Badge className="absolute top-2 left-2">Video</Badge>
                </div>
              ) : (
                <img
                  src={photo.url}
                  alt={photo.label || "Evidence photo"}
                  className="w-full h-auto max-h-[300px] object-contain"
                />
              )}
            </div>

            {/* Comments Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Comments ({comments.length})
              </h3>
              <PhotoCommentsList 
                comments={comments} 
                isLoading={isLoading}
              />
            </div>

            {/* Comment Form */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
              <PhotoCommentForm
                photoCaptionId={photo.captionId}
                onCommentSubmitted={handleCommentSubmitted}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
