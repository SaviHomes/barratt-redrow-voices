import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Eye, EyeOff, Pencil, Trash2, ExternalLink, ArrowUp, ArrowDown, Share2, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

interface SocialPost {
  id: string;
  title: string;
  description: string;
  post_url: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  company: 'redrow' | 'barratt' | 'both';
  creator_name: string;
  creator_handle: string | null;
  thumbnail_url: string | null;
  post_date: string;
  is_approved: boolean;
  order_index: number;
  created_at: string;
}

const platformConfig = {
  facebook: { icon: Facebook, label: 'Facebook' },
  instagram: { icon: Instagram, label: 'Instagram' },
  tiktok: { icon: Share2, label: 'TikTok' },
  youtube: { icon: Youtube, label: 'YouTube' },
  twitter: { icon: Twitter, label: 'Twitter/X' }
};

export default function AdminSocials() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [deletePost, setDeletePost] = useState<SocialPost | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postUrl, setPostUrl] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [creatorName, setCreatorName] = useState("");
  const [creatorHandle, setCreatorHandle] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [postDate, setPostDate] = useState<Date | undefined>(new Date());

  // Check admin status
  const { data: isAdmin, isLoading: checkingAdmin } = useQuery({
    queryKey: ['admin-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
      return !!data;
    },
    enabled: !!user
  });

  // Fetch all social posts
  const { data: posts, isLoading: loadingPosts } = useQuery({
    queryKey: ['admin-social-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('order_index', { ascending: true })
        .order('post_date', { ascending: false });

      if (error) throw error;
      return data as SocialPost[];
    },
    enabled: isAdmin === true
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { isApproved: boolean }) => {
      const postData = {
        title,
        description,
        post_url: postUrl,
        platform,
        company,
        creator_name: creatorName,
        creator_handle: creatorHandle || null,
        thumbnail_url: thumbnailUrl || null,
        post_date: postDate ? format(postDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        is_approved: data.isApproved,
        created_by: user?.id
      };

      if (editingPost) {
        const { error } = await supabase
          .from('social_posts')
          .update(postData)
          .eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('social_posts')
          .insert([postData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast({
        title: editingPost ? "Post Updated" : "Post Created",
        description: editingPost ? "Social post has been updated successfully" : "Social post has been created successfully"
      });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Toggle approval
  const toggleApprovalMutation = useMutation({
    mutationFn: async (post: SocialPost) => {
      const { error } = await supabase
        .from('social_posts')
        .update({ is_approved: !post.is_approved })
        .eq('id', post.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast({
        title: "Status Updated",
        description: "Post approval status has been updated"
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-posts'] });
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast({
        title: "Post Deleted",
        description: "Social post has been deleted successfully"
      });
      setDeletePost(null);
    }
  });

  // Move post
  const moveMutation = useMutation({
    mutationFn: async ({ post, direction }: { post: SocialPost; direction: 'up' | 'down' }) => {
      if (!posts) return;
      
      const currentIndex = posts.findIndex(p => p.id === post.id);
      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (swapIndex < 0 || swapIndex >= posts.length) return;
      
      const swapPost = posts[swapIndex];
      
      await supabase
        .from('social_posts')
        .update({ order_index: swapPost.order_index })
        .eq('id', post.id);
      
      await supabase
        .from('social_posts')
        .update({ order_index: post.order_index })
        .eq('id', swapPost.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-social-posts'] });
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPostUrl("");
    setPlatform("");
    setCompany("");
    setCreatorName("");
    setCreatorHandle("");
    setThumbnailUrl("");
    setPostDate(new Date());
    setEditingPost(null);
  };

  const openEditDialog = (post: SocialPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setDescription(post.description);
    setPostUrl(post.post_url);
    setPlatform(post.platform);
    setCompany(post.company);
    setCreatorName(post.creator_name);
    setCreatorHandle(post.creator_handle || "");
    setThumbnailUrl(post.thumbnail_url || "");
    setPostDate(new Date(post.post_date));
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (checkingAdmin || loadingPosts) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">Access denied. Admin privileges required.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-6 w-6" />
                Social Posts Management
              </CardTitle>
              <CardDescription>
                Manage social media content from the community
              </CardDescription>
            </div>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Social Post
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Thumbnail</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts && posts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      No social posts yet. Click "Add Social Post" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  posts?.map((post, index) => {
                    const PlatformIcon = platformConfig[post.platform].icon;
                    return (
                      <TableRow key={post.id}>
                        <TableCell>
                          {post.thumbnail_url ? (
                            <img
                              src={post.thumbnail_url}
                              alt={post.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                              <PlatformIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <PlatformIcon className="h-4 w-4" />
                            <span className="text-sm">{platformConfig[post.platform].label}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{post.company}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {post.creator_name}
                            {post.creator_handle && (
                              <div className="text-muted-foreground">@{post.creator_handle}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(post.post_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {post.is_approved ? (
                            <Badge className="bg-green-100 text-green-800">Approved</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveMutation.mutate({ post, direction: 'up' })}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveMutation.mutate({ post, direction: 'down' })}
                              disabled={!posts || index === posts.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild>
                              <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(post)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApprovalMutation.mutate(post)}
                            >
                              {post.is_approved ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletePost(post)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPost ? 'Edit Social Post' : 'Add Social Post'}</DialogTitle>
            <DialogDescription>
              {editingPost ? 'Update the social post details' : 'Add a new social media post from the community'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post headline"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summary of the post content"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{description.length}/500 characters</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postUrl">Post URL *</Label>
              <Input
                id="postUrl"
                value={postUrl}
                onChange={(e) => setPostUrl(e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform *</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger id="platform">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Company *</Label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger id="company">
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redrow">Redrow</SelectItem>
                    <SelectItem value="barratt">Barratt</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="creatorName">Creator Name *</Label>
                <Input
                  id="creatorName"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="creatorHandle">Creator Handle</Label>
                <Input
                  id="creatorHandle"
                  value={creatorHandle}
                  onChange={(e) => setCreatorHandle(e.target.value)}
                  placeholder="@username"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="postDate">Post Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {postDate ? format(postDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={postDate}
                    onSelect={setPostDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://... (optional)"
                type="url"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => saveMutation.mutate({ isApproved: false })}
              disabled={!title || !description || !postUrl || !platform || !company || !creatorName}
            >
              Save as Draft
            </Button>
            <Button
              onClick={() => saveMutation.mutate({ isApproved: true })}
              disabled={!title || !description || !postUrl || !platform || !company || !creatorName}
            >
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePost} onOpenChange={() => setDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Social Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletePost?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePost && deleteMutation.mutate(deletePost.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
