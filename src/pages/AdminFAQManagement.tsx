import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, HelpCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

const FAQ_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "claims", label: "Claims & Compensation" },
  { value: "complaints", label: "Complaints" },
  { value: "platform", label: "Platform Usage" },
  { value: "legal", label: "Legal" },
  { value: "glo", label: "Group Litigation" },
];

export default function AdminFAQManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [deletingFAQ, setDeletingFAQ] = useState<FAQ | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category: "general",
    is_published: true,
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchFAQs();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (error || !data) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from("faqs")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      });
    }
  };

  const handleAddFAQ = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      toast({
        title: "Error",
        description: "Question and answer are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const maxOrder = faqs.length > 0 ? Math.max(...faqs.map(f => f.order_index)) : 0;
      
      const { error } = await supabase.from("faqs").insert([{
        ...newFAQ,
        order_index: maxOrder + 1,
      }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ added successfully",
      });

      setNewFAQ({ question: "", answer: "", category: "general", is_published: true });
      setAddDialogOpen(false);
      fetchFAQs();
    } catch (error) {
      console.error("Error adding FAQ:", error);
      toast({
        title: "Error",
        description: "Failed to add FAQ",
        variant: "destructive",
      });
    }
  };

  const handleEditFAQ = async () => {
    if (!editingFAQ) return;

    try {
      const { error } = await supabase
        .from("faqs")
        .update({
          question: editingFAQ.question,
          answer: editingFAQ.answer,
          category: editingFAQ.category,
          is_published: editingFAQ.is_published,
        })
        .eq("id", editingFAQ.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ updated successfully",
      });

      setEditDialogOpen(false);
      setEditingFAQ(null);
      fetchFAQs();
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast({
        title: "Error",
        description: "Failed to update FAQ",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFAQ = async () => {
    if (!deletingFAQ) return;

    try {
      const { error } = await supabase
        .from("faqs")
        .delete()
        .eq("id", deletingFAQ.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });

      setDeletingFAQ(null);
      fetchFAQs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = async (faq: FAQ) => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id);
    if (currentIndex <= 0) return;

    const previousFAQ = faqs[currentIndex - 1];

    try {
      await supabase.from("faqs").update({ order_index: previousFAQ.order_index }).eq("id", faq.id);
      await supabase.from("faqs").update({ order_index: faq.order_index }).eq("id", previousFAQ.id);
      
      fetchFAQs();
    } catch (error) {
      console.error("Error reordering FAQ:", error);
      toast({
        title: "Error",
        description: "Failed to reorder FAQ",
        variant: "destructive",
      });
    }
  };

  const handleMoveDown = async (faq: FAQ) => {
    const currentIndex = faqs.findIndex(f => f.id === faq.id);
    if (currentIndex >= faqs.length - 1) return;

    const nextFAQ = faqs[currentIndex + 1];

    try {
      await supabase.from("faqs").update({ order_index: nextFAQ.order_index }).eq("id", faq.id);
      await supabase.from("faqs").update({ order_index: faq.order_index }).eq("id", nextFAQ.id);
      
      fetchFAQs();
    } catch (error) {
      console.error("Error reordering FAQ:", error);
      toast({
        title: "Error",
        description: "Failed to reorder FAQ",
        variant: "destructive",
      });
    }
  };

  const togglePublish = async (faq: FAQ) => {
    try {
      const { error } = await supabase
        .from("faqs")
        .update({ is_published: !faq.is_published })
        .eq("id", faq.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `FAQ ${!faq.is_published ? "published" : "unpublished"} successfully`,
      });

      fetchFAQs();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Error",
        description: "Failed to update FAQ status",
        variant: "destructive",
      });
    }
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || faq.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
              </div>
              <h1 className="text-3xl font-bold">FAQ Management</h1>
              <p className="text-muted-foreground">Manage frequently asked questions</p>
            </div>
            
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New FAQ</DialogTitle>
                  <DialogDescription>Create a new frequently asked question</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="new-question">Question</Label>
                    <Input
                      id="new-question"
                      value={newFAQ.question}
                      onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                      placeholder="Enter question"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-answer">Answer</Label>
                    <Textarea
                      id="new-answer"
                      value={newFAQ.answer}
                      onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                      placeholder="Enter answer"
                      rows={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-category">Category</Label>
                    <Select value={newFAQ.category} onValueChange={(value) => setNewFAQ({ ...newFAQ, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FAQ_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="new-published">Published</Label>
                    <Switch
                      id="new-published"
                      checked={newFAQ.is_published}
                      onCheckedChange={(checked) => setNewFAQ({ ...newFAQ, is_published: checked })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddFAQ}>Add FAQ</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {FAQ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFAQs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No FAQs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFAQs.map((faq, index) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium">{faq.order_index}</TableCell>
                        <TableCell className="max-w-md truncate">{faq.question}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {FAQ_CATEGORIES.find(c => c.value === faq.category)?.label || faq.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={faq.is_published ? "default" : "outline"}>
                            {faq.is_published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveUp(faq)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveDown(faq)}
                              disabled={index === filteredFAQs.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => togglePublish(faq)}
                            >
                              {faq.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingFAQ(faq);
                                setEditDialogOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingFAQ(faq)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the frequently asked question</DialogDescription>
          </DialogHeader>
          {editingFAQ && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-question">Question</Label>
                <Input
                  id="edit-question"
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-answer">Answer</Label>
                <Textarea
                  id="edit-answer"
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select 
                  value={editingFAQ.category} 
                  onValueChange={(value) => setEditingFAQ({ ...editingFAQ, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAQ_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-published">Published</Label>
                <Switch
                  id="edit-published"
                  checked={editingFAQ.is_published}
                  onCheckedChange={(checked) => setEditingFAQ({ ...editingFAQ, is_published: checked })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditFAQ}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingFAQ} onOpenChange={() => setDeletingFAQ(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-semibold">{deletingFAQ?.question}</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFAQ} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
