import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, MapPin, Clock, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";

interface VisitorData {
  id: string;
  ip_address: unknown;
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
  allVisitors: VisitorData[];
}

const ITEMS_PER_PAGE = 20;

export default function AdminVisitorStatistics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hideInternalReferrers, setHideInternalReferrers] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
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
      const { data: visitors, error } = await supabase
        .from('visitor_analytics')
        .select('*')
        .order('visited_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      const totalVisitors = visitors?.length || 0;
      const countries = new Set(visitors?.map(v => v.country).filter(Boolean));
      const uniqueCountries = countries.size;

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
        allVisitors: visitors || [],
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

  const openReferrerPopup = (url: string) => {
    if (url && url !== 'Direct') {
      window.open(url, '_blank', 'width=1000,height=700,scrollbars=yes,resizable=yes');
    }
  };

  // Filter and calculate pagination
  const filteredVisitors = hideInternalReferrers && analytics
    ? analytics.allVisitors.filter(visitor => 
        visitor.referrer !== 'https://lovable.dev/' && 
        visitor.referrer !== 'https://lovable.dev'
      )
    : analytics?.allVisitors || [];
  
  const totalPages = Math.ceil(filteredVisitors.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentVisitors = filteredVisitors.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);
    
    if (currentPage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Website Visitor Statistics</h1>
            <p className="text-muted-foreground">Detailed analytics and visitor tracking</p>
          </div>

          {analytics && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalVisitors}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total tracked visits</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unique Countries</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analytics.uniqueCountries}</div>
                    <p className="text-xs text-muted-foreground mt-1">Countries represented</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Visitors</CardTitle>
              <CardDescription>
                Latest visitor activity with IP addresses and locations (Page {currentPage} of {totalPages})
              </CardDescription>
              
              <div className="flex items-center space-x-2 mt-4">
                <Switch
                  id="hide-internal"
                  checked={hideInternalReferrers}
                  onCheckedChange={(checked) => {
                    setHideInternalReferrers(checked);
                    setCurrentPage(1);
                  }}
                />
                <Label htmlFor="hide-internal" className="cursor-pointer">
                  Hide internal referrers (lovable.dev)
                </Label>
              </div>
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
                      {currentVisitors.map((visitor) => (
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
                          <TableCell className="max-w-xs">
                            {visitor.referrer && visitor.referrer !== 'Direct' ? (
                              <button
                                onClick={() => openReferrerPopup(visitor.referrer!)}
                                className="flex items-center gap-1 text-primary hover:underline truncate max-w-full"
                                aria-label={`Open referrer: ${visitor.referrer}`}
                              >
                                <span className="truncate">{visitor.referrer}</span>
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </button>
                            ) : (
                              <span className="text-muted-foreground">Direct</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {formatDate(visitor.visited_at)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-6">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>

                          {getPageNumbers().map((page, index) => (
                            <PaginationItem key={index}>
                              {page === 'ellipsis' ? (
                                <PaginationEllipsis />
                              ) : (
                                <PaginationLink
                                  onClick={() => setCurrentPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              )}
                            </PaginationItem>
                          ))}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
