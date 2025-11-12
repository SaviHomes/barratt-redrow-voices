import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { triggerEventEmail } from "@/lib/emailTriggers";

const photoCommentSchema = z.object({
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
    .max(500, "Comment must be less than 500 characters")
});

type PhotoCommentFormData = z.infer<typeof photoCommentSchema>;

interface PhotoCommentFormProps {
  photoCaptionId: string;
  onCommentSubmitted: () => void;
}

export default function PhotoCommentForm({ 
  photoCaptionId, 
  onCommentSubmitted 
}: PhotoCommentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<PhotoCommentFormData>({
    resolver: zodResolver(photoCommentSchema),
    defaultValues: {
      commenter_name: "",
      commenter_email: "",
      comment_text: ""
    }
  });

  const commentText = watch("comment_text");
  const charCount = commentText?.length || 0;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          setValue('commenter_name', `${profile.first_name} ${profile.last_name}`);
        }
        
        if (user.email) {
          setValue('commenter_email', user.email);
        }
      }
    };

    fetchUserProfile();
  }, [user, setValue]);

  const onSubmit = async (data: PhotoCommentFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('photo_comments')
        .insert({
          photo_caption_id: photoCaptionId,
          commenter_name: data.commenter_name,
          commenter_email: data.commenter_email,
          comment_text: data.comment_text,
          user_id: user?.id || null,
        });

      if (error) throw error;

      // Fetch photo caption and evidence details for email notification
      const { data: photoCaption } = await supabase
        .from('evidence_photo_captions')
        .select('label, photo_path, evidence_id, evidence(title)')
        .eq('id', photoCaptionId)
        .single();

      if (photoCaption) {
        const photoUrl = supabase.storage
          .from('evidence-photos')
          .getPublicUrl(photoCaption.photo_path).data.publicUrl;

        // Trigger admin notification email
        await triggerEventEmail('comment_submitted', {
          commenterName: data.commenter_name,
          commenterEmail: data.commenter_email,
          commentText: data.comment_text,
          commentType: 'photo',
          photoCaptionId,
          photoLabel: photoCaption.label || 'Photo',
          photoUrl,
          evidenceTitle: (photoCaption.evidence as any)?.title || 'Evidence',
          submittedAt: new Date().toISOString(),
          viewUrl: `${window.location.origin}/evidence/${photoCaption.evidence_id}`,
        });
      }

      toast({
        title: "Comment submitted!",
        description: "Your comment is pending admin approval.",
      });

      reset({
        commenter_name: data.commenter_name,
        commenter_email: data.commenter_email,
        comment_text: ""
      });
      
      onCommentSubmitted();
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="commenter_name">Name *</Label>
          <Input
            id="commenter_name"
            {...register("commenter_name")}
            placeholder="Your name"
          />
          {errors.commenter_name && (
            <p className="text-sm text-destructive">{errors.commenter_name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="commenter_email">Email *</Label>
          <Input
            id="commenter_email"
            type="email"
            {...register("commenter_email")}
            placeholder="your.email@example.com"
          />
          {errors.commenter_email && (
            <p className="text-sm text-destructive">{errors.commenter_email.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment_text">Comment *</Label>
        <Textarea
          id="comment_text"
          {...register("comment_text")}
          placeholder="Share your thoughts about this photo or video..."
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-between items-center">
          <div>
            {errors.comment_text && (
              <p className="text-sm text-destructive">{errors.comment_text.message}</p>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {charCount}/500
          </p>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Comment
      </Button>
    </form>
  );
}
