import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const commentSchema = z.object({
  commenter_name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  
  commenter_email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  
  comment_text: z.string()
    .trim()
    .min(10, "Comment must be at least 10 characters")
    .max(1000, "Comment must be less than 1000 characters")
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  evidenceId: string;
  onCommentSubmitted?: () => void;
}

export const CommentForm = ({ evidenceId, onCommentSubmitted }: CommentFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      commenter_name: "",
      commenter_email: "",
      comment_text: ""
    }
  });

  const commentText = watch("comment_text");

  useEffect(() => {
    setCharacterCount(commentText?.length || 0);
  }, [commentText]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setValue('commenter_name', `${profile.first_name} ${profile.last_name}`.trim());
        }
        setValue('commenter_email', user.email || '');
      };

      fetchUserProfile();
    }
  }, [user, setValue]);

  const onSubmit = async (data: CommentFormData) => {
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('evidence_comments')
        .insert({
          evidence_id: evidenceId,
          commenter_name: data.commenter_name,
          commenter_email: data.commenter_email,
          comment_text: data.comment_text,
          user_id: user?.id || null,
        });

      if (error) throw error;

      toast({
        title: "Comment Submitted",
        description: "Thank you! Your comment is pending admin approval.",
      });

      reset();
      onCommentSubmitted?.();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave a Comment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="commenter_name">Name *</Label>
              <Input
                id="commenter_name"
                {...register('commenter_name')}
                placeholder="Your name"
              />
              {errors.commenter_name && (
                <p className="text-sm text-destructive mt-1">{errors.commenter_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="commenter_email">Email *</Label>
              <Input
                id="commenter_email"
                type="email"
                {...register('commenter_email')}
                placeholder="your.email@example.com"
              />
              {errors.commenter_email && (
                <p className="text-sm text-destructive mt-1">{errors.commenter_email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="comment_text">Comment *</Label>
            <Textarea
              id="comment_text"
              {...register('comment_text')}
              placeholder="Share your thoughts..."
              className="min-h-[120px]"
            />
            <div className="flex justify-between items-center mt-1">
              {errors.comment_text && (
                <p className="text-sm text-destructive">{errors.comment_text.message}</p>
              )}
              <p className="text-sm text-muted-foreground ml-auto">
                {characterCount}/1000
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Comment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
