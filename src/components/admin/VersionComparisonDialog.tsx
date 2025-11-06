import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Backup {
  id: string;
  display_name: string;
  subject_template: string;
  html_content: string;
  backed_up_at: string;
  backup_reason: string;
  backup_notes?: string;
}

interface VersionComparisonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backup: Backup;
}

export function VersionComparisonDialog({
  open,
  onOpenChange,
  backup,
}: VersionComparisonDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Backup Preview: {backup.display_name}</DialogTitle>
          <DialogDescription>
            Backed up on {format(new Date(backup.backed_up_at), "PPp")} •{" "}
            {backup.backup_reason.replace("-", " ")}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {backup.backup_notes && (
              <div>
                <h4 className="font-medium mb-2">Backup Notes</h4>
                <p className="text-sm text-muted-foreground">{backup.backup_notes}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Subject Template</h4>
              <div className="bg-muted p-3 rounded-md">
                <code className="text-sm">{backup.subject_template}</code>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">HTML Content Preview</h4>
              <div className="border rounded-md p-4 bg-background">
                <div
                  dangerouslySetInnerHTML={{ __html: backup.html_content }}
                  className="prose prose-sm max-w-none"
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
