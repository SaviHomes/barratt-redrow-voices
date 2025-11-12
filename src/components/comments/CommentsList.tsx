import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface Comment {
  id: string;
  commenter_name: string;
  comment_text: string;
  created_at: string;
}

interface CommentsListProps {
  comments: Comment[];
}

export const CommentsList = ({ comments }: CommentsListProps) => {
  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No comments yet. Be the first to share your thoughts!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <div key={comment.id}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-baseline gap-2 mb-2">
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
            </CardContent>
          </Card>
          {index < comments.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  );
};
