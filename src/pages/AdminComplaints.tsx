import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import { ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff, CalendarIcon, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface Complaint {
  id: string;
  title: string;
  description: string;
  location: string;
  complaint_date: string;
  source: string | null;
  source_url: string | null;
  admin_notes: string | null;
  is_published: boolean;
  created_at: string;
}

interface ComplaintFormData {
  title: string;
  description: string;
  location: string;
  complaint_date: Date | undefined;
  source: string;
  source_url: string;
  admin_notes: string;
}

const initialFormData: ComplaintFormData = {
  title: "",
  description: "",
  location: "",
  complaint_date: undefined,
  source: "",
  source_url: "",
  admin_notes: "",
};

const AdminComplaints = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<ComplaintFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          .maybeSingle();

        if (error) throw error;

        setIsAdmin(!!data);
        if (!data) {
          toast.error("Access denied. Admin privileges required.");
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, navigate]);

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Complaint[];
    },
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ComplaintFormData) => {
      const { error } = await supabase.from("complaints").insert({
        title: data.title,
        description: data.description,
        location: data.location,
        complaint_date: data.complaint_date ? format(data.complaint_date, "yyyy-MM-dd") : null,
        source: data.source || null,
        source_url: data.source_url || null,
        admin_notes: data.admin_notes || null,
        created_by: user?.id,
        is_published: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      toast.success("Complaint added successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to add complaint: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ComplaintFormData }) => {
      const { error } = await supabase
        .from("complaints")
        .update({
          title: data.title,
          description: data.description,
          location: data.location,
          complaint_date: data.complaint_date ? format(data.complaint_date, "yyyy-MM-dd") : null,
          source: data.source || null,
          source_url: data.source_url || null,
          admin_notes: data.admin_notes || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      toast.success("Complaint updated successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error("Failed to update complaint: " + error.message);
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("complaints")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      toast.success(variables.is_published ? "Complaint published" : "Complaint hidden");
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("complaints").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      toast.success("Complaint deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (complaint: Complaint) => {
    setFormData({
      title: complaint.title,
      description: complaint.description,
      location: complaint.location,
      complaint_date: complaint.complaint_date ? new Date(complaint.complaint_date) : undefined,
      source: complaint.source || "",
      source_url: complaint.source_url || "",
      admin_notes: complaint.admin_notes || "",
    });
    setEditingId(complaint.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location || !formData.complaint_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-2xl font-bold">Complaints Database Management</h1>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList>
            <TabsTrigger value="list">All Complaints ({complaints.length})</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle>Complaints List</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading...</p>
                ) : complaints.length === 0 ? (
                  <p className="text-muted-foreground">No complaints yet. Add one to get started.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((complaint) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {complaint.title}
                          </TableCell>
                          <TableCell>{complaint.location}</TableCell>
                          <TableCell>
                            {complaint.complaint_date
                              ? format(new Date(complaint.complaint_date), "MMM d, yyyy")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {complaint.source_url ? (
                              <a
                                href={complaint.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                {complaint.source || "Link"}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              complaint.source || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={complaint.is_published ? "default" : "secondary"}>
                              {complaint.is_published ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(complaint)}
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  togglePublishMutation.mutate({
                                    id: complaint.id,
                                    is_published: !complaint.is_published,
                                  })
                                }
                                title={complaint.is_published ? "Hide" : "Publish"}
                              >
                                {complaint.is_published ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" title="Delete">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Complaint</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{complaint.title}"? This action
                                      cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(complaint.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Add New Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Complaint title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Birmingham, West Midlands"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of the complaint"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.complaint_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.complaint_date
                              ? format(formData.complaint_date, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.complaint_date}
                            onSelect={(date) => setFormData({ ...formData, complaint_date: date })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source">Source Name</Label>
                      <Input
                        id="source"
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        placeholder="e.g., BBC News"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="source_url">Source URL</Label>
                      <Input
                        id="source_url"
                        type="url"
                        value={formData.source_url}
                        onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin_notes">Admin Notes (Private - not published)</Label>
                    <Textarea
                      id="admin_notes"
                      value={formData.admin_notes}
                      onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                      placeholder="Internal notes visible only to admins"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={createMutation.isPending}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Complaint
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Complaint</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-location">Location *</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description *</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.complaint_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.complaint_date
                          ? format(formData.complaint_date, "PPP")
                          : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.complaint_date}
                        onSelect={(date) => setFormData({ ...formData, complaint_date: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-source">Source Name</Label>
                  <Input
                    id="edit-source"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-source_url">Source URL</Label>
                  <Input
                    id="edit-source_url"
                    type="url"
                    value={formData.source_url}
                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-admin_notes">Admin Notes (Private)</Label>
                <Textarea
                  id="edit-admin_notes"
                  value={formData.admin_notes}
                  onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminComplaints;