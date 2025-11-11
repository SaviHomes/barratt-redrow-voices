import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, X, Upload, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface EvidencePhoto {
  name: string;
  path: string;
  url: string;
  size: number;
  created_at: string;
  caption?: string | null;
  label?: string | null;
}

interface Evidence {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  photos: EvidencePhoto[];
}

interface EditEvidenceDialogProps {
  evidence: Evidence | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

function SortablePhotoItem({ 
  photo, 
  onDelete, 
  onEdit,
  onCaptionChange,
  onLabelChange,
  isEditing,
  loading 
}: { 
  photo: EvidencePhoto; 
  onDelete: () => void; 
  onEdit: () => void;
  onCaptionChange: (caption: string) => void;
  onLabelChange: (label: string) => void;
  isEditing: boolean;
  loading: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.path });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasCaption = !!(photo.caption || photo.label);

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-1 left-1 bg-black/50 text-white rounded p-1 cursor-grab active:cursor-grabbing z-10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      
      <div 
        onClick={onEdit}
        className="cursor-pointer relative"
      >
        <img
          src={photo.url}
          alt={photo.label || photo.name}
          className={cn(
            "w-full h-32 object-cover rounded border transition-all",
            isEditing ? "border-primary border-2" : "border-border",
            hasCaption && "ring-2 ring-blue-400 ring-offset-2"
          )}
        />
        
        {hasCaption && !isEditing && (
          <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
            {photo.label || "Captioned"}
          </div>
        )}
      </div>
      
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        disabled={loading}
      >
        <X className="h-4 w-4" />
      </button>
      
      {isEditing && (
        <div className="mt-2 space-y-2 p-2 bg-muted rounded border border-border">
          <div>
            <Label className="text-xs">Label (optional)</Label>
            <Input
              value={photo.label || ""}
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder="e.g., Front view, Close-up"
              className="h-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <Label className="text-xs">Caption (optional)</Label>
            <Textarea
              value={photo.caption || ""}
              onChange={(e) => onCaptionChange(e.target.value)}
              placeholder="Describe what's shown in this photo..."
              className="min-h-[60px] text-sm"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="w-full"
          >
            Done
          </Button>
        </div>
      )}
    </div>
  );
}

export function EditEvidenceDialog({ evidence, open, onOpenChange, onUpdate }: EditEvidenceDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [photos, setPhotos] = useState<EvidencePhoto[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletePhotoPath, setDeletePhotoPath] = useState<string | null>(null);
  const [editingPhotoPath, setEditingPhotoPath] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (evidence) {
      setTitle(evidence.title);
      setDescription(evidence.description || "");
      setCategory(evidence.category);
      setSeverity(evidence.severity);
      fetchPhotosWithCaptions(evidence.id);
      setNewFiles([]);
    }
  }, [evidence]);

  const fetchPhotosWithCaptions = async (evidenceId: string) => {
    try {
      const { data: photoCaptions, error } = await supabase
        .from("evidence_photo_captions")
        .select("photo_path, caption, label, order_index")
        .eq("evidence_id", evidenceId)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      
      const photosWithCaptions = (evidence?.photos || []).map(photo => {
        const captionData = photoCaptions?.find(c => c.photo_path === photo.path);
        return {
          ...photo,
          caption: captionData?.caption || null,
          label: captionData?.label || null,
        };
      });
      
      setPhotos(photosWithCaptions);
    } catch (error) {
      console.error("Error fetching captions:", error);
      setPhotos(evidence?.photos || []);
    }
  };

  const handleDeletePhoto = async (photoPath: string) => {
    if (!evidence) return;

    setLoading(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("evidence-photos")
        .remove([photoPath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("evidence_photo_captions")
        .delete()
        .eq("evidence_id", evidence.id)
        .eq("photo_path", photoPath);

      if (dbError) throw dbError;

      setPhotos(photos.filter(p => p.path !== photoPath));
      toast({ title: "Photo deleted successfully" });
    } catch (error: any) {
      toast({ 
        title: "Error deleting photo", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setDeletePhotoPath(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewFiles([...newFiles, ...files]);
  };

  const handleRemoveNewFile = (index: number) => {
    setNewFiles(newFiles.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex((item) => item.path === active.id);
        const newIndex = items.findIndex((item) => item.path === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleCaptionChange = (photoPath: string, caption: string) => {
    setPhotos(photos.map(p => 
      p.path === photoPath ? { ...p, caption } : p
    ));
  };

  const handleLabelChange = (photoPath: string, label: string) => {
    setPhotos(photos.map(p => 
      p.path === photoPath ? { ...p, label } : p
    ));
  };

  const togglePhotoEditor = (photoPath: string) => {
    setEditingPhotoPath(editingPhotoPath === photoPath ? null : photoPath);
  };

  const handleSave = async () => {
    if (!evidence) return;
    if (!title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Update evidence details
      const { error: updateError } = await supabase
        .from("evidence")
        .update({
          title: title.trim(),
          description: description.trim() || null,
          category,
          severity,
          updated_at: new Date().toISOString()
        })
        .eq("id", evidence.id);

      if (updateError) throw updateError;

      // Update photo order, captions, and labels
      if (photos.length > 0) {
        for (let i = 0; i < photos.length; i++) {
          const { error: updateError } = await supabase
            .from("evidence_photo_captions")
            .update({ 
              order_index: i,
              caption: photos[i].caption || null,
              label: photos[i].label || null
            })
            .eq("evidence_id", evidence.id)
            .eq("photo_path", photos[i].path);
            
          if (updateError) throw updateError;
        }
      }

      // Upload new photos if any
      if (newFiles.length > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        for (const file of newFiles) {
          const fileExt = file.name.split('.').pop();
          const filePath = `${user.id}/${evidence.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("evidence-photos")
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Add to captions table
          const { error: captionError } = await supabase
            .from("evidence_photo_captions")
            .insert({
              evidence_id: evidence.id,
              photo_path: filePath,
              order_index: photos.length + newFiles.indexOf(file)
            });

          if (captionError) throw captionError;
        }
      }

      toast({ title: "Evidence updated successfully" });
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({ 
        title: "Error updating evidence", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Evidence</DialogTitle>
            <DialogDescription>
              Update the details of your evidence, manage photos, and modify categories.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter evidence title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="structural">Structural</SelectItem>
                    <SelectItem value="cosmetic">Cosmetic</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="heating">Heating</SelectItem>
                    <SelectItem value="roofing">Roofing</SelectItem>
                    <SelectItem value="windows">Windows & Doors</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>
                Existing Photos ({photos.length})
                <span className="text-xs text-muted-foreground ml-2">
                  Click on a photo to add captions
                </span>
              </Label>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={photos.map(p => p.path)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {photos.map((photo) => (
                      <SortablePhotoItem
                        key={photo.path}
                        photo={photo}
                        onDelete={() => setDeletePhotoPath(photo.path)}
                        onEdit={() => togglePhotoEditor(photo.path)}
                        onCaptionChange={(caption) => handleCaptionChange(photo.path, caption)}
                        onLabelChange={(label) => handleLabelChange(photo.path, label)}
                        isEditing={editingPhotoPath === photo.path}
                        loading={loading}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            <div>
              <Label>Add New Photos</Label>
              <div className="mt-2">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                {newFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {newFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveNewFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletePhotoPath} onOpenChange={() => setDeletePhotoPath(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePhotoPath && handleDeletePhoto(deletePhotoPath)}
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
