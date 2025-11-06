import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Globe, Users, MapPin, Clock, Scale, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface VisitorData {
  id: string;
  ip_address: unknown; // INET type from PostgreSQL
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  user_agent: string | null;
  referrer: string | null;
  page_path: string | null;
  visited_at: string;
  session_id: string | null;
}

interface Analytics {
  totalVisitors: number;
  uniqueCountries: number;
  topCountries: { country: string; count: number }[];
  recentVisitors: VisitorData[];
}

interface GLORegistration {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  development_name: string | null;
  property_address: string | null;
  defect_categories: string[] | null;
  estimated_damages: number | null;
  additional_comments: string | null;
  contact_consent: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [gloRegistrations, setGloRegistrations] = useState<GLORegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<GLORegistration | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
      fetchGLORegistrations();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // Check if user has admin role
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
      toast({
        title: "Error",
        description: "Failed to verify admin status.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Fetch visitor analytics
      const { data: visitors, error } = await supabase
        .from('visitor_analytics')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Calculate analytics
      const totalVisitors = visitors?.length || 0;
      const countries = new Set(visitors?.map(v => v.country).filter(Boolean));
      const uniqueCountries = countries.size;

      // Count visitors by country
      const countryCount: { [key: string]: number } = {};
      visitors?.forEach(visitor => {
        if (visitor.country) {
          countryCount[visitor.country] = (countryCount[visitor.country] || 0) + 1;
        }
      });

      const topCountries = Object.entries(countryCount)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setAnalytics({
        totalVisitors,
        uniqueCountries,
        topCountries,
        recentVisitors: visitors?.slice(0, 20) || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to fetch visitor analytics.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getLocationString = (visitor: VisitorData) => {
    const parts = [visitor.city, visitor.region, visitor.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  const fetchGLORegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('glo_interest')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGloRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching GLO registrations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch GLO registrations.",
        variant: "destructive",
      });
    }
  };

  const viewRegistrationDetails = (registration: GLORegistration) => {
    setSelectedRegistration(registration);
    setDetailsOpen(true);
  };

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Visitor analytics and site management</p>
          </div>

          {analytics && (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/admin/users")}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">User Management</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Manage</div>
                    <p className="text-xs text-muted-foreground mt-1">View all users</p>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/admin/faqs")}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">FAQ Management</CardTitle>
                    <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">Manage</div>
                    <p className="text-xs text-muted-foreground mt-1">Edit FAQ content</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalVisitors}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Countries</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.uniqueCountries}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Country</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analytics.topCountries[0]?.country || 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analytics.topCountries[0]?.count || 0} visitors
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">GLO Interest</CardTitle>
                    <Scale className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{gloRegistrations.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Registrations</p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Countries */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Top Countries</CardTitle>
                  <CardDescription>Visitor distribution by country</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.topCountries.map((country, index) => (
                      <div key={country.country} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span>{country.country}</span>
                        </div>
                        <span className="font-medium">{country.count} visitors</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Visitors Table */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Recent Visitors</CardTitle>
                  <CardDescription>Latest visitor activity with IP addresses and locations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Page</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead>Visit Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.recentVisitors.map((visitor) => (
                        <TableRow key={visitor.id}>
                          <TableCell className="font-mono text-sm">
                            {String(visitor.ip_address)}
                          </TableCell>
                          <TableCell>
                            {getLocationString(visitor)}
                          </TableCell>
                          <TableCell>
                            {visitor.page_path || '/'}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {visitor.referrer || 'Direct'}
                          </TableCell>
                          <TableCell>
                            {formatDate(visitor.visited_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* GLO Interest Registrations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>GLO Interest Registrations</CardTitle>
                      <CardDescription>Users who have registered interest in Group Litigation Orders</CardDescription>
                    </div>
                    <Badge variant="secondary">{gloRegistrations.length} Total</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {gloRegistrations.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Development</TableHead>
                          <TableHead>Defect Categories</TableHead>
                          <TableHead>Est. Damages</TableHead>
                          <TableHead>Registered</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {gloRegistrations.map((registration) => (
                          <TableRow key={registration.id}>
                            <TableCell>{registration.first_name} {registration.last_name}</TableCell>
                            <TableCell>{registration.email}</TableCell>
                            <TableCell>{registration.phone || 'N/A'}</TableCell>
                            <TableCell>{registration.development_name || 'N/A'}</TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {registration.defect_categories?.slice(0, 2).map((category) => (
                                  <Badge key={category} variant="outline" className="text-xs">
                                    {category}
                                  </Badge>
                                ))}
                                {registration.defect_categories && registration.defect_categories.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{registration.defect_categories.length - 2} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {registration.estimated_damages 
                                ? `£${registration.estimated_damages.toLocaleString()}` 
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{formatDate(registration.created_at)}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewRegistrationDetails(registration)}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No registrations yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Registration Details Dialog */}
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>GLO Interest Registration Details</DialogTitle>
              </DialogHeader>
              {selectedRegistration && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Name</Label>
                      <p className="text-sm mt-1">{selectedRegistration.first_name} {selectedRegistration.last_name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm mt-1">{selectedRegistration.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm mt-1">{selectedRegistration.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label>Development</Label>
                      <p className="text-sm mt-1">{selectedRegistration.development_name || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Property Address</Label>
                      <p className="text-sm mt-1">{selectedRegistration.property_address || 'Not provided'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Defect Categories</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedRegistration.defect_categories?.map((category) => (
                          <Badge key={category} variant="outline">{category}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Estimated Damages</Label>
                      <p className="text-sm mt-1">
                        {selectedRegistration.estimated_damages 
                          ? `£${selectedRegistration.estimated_damages.toLocaleString()}` 
                          : 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <Label>Contact Consent</Label>
                      <p className="text-sm mt-1">{selectedRegistration.contact_consent ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Additional Comments</Label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {selectedRegistration.additional_comments || 'None'}
                      </p>
                    </div>
                    <div>
                      <Label>Registered</Label>
                      <p className="text-sm mt-1">{formatDate(selectedRegistration.created_at)}</p>
                    </div>
                    <div>
                      <Label>Last Updated</Label>
                      <p className="text-sm mt-1">{formatDate(selectedRegistration.updated_at)}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <div className="mt-8">
            <Button onClick={() => navigate('/')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}