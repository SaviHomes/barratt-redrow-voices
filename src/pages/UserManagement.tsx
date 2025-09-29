import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Users, Mail, Phone, MapPin, Home, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  street_name: string;
  property_number: string | null;
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
  user_email?: string;
}

const UserManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);

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
      // Get profiles with user emails
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
        return;
      }

      // Get user emails from auth.users (we'll need to get these via RPC or edge function in production)
      // For now, we'll work with what we have in profiles
      const usersWithEmails = profiles || [];
      setUsers(usersWithEmails);
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

  useEffect(() => {
    const init = async () => {
      await checkAdminStatus();
      if (isAdmin) {
        await fetchUsers();
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
          <CardTitle>Registered Users ({users.length})</CardTitle>
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
              {users.map((user) => (
                <Card key={user.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Personal Details
                        </h3>
                        <div className="space-y-2">
                          <p><span className="font-medium">Name:</span> {user.first_name} {user.last_name}</p>
                          <p><span className="font-medium">User ID:</span> {user.user_id}</p>
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
                          {user.build_style && (
                            <p><span className="font-medium">Build Style:</span> {user.build_style}</p>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;