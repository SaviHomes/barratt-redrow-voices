import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";

interface Backup {
  id: string;
  template_id: string;
  display_name: string;
  backed_up_at: string;
  backup_reason: string;
}

interface RestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: Backup;
  onRestore: (backupId: string, restoreAsNew: boolean) => Promise<void>;
}

export function RestoreDialog({
  open,
  onOpenChange,
  backup,
  onRestore,
}: RestoreDialogProps) {
  const [restoreMode, setRestoreMode] = useState<"overwrite" | "new">("overwrite");
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await onRestore(backup.id, restoreMode === "new");
      onOpenChange(false);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Email Template</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to restore the backup of "{backup.display_name}" from{" "}
            {format(new Date(backup.backed_up_at), "PPp")}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-4">
          <RadioGroup value={restoreMode} onValueChange={(v: any) => setRestoreMode(v)}>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="overwrite" id="overwrite" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="overwrite" className="cursor-pointer">
                  Overwrite existing template
                </Label>
                <p className="text-sm text-muted-foreground">
                  Replace the current version with this backup
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="new" id="new" />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="new" className="cursor-pointer">
                  Restore as new template
                </Label>
                <p className="text-sm text-muted-foreground">
                  Create a new template from this backup
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
          <Button onClick={handleRestore} disabled={isRestoring}>
            {isRestoring ? "Restoring..." : "Restore Template"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
