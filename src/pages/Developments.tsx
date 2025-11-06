import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { useDevelopmentStats, useAggregateStats } from "@/hooks/useDevelopmentStats";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DevelopmentCard from "@/components/DevelopmentCard";
import DevelopmentStatsCard from "@/components/DevelopmentStatsCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function Developments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { developmentsEnabled, isLoading: settingsLoading } = useSiteSettings();
  const { data: developments, isLoading: devsLoading } = useDevelopmentStats();
  const { data: aggregateStats, isLoading: statsLoading } = useAggregateStats();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [user, developmentsEnabled, settingsLoading]);

  const checkAccess = async () => {
    if (settingsLoading) return;

    // Check if user is admin
    if (user) {
      try {
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        setIsAdmin(!!data);

        // If page is disabled and user is not admin, redirect
        if (!developmentsEnabled && !data) {
          toast({
            title: "Page Not Available",
            description: "The Developments directory is currently being updated. Please check back later.",
          });
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    } else if (!developmentsEnabled) {
      // Not logged in and page is disabled
      toast({
        title: "Page Not Available",
        description: "The Developments directory is currently being updated. Please check back later.",
      });
      navigate('/');
      return;
    }

    setCheckingAccess(false);
  };

  const filteredAndSortedDevelopments = useMemo(() => {
    if (!developments) return [];

    let filtered = developments.filter((dev) =>
      dev.development_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.development_name.localeCompare(b.development_name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.development_name.localeCompare(a.development_name));
        break;
      case "reviews":
        filtered.sort((a, b) => b.review_count - a.review_count);
        break;
      case "rating":
        filtered.sort((a, b) => b.overall_rating - a.overall_rating);
        break;
      case "claims":
        filtered.sort((a, b) => b.claim_count - a.claim_count);
        break;
      case "damages":
        filtered.sort((a, b) => b.total_estimated_damages - a.total_estimated_damages);
        break;
      default:
        break;
    }

    return filtered;
  }, [developments, searchTerm, sortBy]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Redrow Housing Developments Directory",
    description: "Complete directory of Redrow housing developments with customer reviews and ratings",
    numberOfItems: developments?.length || 0,
    itemListElement: developments?.map((dev, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Place",
        name: dev.development_name,
        aggregateRating: dev.overall_rating > 0 ? {
          "@type": "AggregateRating",
          ratingValue: dev.overall_rating.toFixed(1),
          reviewCount: dev.review_count,
        } : undefined,
      },
    })) || [],
  };

  if (checkingAccess || settingsLoading) {
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

  return (
    <Layout>
      <SEOHead
        title="Redrow Developments Directory - All Estates & Reviews | RedrowExposed"
        description="Browse all Redrow housing developments with real homeowner reviews, build quality ratings, complaint statistics, and defect reports. Find out the truth about your development."
        canonicalUrl="/developments"
        structuredData={structuredData}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Admin Notice */}
        {isAdmin && !developmentsEnabled && (
          <Alert className="mb-8 max-w-4xl mx-auto border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              ⚠️ <strong>Admin Preview Mode:</strong> This page is currently hidden from public view. 
              Only admins can see this page. Enable it in{" "}
              <Link to="/admin/settings" className="underline font-medium">
                Site Settings
              </Link>
              {" "}when ready.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Redrow Developments Directory
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore all Redrow developments with real homeowner data, ratings, and complaint statistics
          </p>
        </div>

        {/* Privacy Notice */}
        <Alert className="mb-8 max-w-4xl mx-auto">
          <AlertDescription>
            All data is anonymized to protect homeowner privacy. Statistics are aggregated from verified homeowner submissions.
          </AlertDescription>
        </Alert>

        {/* Aggregate Statistics */}
        {statsLoading ? (
          <Skeleton className="h-32 w-full mb-8" />
        ) : aggregateStats ? (
          <div className="mb-12">
            <DevelopmentStatsCard stats={aggregateStats} />
          </div>
        ) : null}

        {/* Search and Filter */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search developments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="claims">Most Claims</SelectItem>
                  <SelectItem value="damages">Highest Damages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Developments Grid */}
        {devsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : filteredAndSortedDevelopments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredAndSortedDevelopments.map((dev) => (
              <DevelopmentCard
                key={dev.development_name}
                stats={dev}
                onClick={() => {
                  // Future: Navigate to detail view
                  console.log("Clicked:", dev.development_name);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">No developments found</h3>
            {searchTerm ? (
              <p className="text-muted-foreground mb-6">
                No developments match your search "{searchTerm}"
              </p>
            ) : (
              <p className="text-muted-foreground mb-6">
                No developments are tracked yet. Be the first to share your experience!
              </p>
            )}
            <Button asChild>
              <Link to="/register">Register Your Development</Link>
            </Button>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16 py-12 bg-muted/50 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Can't Find Your Development?
          </h2>
          <p className="text-muted-foreground mb-6">
            Register to add your development to our directory and help other homeowners make informed decisions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">Register Now</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/submit-claim">Submit a Claim</Link>
            </Button>
          </div>
        </div>
      </main>
    </Layout>
  );
}
