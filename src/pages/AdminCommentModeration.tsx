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
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Eye, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { CommentViewDialog } from "@/components/comments/CommentViewDialog";
import { useAuth } from "@/hooks/useAuth";

interface Comment {
  id: string;
  evidence_id: string;
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
}

const AdminCommentModeration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ['admin-comments', activeTab, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('evidence_comments')
        .select(`
          *,
          evidence:evidence_id (title)
        `)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('moderation_status', activeTab);
      }

      if (searchTerm) {
        query = query.or(`commenter_name.ilike.%${searchTerm}%,commenter_email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Comment[];
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ commentId, status, reason }: { commentId: string; status: string; reason?: string }) => {
      const { error } = await supabase
        .from('evidence_comments')
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

  const handleApprove = (commentId: string) => {
    moderateMutation.mutate({ commentId, status: 'approved' });
  };

  const handleDeclineClick = (comment: Comment) => {
    setSelectedComment(comment);
    setDeclineDialogOpen(true);
  };

  const handleDeclineConfirm = () => {
    if (selectedComment) {
      moderateMutation.mutate({
        commentId: selectedComment.id,
        status: 'rejected',
        reason: rejectionReason,
      });
    }
  };

  const handleViewClick = (comment: Comment) => {
    setSelectedComment(comment);
    setViewDialogOpen(true);
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

        <div className="mb-6">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
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
                      <TableHead>Evidence</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Comment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comments?.map((comment) => (
                      <TableRow key={comment.id}>
                        <TableCell className="font-medium">
                          {comment.evidence?.title || 'N/A'}
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
                                  onClick={() => handleApprove(comment.id)}
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
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
      </div>
    </Layout>
  );
};

export default AdminCommentModeration;
