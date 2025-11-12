import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import BackToDashboard from "@/components/BackToDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Eye, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { CommentViewDialog } from "@/components/comments/CommentViewDialog";
import { useAuth } from "@/hooks/useAuth";

interface Comment {
  id: string;
  evidence_id?: string;
  photo_caption_id?: string;
  commenter_name: string;
  commenter_email: string;
  comment_text: string;
  moderation_status: string;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
  evidence?: {
    title: string;
  };
  evidence_photo_captions?: {
    label?: string;
    photo_path: string;
    evidence_id: string;
  };
}

const AdminCommentModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [commentType, setCommentType] = useState<"all" | "evidence" | "photo">("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ['admin-comments', activeTab, searchTerm, commentType],
    queryFn: async () => {
      // Fetch evidence comments
      let evidenceQuery = supabase
        .from('evidence_comments')
        .select(`
          *,
          evidence:evidence_id (title)
        `)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        evidenceQuery = evidenceQuery.eq('moderation_status', activeTab);
      }

      if (searchTerm) {
        evidenceQuery = evidenceQuery.or(`commenter_name.ilike.%${searchTerm}%,commenter_email.ilike.%${searchTerm}%`);
      }

      // Fetch photo comments
      let photoQuery = supabase
        .from('photo_comments')
        .select(`
          *,
          evidence_photo_captions:photo_caption_id (
            label,
            photo_path,
            evidence_id
          )
        `)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        photoQuery = photoQuery.eq('moderation_status', activeTab);
      }

      if (searchTerm) {
        photoQuery = photoQuery.or(`commenter_name.ilike.%${searchTerm}%,commenter_email.ilike.%${searchTerm}%`);
      }

      let allComments: Comment[] = [];

      if (commentType === 'all' || commentType === 'evidence') {
        const { data: evidenceData, error: evidenceError } = await evidenceQuery;
        if (evidenceError) throw evidenceError;
        allComments = [...allComments, ...(evidenceData as Comment[])];
      }

      if (commentType === 'all' || commentType === 'photo') {
        const { data: photoData, error: photoError } = await photoQuery;
        if (photoError) throw photoError;
        allComments = [...allComments, ...(photoData as Comment[])];
      }

      // Sort by created_at descending
      allComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return allComments;
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ commentId, status, reason, isPhotoComment }: { 
      commentId: string; 
      status: string; 
      reason?: string;
      isPhotoComment?: boolean;
    }) => {
      const table = isPhotoComment ? 'photo_comments' : 'evidence_comments';
      const { error } = await supabase
        .from(table)
        .update({
          moderation_status: status,
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id,
          rejection_reason: reason || null,
        })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({
        title: "Success",
        description: `Comment ${variables.status === 'approved' ? 'approved' : 'declined'} successfully.`,
      });
      setDeclineDialogOpen(false);
      setRejectionReason("");
    },
    onError: (error) => {
      console.error('Error moderating comment:', error);
      toast({
        title: "Error",
        description: "Failed to moderate comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ commentId, isPhotoComment }: { 
      commentId: string; 
      isPhotoComment: boolean;
    }) => {
      const table = isPhotoComment ? 'photo_comments' : 'evidence_comments';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (commentId: string, isPhotoComment: boolean) => {
    moderateMutation.mutate({ commentId, status: 'approved', isPhotoComment });
  };

  const handleDeclineClick = (comment: Comment) => {
    setSelectedComment(comment);
    setDeclineDialogOpen(true);
  };

  const handleDeclineConfirm = () => {
    if (selectedComment) {
      const isPhotoComment = !!selectedComment.photo_caption_id;
      moderateMutation.mutate({
        commentId: selectedComment.id,
        status: 'rejected',
        reason: rejectionReason,
        isPhotoComment,
      });
    }
  };

  const handleViewClick = (comment: Comment) => {
    setSelectedComment(comment);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (comment: Comment) => {
    setSelectedComment(comment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedComment) {
      const isPhotoComment = !!selectedComment.photo_caption_id;
      deleteMutation.mutate({
        commentId: selectedComment.id,
        isPhotoComment,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const pendingCount = comments?.filter(c => c.moderation_status === 'pending').length || 0;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <BackToDashboard />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Comment Moderation</h1>
          <p className="text-muted-foreground">
            Review and manage user comments
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Select value={commentType} onValueChange={(value: any) => setCommentType(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comments</SelectItem>
              <SelectItem value="evidence">Evidence Only</SelectItem>
              <SelectItem value="photo">Photo/Video Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">
              Pending {pendingCount > 0 && `(${pendingCount})`}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : comments?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No comments found
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments?.map((comment) => {
                      const isPhotoComment = !!comment.photo_caption_id;
                      return (
                        <TableRow key={comment.id}>
                          <TableCell>
                            <Badge variant={isPhotoComment ? "secondary" : "outline"}>
                              {isPhotoComment ? "Photo" : "Evidence"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {isPhotoComment ? (
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                  <img
                                    src={supabase.storage.from('evidence-photos').getPublicUrl(comment.evidence_photo_captions?.photo_path || '').data.publicUrl}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="text-sm">
                                  {comment.evidence_photo_captions?.label || 'Photo'}
                                </span>
                              </div>
                            ) : (
                              comment.evidence?.title || 'N/A'
                            )}
                          </TableCell>
                          <TableCell>{comment.commenter_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {comment.commenter_email}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {comment.comment_text}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>{getStatusBadge(comment.moderation_status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewClick(comment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {comment.moderation_status === 'pending' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApprove(comment.id, isPhotoComment)}
                                  disabled={moderateMutation.isPending}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeclineClick(comment)}
                                  disabled={moderateMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(comment)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <CommentViewDialog
          comment={selectedComment}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />

        <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Decline Comment</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to decline this comment? You can optionally add a reason for internal tracking.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <Label htmlFor="rejection_reason">Rejection Reason (Optional)</Label>
              <Textarea
                id="rejection_reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for declining this comment..."
                className="mt-2"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeclineConfirm}>
                Decline Comment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Comment Permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this comment. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {selectedComment && (
              <div className="py-4 space-y-2">
                <div>
                  <span className="font-semibold">Commenter:</span> {selectedComment.commenter_name}
                </div>
                <div>
                  <span className="font-semibold">Comment:</span>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                    {selectedComment.comment_text}
                  </p>
                </div>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Comment
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default AdminCommentModeration;
