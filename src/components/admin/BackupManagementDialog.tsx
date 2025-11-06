import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface BackupManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  onCreateBackup: (notes: string) => Promise<void>;
}

export function BackupManagementDialog({
  open,
  onOpenChange,
  templateName,
  onCreateBackup,
}: BackupManagementDialogProps) {
  const [notes, setNotes] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await onCreateBackup(notes);
      setNotes("");
      onOpenChange(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Manual Backup</DialogTitle>
          <DialogDescription>
            Create a backup of "{templateName}" with optional notes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Backup Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Before major redesign, Stable version before testing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Backup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
