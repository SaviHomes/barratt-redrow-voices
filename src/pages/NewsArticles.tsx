import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ExternalLink, Newspaper, Calendar as CalendarIcon, Search, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import SEOHead from "@/components/SEOHead";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  article_url: string;
  source: string;
  article_date: string;
  thumbnail_url: string | null;
  is_approved: boolean;
  order_index: number;
}

export default function NewsArticles() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('news_articles')
        .select('*')
        .eq('is_approved', true)
        .order('order_index', { ascending: true })
        .order('article_date', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique sources for filter dropdown
  const uniqueSources = useMemo(() => {
    const sources = new Set(articles.map(article => article.source));
    return Array.from(sources).sort();
  }, [articles]);

  // Filter articles based on search and filters
  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      // Search filter (title or description)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          article.title.toLowerCase().includes(query) ||
          article.description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Source filter
      if (selectedSource !== "all" && article.source !== selectedSource) {
        return false;
      }

      // Date range filter
      const articleDate = new Date(article.article_date);
      if (dateFrom && articleDate < dateFrom) {
        return false;
      }
      if (dateTo && articleDate > dateTo) {
        return false;
      }

      return true;
    });
  }, [articles, searchQuery, selectedSource, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSource("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const hasActiveFilters = searchQuery || selectedSource !== "all" || dateFrom || dateTo;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Public Interest Articles - Barratt Redrow News",
    "description": "Latest news and media coverage about Barratt Redrow developments and customer experiences",
    "url": `${window.location.origin}/news-articles`,
  };

  return (
    <Layout>
      <SEOHead
        title="Public Interest Articles | Redrow Exposed"
        description="Latest news and media coverage about Barratt Redrow. Read articles from major publications covering customer experiences, legal cases, and development issues."
        keywords="Barratt Redrow news, property developer articles, customer complaints news, construction defects media"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-background py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Newspaper className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Public Interest Articles</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Latest news and coverage about Barratt Redrow from major publications and media outlets
            </p>
          </div>

          {/* Search and Filter Controls */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Articles
              </CardTitle>
              <CardDescription>
                Find specific articles by keyword, source, or date range
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search Input */}
                <div className="lg:col-span-2">
                  <Label htmlFor="search">Search Keywords</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search in title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Source Filter */}
                <div>
                  <Label htmlFor="source">Source Publication</Label>
                  <Select value={selectedSource} onValueChange={setSelectedSource}>
                    <SelectTrigger id="source" className="bg-background">
                      <SelectValue placeholder="All sources" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="all">All sources</SelectItem>
                      {uniqueSources.map(source => (
                        <SelectItem key={source} value={source}>
                          {source}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filters */}
                <div>
                  <Label>Date Range</Label>
                  <div className="flex gap-2">
                    {/* From Date */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateFrom && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                          {dateFrom ? format(dateFrom, "dd/MM/yy") : "From"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-[100] shadow-lg" align="start">
                        <Calendar
                          mode="single"
                          selected={dateFrom}
                          onSelect={setDateFrom}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>

                    {/* To Date */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateTo && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                          {dateTo ? format(dateTo, "dd/MM/yy") : "To"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background z-[100] shadow-lg" align="start">
                        <Calendar
                          mode="single"
                          selected={dateTo}
                          onSelect={setDateTo}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Active Filters Display & Clear Button */}
              {hasActiveFilters && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {searchQuery && (
                    <Badge variant="secondary">
                      Search: "{searchQuery}"
                    </Badge>
                  )}
                  {selectedSource !== "all" && (
                    <Badge variant="secondary">
                      Source: {selectedSource}
                    </Badge>
                  )}
                  {dateFrom && (
                    <Badge variant="secondary">
                      From: {format(dateFrom, "dd MMM yyyy")}
                    </Badge>
                  )}
                  {dateTo && (
                    <Badge variant="secondary">
                      To: {format(dateTo, "dd MMM yyyy")}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}

              {/* Results Count */}
              <div className="mt-4 text-sm text-muted-foreground">
                Showing {filteredArticles.length} of {articles.length} article{articles.length !== 1 ? 's' : ''}
              </div>
            </CardContent>
          </Card>

          {/* Articles Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-12 text-center">
                <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {articles.length === 0 ? "No articles published yet" : "No articles match your filters"}
                </h3>
                <p className="text-muted-foreground">
                  {articles.length === 0 
                    ? "Check back soon for the latest news and coverage."
                    : "Try adjusting your search criteria or clearing filters."}
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} variant="outline" className="mt-4">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  {article.thumbnail_url ? (
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      <Newspaper className="h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-lg">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Newspaper className="h-3 w-3" />
                        {article.source}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(article.article_date), 'dd MMM yyyy')}
                      </Badge>
                    </div>

                    {/* View Article Button */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(article.article_url, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full Article
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
