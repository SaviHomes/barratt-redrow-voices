import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, ExternalLink, Newspaper } from "lucide-react";
import { format } from "date-fns";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  article_url: string;
  source: string;
  article_date: string;
  thumbnail_url: string | null;
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  order_index: number;
}

interface ArticleFormData {
  title: string;
  description: string;
  article_url: string;
  source: string;
  article_date: string;
  thumbnail_url: string;
}

export default function AdminArticles() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    description: "",
    article_url: "",
    source: "",
    article_date: "",
    thumbnail_url: "",
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchArticles();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsAdmin(!!data);
      
      if (!data) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges to view this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .order('order_index', { ascending: true })
        .order('article_date', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch news articles.",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setEditingArticle(null);
    setFormData({
      title: "",
      description: "",
      article_url: "",
      source: "",
      article_date: "",
      thumbnail_url: "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      description: article.description,
      article_url: article.article_url,
      source: article.source,
      article_date: article.article_date,
      thumbnail_url: article.thumbnail_url || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (approve: boolean) => {
    if (!user) return;

    try {
      const articleData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        article_url: formData.article_url.trim(),
        source: formData.source.trim(),
        article_date: formData.article_date,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        is_approved: approve,
        ...(approve && {
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        }),
      };

      if (editingArticle) {
        const { error } = await supabase
          .from('news_articles')
          .update(articleData)
          .eq('id', editingArticle.id);

        if (error) throw error;

        toast({
          title: "Article updated",
          description: approve ? "Article has been approved and published." : "Article saved as draft.",
        });
      } else {
        const { error } = await supabase
          .from('news_articles')
          .insert({
            ...articleData,
            created_by: user.id,
          });

        if (error) throw error;

        toast({
          title: "Article created",
          description: approve ? "Article has been approved and published." : "Article saved as draft.",
        });
      }

      setDialogOpen(false);
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast({
        title: "Error",
        description: "Failed to save article.",
        variant: "destructive",
      });
    }
  };

  const toggleApproval = async (article: NewsArticle) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('news_articles')
        .update({
          is_approved: !article.is_approved,
          approved_by: !article.is_approved ? user.id : null,
          approved_at: !article.is_approved ? new Date().toISOString() : null,
        })
        .eq('id', article.id);

      if (error) throw error;

      toast({
        title: article.is_approved ? "Article unpublished" : "Article published",
        description: article.is_approved ? "Article is no longer visible to the public." : "Article is now live on the public page.",
      });

      fetchArticles();
    } catch (error) {
      console.error('Error toggling approval:', error);
      toast({
        title: "Error",
        description: "Failed to update article status.",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!articleToDelete) return;

    try {
      const { error } = await supabase
        .from('news_articles')
        .delete()
        .eq('id', articleToDelete);

      if (error) throw error;

      toast({
        title: "Article deleted",
        description: "The article has been permanently removed.",
      });

      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast({
        title: "Error",
        description: "Failed to delete article.",
        variant: "destructive",
      });
    }
  };

  const moveArticle = async (article: NewsArticle, direction: 'up' | 'down') => {
    const currentIndex = articles.findIndex(a => a.id === article.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === articles.length - 1)
    ) {
      return;
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const swapArticle = articles[swapIndex];

    try {
      const { error: error1 } = await supabase
        .from('news_articles')
        .update({ order_index: swapArticle.order_index })
        .eq('id', article.id);

      const { error: error2 } = await supabase
        .from('news_articles')
        .update({ order_index: article.order_index })
        .eq('id', swapArticle.id);

      if (error1 || error2) throw error1 || error2;

      toast({
        title: "Article reordered",
        description: "Article position updated successfully.",
      });

      fetchArticles();
    } catch (error) {
      console.error('Error reordering article:', error);
      toast({
        title: "Error",
        description: "Failed to reorder article.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Button onClick={() => navigate('/admin')} variant="default">
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Newspaper className="h-5 w-5" />
                    News Articles Management
                  </CardTitle>
                  <CardDescription>
                    Manage public interest articles about Barratt Redrow
                  </CardDescription>
                </div>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Article
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {articles.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Newspaper className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No articles yet. Click "Add Article" to create one.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Thumbnail</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {articles.map((article, index) => (
                      <TableRow key={article.id}>
                        <TableCell>
                          {article.thumbnail_url ? (
                            <img
                              src={article.thumbnail_url}
                              alt={article.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                              <Newspaper className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{article.title}</TableCell>
                        <TableCell>{article.source}</TableCell>
                        <TableCell>{format(new Date(article.article_date), 'dd MMM yyyy')}</TableCell>
                        <TableCell>
                          {article.is_approved ? (
                            <Badge variant="default">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveArticle(article, 'up')}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => moveArticle(article, 'down')}
                              disabled={index === articles.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(article.article_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(article)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleApproval(article)}
                            >
                              {article.is_approved ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setArticleToDelete(article.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingArticle ? 'Edit Article' : 'Add New Article'}</DialogTitle>
            <DialogDescription>
              {editingArticle ? 'Update the article details below.' : 'Enter the article details below.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Article Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter article headline"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief summary of the article (max 500 characters)"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>
            <div>
              <Label htmlFor="article_url">Article URL *</Label>
              <Input
                id="article_url"
                type="url"
                value={formData.article_url}
                onChange={(e) => setFormData({ ...formData, article_url: e.target.value })}
                placeholder="https://example.com/article"
              />
            </div>
            <div>
              <Label htmlFor="source">Source *</Label>
              <Input
                id="source"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g., The Guardian, BBC News"
              />
            </div>
            <div>
              <Label htmlFor="article_date">Article Date *</Label>
              <Input
                id="article_date"
                type="date"
                value={formData.article_date}
                onChange={(e) => setFormData({ ...formData, article_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="thumbnail_url">Thumbnail URL (optional)</Label>
              <Input
                id="thumbnail_url"
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => handleSave(false)}>
              Save as Draft
            </Button>
            <Button onClick={() => handleSave(true)}>
              Save & Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this article. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
