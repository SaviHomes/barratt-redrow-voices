import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function MyClaims() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user]);

  useEffect(() => {
    filterClaims();
  }, [claims, statusFilter]);

  const fetchClaims = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClaims(data || []);
    } catch (error) {
      console.error('Error fetching claims:', error);
      toast({
        title: "Error",
        description: "Failed to load claims",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterClaims = () => {
    let filtered = claims;

    if (statusFilter !== "all") {
      filtered = filtered.filter(claim => claim.status === statusFilter);
    }

    setFilteredClaims(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'secondary';
      case 'under_review': return 'default';
      case 'submitted': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading claims...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Claims</h1>
              <p className="text-muted-foreground">
                View and manage all your submitted claims
              </p>
            </div>
            <Button asChild>
              <Link to="/submit-claim">Submit New Claim</Link>
            </Button>
          </div>

          {/* Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="max-w-xs">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Claims List */}
          {filteredClaims.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No claims found</h3>
                <p className="text-muted-foreground mb-4">
                  {claims.length === 0
                    ? "You haven't submitted any claims yet."
                    : "No claims match the selected status."}
                </p>
                {claims.length === 0 && (
                  <Button asChild>
                    <Link to="/submit-claim">Submit Your First Claim</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg">{claim.claim_title}</CardTitle>
                          <Badge variant={getStatusColor(claim.status)}>
                            {claim.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <CardDescription>
                          Submitted on {new Date(claim.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Property Address</p>
                        <p className="font-medium">{claim.property_address}</p>
                      </div>
                      {claim.development_name && (
                        <div>
                          <p className="text-sm text-muted-foreground">Development</p>
                          <p className="font-medium">{claim.development_name}</p>
                        </div>
                      )}
                      {claim.estimated_damages && (
                        <div>
                          <p className="text-sm text-muted-foreground">Estimated Damages</p>
                          <p className="font-medium flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            £{Number(claim.estimated_damages).toLocaleString()}
                          </p>
                        </div>
                      )}
                      {claim.defects_categories && claim.defects_categories.length > 0 && (
                        <div>
                          <p className="text-sm text-muted-foreground">Defect Categories</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {claim.defects_categories.slice(0, 2).map((category: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {claim.defects_categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{claim.defects_categories.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {claim.claim_description && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Description</p>
                        <p className="text-sm line-clamp-2">{claim.claim_description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
