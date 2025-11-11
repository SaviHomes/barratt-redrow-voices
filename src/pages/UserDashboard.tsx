import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useEvidencePhotos } from "@/hooks/useEvidencePhotos";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Star, User, Image as ImageIcon, AlertCircle, Eye } from "lucide-react";
import { EditEvidenceDialog } from "@/components/evidence/EditEvidenceDialog";

export default function UserDashboard() {
  const { user } = useAuth();
  const { developmentsEnabled } = useSiteSettings();
  const [stats, setStats] = useState({
    evidenceCount: 0,
    claimsCount: 0,
    ratingsCount: 0,
  });
  const [profile, setProfile] = useState<any>(null);
  const [recentEvidence, setRecentEvidence] = useState<any[]>([]);
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [evidenceToEdit, setEvidenceToEdit] = useState<any | null>(null);

  const { evidenceWithPhotos, loading: photosLoading, refetch: refetchPhotos } = useEvidencePhotos(recentEvidence, user?.id);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);

      // Fetch evidence count and recent evidence
      const { data: evidenceData, count: evidenceCount } = await supabase
        .from('evidence')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setStats(prev => ({ ...prev, evidenceCount: evidenceCount || 0 }));
      setRecentEvidence(evidenceData || []);

      // Fetch claims count and recent claims
      const { data: claimsData, count: claimsCount } = await supabase
        .from('claims')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setStats(prev => ({ ...prev, claimsCount: claimsCount || 0 }));
      setRecentClaims(claimsData || []);

      // Fetch ratings count
      const { count: ratingsCount } = await supabase
        .from('development_ratings')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);

      setStats(prev => ({ ...prev, ratingsCount: ratingsCount || 0 }));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'secondary';
      case 'under_review': return 'default';
      case 'submitted': return 'outline';
      default: return 'outline';
    }
  };

  const handleEditEvidence = (evidence: any) => {
    setEvidenceToEdit(evidence);
    setEditDialogOpen(true);
  };

  if (loading || photosLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.first_name || user?.email}!
            </h1>
            <p className="text-muted-foreground">
              Manage your evidence, claims, and development ratings from your dashboard.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Evidence</CardTitle>
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.evidenceCount}</div>
                <p className="text-xs text-muted-foreground">Submissions uploaded</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.claimsCount}</div>
                <p className="text-xs text-muted-foreground">Claims submitted</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ratings Given</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ratingsCount}</div>
                <p className="text-xs text-muted-foreground">Development reviews</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to perform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to="/upload-evidence" className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6" />
                    <span>Upload Evidence</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to="/my-evidence" className="flex flex-col items-center gap-2">
                    <ImageIcon className="h-6 w-6" />
                    <span>My Evidence</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to={`/public-gallery?userId=${user?.id}&preview=true`} className="flex flex-col items-center gap-2">
                    <Eye className="h-6 w-6" />
                    <span>Live View</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to="/group-litigation-info" className="flex flex-col items-center gap-2">
                    <FileText className="h-6 w-6" />
                    <div className="flex flex-col items-center">
                      <span>Submit Claim</span>
                      <Badge variant="secondary" className="mt-1 text-xs">Coming Soon</Badge>
                    </div>
                  </Link>
                </Button>
                {developmentsEnabled && (
                  <Button asChild variant="outline" className="h-auto py-4">
                    <Link to="/developments" className="flex flex-col items-center gap-2">
                      <Star className="h-6 w-6" />
                      <span>Rate Development</span>
                    </Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="h-auto py-4">
                  <Link to="/my-profile" className="flex flex-col items-center gap-2">
                    <User className="h-6 w-6" />
                    <span>Edit Profile</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Evidence */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Evidence</CardTitle>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/my-evidence">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentEvidence.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No evidence submitted yet</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link to="/upload-evidence">Upload your first evidence</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {evidenceWithPhotos.map((evidence) => (
                      <div 
                        key={evidence.id} 
                        className="group flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleEditEvidence(evidence)}
                      >
                        <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-white mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate group-hover:text-white">{evidence.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getSeverityColor(evidence.severity)} className="text-xs">
                              {evidence.severity}
                            </Badge>
                            <span className="text-xs text-muted-foreground group-hover:text-white">{evidence.category}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Claims */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>Recent Claims</CardTitle>
                    <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to="/group-litigation-info">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentClaims.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No claims submitted yet</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link to="/group-litigation-info">Learn about Group Litigation</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentClaims.map((claim) => (
                      <div key={claim.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <AlertCircle className="h-5 w-5 text-muted-foreground mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{claim.claim_title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getStatusColor(claim.status)} className="text-xs">
                              {claim.status?.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(claim.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <EditEvidenceDialog
          evidence={evidenceToEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onUpdate={() => {
            fetchDashboardData();
            refetchPhotos();
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
}
