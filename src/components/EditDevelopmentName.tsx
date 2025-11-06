import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil } from "lucide-react";

interface EditDevelopmentNameProps {
  userId: string;
  currentName: string | null;
  onUpdate: () => void;
}

export default function EditDevelopmentName({ userId, currentName, onUpdate }: EditDevelopmentNameProps) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState(currentName || "");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ development_name: newName || null })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Development name updated successfully",
      });
      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating development name:", error);
      toast({
        title: "Error",
        description: "Failed to update development name",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Development Name</DialogTitle>
          <DialogDescription>
            Update the development name for consistency across the platform
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., The Meadows, Riverside Park, etc."
            maxLength={100}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
