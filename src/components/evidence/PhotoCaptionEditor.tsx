import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { EvidencePhoto } from "@/hooks/useEvidencePhotos";

interface PhotoCaptionEditorProps {
  photo: EvidencePhoto | null;
  evidenceId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const isVideoFile = (filename: string) => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
  return videoExtensions.some(ext => filename.toLowerCase().endsWith(ext));
};

export function PhotoCaptionEditor({ 
  photo, 
  evidenceId, 
  open, 
  onOpenChange, 
  onSave 
}: PhotoCaptionEditorProps) {
  const [label, setLabel] = useState(photo?.label || '');
  const [caption, setCaption] = useState(photo?.caption || '');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Update state when photo changes
  useState(() => {
    if (photo) {
      setLabel(photo.label || '');
      setCaption(photo.caption || '');
    }
  });

  const handleSave = async () => {
    if (!photo || !evidenceId) return;

    setSaving(true);
    try {
      if (photo.captionId) {
        // Update existing caption
        const { error } = await supabase
          .from('evidence_photo_captions')
          .update({ label, caption })
          .eq('id', photo.captionId);

        if (error) throw error;
      } else {
        // Insert new caption
        const { error } = await supabase
          .from('evidence_photo_captions')
          .insert({
            evidence_id: evidenceId,
            photo_path: photo.path,
            label,
            caption,
            order_index: 0,
          });

        if (error) throw error;
      }

      toast({
        title: "Caption saved",
        description: "Photo caption and label updated successfully.",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving caption:', error);
      toast({
        title: "Error",
        description: "Failed to save caption. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!photo?.captionId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('evidence_photo_captions')
        .delete()
        .eq('id', photo.captionId);

      if (error) throw error;

      toast({
        title: "Caption removed",
        description: "Photo caption and label removed successfully.",
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting caption:', error);
      toast({
        title: "Error",
        description: "Failed to remove caption. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!photo) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Photo Caption & Label</DialogTitle>
        </DialogHeader>

        {/* Photo preview */}
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          {isVideoFile(photo.name) ? (
            <video 
              src={photo.url} 
              controls 
              className="w-full h-full object-contain"
              playsInline
            />
          ) : (
            <img 
              src={photo.url} 
              alt={photo.label || "Evidence photo"} 
              className="w-full h-full object-contain" 
            />
          )}
        </div>

        {/* Input fields */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="label">Label (Short identifier)</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g., Front view, Close-up"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              A short label that will be displayed on the photo
            </p>
          </div>

          <div>
            <Label htmlFor="caption">Caption (Description)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe what's shown in this photo..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {caption.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {photo.captionId && (
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={saving}
              className="mr-auto"
            >
              Remove Caption
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Caption"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
