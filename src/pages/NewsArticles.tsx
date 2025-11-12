import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Newspaper, Calendar } from "lucide-react";
import { format } from "date-fns";
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

          {/* Articles Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="py-12 text-center">
                <Newspaper className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No articles published yet</h3>
                <p className="text-muted-foreground">Check back soon for the latest news and coverage.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
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
