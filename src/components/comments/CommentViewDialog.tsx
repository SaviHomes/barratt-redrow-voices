import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Comment {
  id: string;
  commenter_name: string;
  commenter_email: string;
  comment_text: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface CommentViewDialogProps {
  comment: Comment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CommentViewDialog = ({ comment, open, onOpenChange }: CommentViewDialogProps) => {
  if (!comment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-1">Commenter</h4>
            <p>{comment.commenter_name}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Email</h4>
            <p className="text-muted-foreground">{comment.commenter_email}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Submitted</h4>
            <p className="text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-1">Comment</h4>
            <p className="whitespace-pre-wrap bg-muted p-4 rounded-md">
              {comment.comment_text}
            </p>
          </div>

          {comment.ip_address && (
            <div>
              <h4 className="font-semibold mb-1">IP Address</h4>
              <p className="text-muted-foreground text-sm">{comment.ip_address}</p>
            </div>
          )}

          {comment.user_agent && (
            <div>
              <h4 className="font-semibold mb-1">User Agent</h4>
              <p className="text-muted-foreground text-sm break-all">{comment.user_agent}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
