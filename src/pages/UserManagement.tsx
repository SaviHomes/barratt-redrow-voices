import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, Mail, Phone, MapPin, Home, MessageSquare, Trash2, Image, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import EditDevelopmentName from "@/components/EditDevelopmentName";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  street_name: string;
  property_number: string | null;
  development_name: string | null;
  town_city: string;
  county: string;
  postcode: string;
  home_tel: string | null;
  mobile_tel: string | null;
  whatsapp_consent: boolean;
  nhbc_contact: boolean | null;
  social_media_consent: boolean | null;
  decision_influenced: boolean | null;
  build_style: string | null;
  advice_to_others: string | null;
  created_at: string;
}

interface EvidenceStats {
  evidence_count: number;
  photo_count: number;
  video_count: number;
  total_media_count: number;
}

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [evidenceStats, setEvidenceStats] = useState<Map<string, EvidenceStats>>(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

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
        .maybeSingle();

      if (error) {
        console.error("Error checking admin status:", error);
        toast({
          title: "Access Error",
          description: "Unable to verify admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (!data) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error:", error);
      navigate("/");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .rpc('get_users_with_emails');

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        return;
      }

      setUsers(profiles || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvidenceStats = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_evidence_stats');

      if (error) {
        console.error("Error fetching evidence stats:", error);
        return;
      }

      const statsMap = new Map<string, EvidenceStats>();
      data?.forEach((stat: any) => {
        statsMap.set(stat.user_id, {
          evidence_count: Number(stat.evidence_count),
          photo_count: Number(stat.photo_count),
          video_count: Number(stat.video_count),
          total_media_count: Number(stat.total_media_count),
        });
      });
      setEvidenceStats(statsMap);
    } catch (error) {
      console.error("Error fetching evidence stats:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await checkAdminStatus();
      if (isAdmin) {
        await fetchUsers();
        await fetchEvidenceStats();
      }
    };
    init();
  }, [user, isAdmin]);

  const formatAddress = (user: UserProfile) => {
    const parts = [
      user.property_number,
      user.street_name,
      user.town_city,
      user.county,
      user.postcode
    ].filter(Boolean);
    return parts.join(", ");
  };

  const formatPhone = (user: UserProfile) => {
    const phones = [user.home_tel, user.mobile_tel].filter(Boolean);
    return phones.join(" / ") || "Not provided";
  };

  const handleDeleteUser = async (userId: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase
        .rpc('delete_user_by_admin', { target_user_id: userId });
      
      if (error) {
        console.error('Error deleting user:', error);
        toast({
          title: "Deletion Failed",
          description: error.message || "Failed to delete user account",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "User Deleted",
        description: `Successfully deleted user account for ${firstName} ${lastName}`,
      });
      
      // Refresh user list
      await fetchUsers();
      
      // Reset to page 1 if current page becomes empty
      const newTotalPages = Math.ceil((users.length - 1) / usersPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(users.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all registered users
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Registered Users ({users.length} total{users.length > 0 && `, showing ${startIndex + 1}-${Math.min(endIndex, users.length)}`})
          </CardTitle>
          <CardDescription>
            All users who have registered on the platform with their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentUsers.map((user) => (
                <Card key={user.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="flex justify-end mb-4">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.first_name} {user.last_name}'s account?
                              This will permanently delete their profile, evidence uploads, claims, and all associated data.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.user_id, user.first_name, user.last_name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Account
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Personal Details
                        </h3>
                        <div className="space-y-2">
                          <p><span className="font-medium">Name:</span> {user.first_name} {user.last_name}</p>
                          <p><span className="font-medium">Email:</span> {user.email}</p>
                          <p><span className="font-medium">User ID:</span> <span className="text-xs">{user.user_id}</span></p>
                          <p><span className="font-medium">Registered:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contact Details
                        </h3>
                        <div className="space-y-2">
                          <p><span className="font-medium">Phone:</span> {formatPhone(user)}</p>
                          <div className="flex gap-2 flex-wrap">
                            {user.whatsapp_consent && (
                              <Badge variant="secondary">WhatsApp OK</Badge>
                            )}
                            {user.nhbc_contact && (
                              <Badge variant="secondary">NHBC Contact</Badge>
                            )}
                            {user.social_media_consent && (
                              <Badge variant="secondary">Social Media OK</Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address Information */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Address
                        </h3>
                        <div className="space-y-2">
                          <p className="text-sm">{formatAddress(user)}</p>
                          <div className="flex items-center gap-2">
                            {user.development_name ? (
                              <>
                                <p><span className="font-medium">Development:</span> {user.development_name}</p>
                                <EditDevelopmentName 
                                  userId={user.user_id} 
                                  currentName={user.development_name} 
                                  onUpdate={fetchUsers} 
                                />
                              </>
                            ) : (
                              <>
                                <p className="text-muted-foreground">No development name set</p>
                                <EditDevelopmentName 
                                  userId={user.user_id} 
                                  currentName={null} 
                                  onUpdate={fetchUsers} 
                                />
                              </>
                            )}
                          </div>
                          {user.build_style && (
                            <p><span className="font-medium">Build Style:</span> {user.build_style}</p>
                          )}
                        </div>
                      </div>

                      {/* Evidence Uploads */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Image className="h-4 w-4" />
                          Uploaded Evidence
                        </h3>
                        <div className="space-y-2">
                          {evidenceStats.get(user.user_id) ? (
                            <>
                              <p><span className="font-medium">Evidence Posts:</span> {evidenceStats.get(user.user_id)!.evidence_count}</p>
                              <p><span className="font-medium">Photos:</span> {evidenceStats.get(user.user_id)!.photo_count}</p>
                              <p><span className="font-medium">Videos:</span> {evidenceStats.get(user.user_id)!.video_count}</p>
                              <p><span className="font-medium">Total Media:</span> {evidenceStats.get(user.user_id)!.total_media_count}</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={() => navigate(`/my-evidence?userId=${user.user_id}&preview=admin`)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Evidence
                              </Button>
                            </>
                          ) : (
                            <p className="text-muted-foreground">No evidence uploaded</p>
                          )}
                        </div>
                      </div>

                      {/* Additional Information */}
                      {(user.advice_to_others || user.decision_influenced !== null) && (
                        <div className="col-span-full space-y-3">
                          <Separator />
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Additional Information
                          </h3>
                          <div className="space-y-2">
                            {user.decision_influenced !== null && (
                              <p>
                                <span className="font-medium">Decision Influenced:</span>{" "}
                                <Badge variant={user.decision_influenced ? "default" : "secondary"}>
                                  {user.decision_influenced ? "Yes" : "No"}
                                </Badge>
                              </p>
                            )}
                            {user.advice_to_others && (
                              <div>
                                <p className="font-medium mb-1">Advice to Others:</p>
                                <p className="text-sm bg-muted p-3 rounded">{user.advice_to_others}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {users.length > usersPerPage && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;