import { formatDistanceToNow } from "date-fns";
import { Card } from "@/components/ui/card";

interface PhotoComment {
  id: string;
  commenter_name: string;
  comment_text: string;
  created_at: string;
}

interface PhotoCommentsListProps {
  comments: PhotoComment[];
  isLoading: boolean;
}

export default function PhotoCommentsList({ comments, isLoading }: PhotoCommentsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No comments yet. Be the first to comment!
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      {comments.map(comment => (
        <Card key={comment.id} className="p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-foreground">
              {comment.commenter_name}
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-foreground whitespace-pre-wrap">
            {comment.comment_text}
          </p>
        </Card>
      ))}
    </div>
  );
}
