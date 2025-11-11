import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AdaptiveEvidenceCard from "@/components/evidence/AdaptiveEvidenceCard";
import EvidenceDetailDialog from "@/components/evidence/EvidenceDetailDialog";
import { useEvidencePhotos, EvidenceWithPhotos } from "@/hooks/useEvidencePhotos";
import { Search, Filter, SortAsc, Eye, ArrowLeft } from "lucide-react";
import Masonry from "react-masonry-css";
import SEOHead from "@/components/SEOHead";

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "structural", label: "Structural" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "finish", label: "Finish Quality" },
  { value: "other", label: "Other" },
];

const SEVERITY_LEVELS = [
  { value: "all", label: "All Severities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest First" },
  { value: "views", label: "Most Viewed" },
];

export default function PublicGallery() {
  const [searchParams] = useSearchParams();
  const isPreviewMode = searchParams.get('preview') === 'true';
  const previewUserId = searchParams.get('userId');
  
  const [evidence, setEvidence] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceWithPhotos | null>(null);

  const { evidenceWithPhotos, loading: photosLoading } = useEvidencePhotos(evidence, 'public');

  useEffect(() => {
    fetchPublicEvidence();
  }, [categoryFilter, severityFilter, sortBy, isPreviewMode, previewUserId]);

  const fetchPublicEvidence = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('evidence')
        .select('*')
        .eq('is_public', true);

      if (isPreviewMode && previewUserId) {
        query = query.eq('user_id', previewUserId);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      switch (sortBy) {
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
        case 'views':
          query = query.order('view_count', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvidence(data || []);
    } catch (error) {
      console.error('Error fetching public evidence:', error);
      setEvidence([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvidence = evidenceWithPhotos.filter((item) => {
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleEvidenceClick = async (item: EvidenceWithPhotos) => {
    setSelectedEvidence(item);
    
    // Increment view count
    await supabase
      .from('evidence')
      .update({ view_count: (item.view_count || 0) + 1 })
      .eq('id', item.id);
  };

  const breakpointColumns = {
    default: 3,
    1024: 2,
    640: 1,
  };

  return (
    <Layout>
      <SEOHead
        title="Public Evidence Gallery - Redrow Complaints"
        description="Browse real homeowner experiences and documented defects from Redrow developments. View photos, descriptions, and severity levels of reported issues."
        keywords="redrow evidence, property defects, homeowner experiences, build quality, redrow photos"
      />

      <div className="min-h-screen bg-background">
        {/* Preview Mode Banner */}
        {isPreviewMode && (
          <Alert className="rounded-none border-l-4 border-l-primary bg-primary/5">
            <Eye className="h-5 w-5 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span className="font-medium">
                Preview Mode - Viewing your published evidence as it appears to the public
              </span>
              <Button asChild variant="ghost" size="sm">
                <Link to="/user-dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12 border-b">
          <div className="container max-w-7xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isPreviewMode ? "Your Published Evidence" : "Evidence Gallery"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              {isPreviewMode 
                ? "This is how your approved evidence appears on the public gallery. Only evidence marked as public by admins is shown here."
                : "Real homeowner experiences documenting defects and issues across Redrow developments. Browse photos, descriptions, and severity levels to understand common problems."
              }
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b py-4">
          <div className="container max-w-7xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search evidence..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((sev) => (
                    <SelectItem key={sev.value} value={sev.value}>
                      {sev.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(categoryFilter !== 'all' || severityFilter !== 'all') && (
              <div className="flex gap-2 mt-3">
                {categoryFilter !== 'all' && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategoryFilter('all')}>
                    {CATEGORIES.find(c => c.value === categoryFilter)?.label} ✕
                  </Badge>
                )}
                {severityFilter !== 'all' && (
                  <Badge variant="secondary" className="cursor-pointer" onClick={() => setSeverityFilter('all')}>
                    {SEVERITY_LEVELS.find(s => s.value === severityFilter)?.label} ✕
                  </Badge>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Gallery Section */}
        <section className="py-8">
          <div className="container max-w-7xl">
            {loading || photosLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredEvidence.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-2">
                  {isPreviewMode ? "You don't have any published evidence yet" : "No evidence found"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {isPreviewMode 
                    ? "Evidence must be approved by an admin before appearing publicly" 
                    : "Try adjusting your filters or search criteria"
                  }
                </p>
                {isPreviewMode && (
                  <Button asChild variant="outline">
                    <Link to="/my-evidence">View All My Evidence</Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  Showing {filteredEvidence.length} {filteredEvidence.length === 1 ? 'item' : 'items'}
                </div>
                <Masonry
                  breakpointCols={breakpointColumns}
                  className="flex -ml-6 w-auto"
                  columnClassName="pl-6 bg-clip-padding"
                >
                  {filteredEvidence.map((item) => (
                    <div key={item.id} className="mb-6">
                      <AdaptiveEvidenceCard
                        evidence={item}
                        onClick={() => handleEvidenceClick(item)}
                      />
                    </div>
                  ))}
                </Masonry>
              </>
            )}
          </div>
        </section>
      </div>

      <EvidenceDetailDialog
        evidence={selectedEvidence}
        open={!!selectedEvidence}
        onOpenChange={(open) => !open && setSelectedEvidence(null)}
      />
    </Layout>
  );
}
