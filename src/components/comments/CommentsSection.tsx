import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CommentForm } from "./CommentForm";
import { CommentsList } from "./CommentsList";

interface Comment {
  id: string;
  commenter_name: string;
  comment_text: string;
  created_at: string;
}

interface CommentsSectionProps {
  evidenceId: string;
}

export const CommentsSection = ({ evidenceId }: CommentsSectionProps) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['evidence-comments', evidenceId, refreshKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evidence_comments')
        .select('id, commenter_name, comment_text, created_at')
        .eq('evidence_id', evidenceId)
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    },
  });

  const handleCommentSubmitted = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground">
          Comments ({comments.length})
        </h2>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : (
          <CommentsList comments={comments} />
        )}
      </div>

      <CommentForm 
        evidenceId={evidenceId} 
        onCommentSubmitted={handleCommentSubmitted}
      />
    </div>
  );
};
