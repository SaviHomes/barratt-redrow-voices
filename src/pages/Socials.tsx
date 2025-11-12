import { useState, useMemo } from "react";
import { Search, X, Share2, Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import SocialShareButtons from "@/components/evidence/SocialShareButtons";

interface SocialPost {
  id: string;
  title: string;
  description: string;
  post_url: string;
  platform: 'facebook' | 'instagram' | 'tiktok' | 'youtube' | 'twitter';
  company: 'redrow' | 'barratt' | 'both';
  creator_name: string;
  creator_handle: string | null;
  thumbnail_url: string | null;
  post_date: string;
  order_index: number;
}

const platformConfig = {
  facebook: { bg: 'bg-blue-500', icon: Facebook, label: 'Facebook' },
  instagram: { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', icon: Instagram, label: 'Instagram' },
  tiktok: { bg: 'bg-black', icon: Share2, label: 'TikTok' },
  youtube: { bg: 'bg-red-600', icon: Youtube, label: 'YouTube' },
  twitter: { bg: 'bg-blue-400', icon: Twitter, label: 'Twitter' }
};

const companyConfig = {
  redrow: { bg: 'bg-red-100', text: 'text-red-800', label: 'Redrow' },
  barratt: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Barratt' },
  both: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Both' }
};

export default function Socials() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedCompany, setSelectedCompany] = useState<string>("all");

  const { data: posts, isLoading } = useQuery({
    queryKey: ['social-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .eq('is_approved', true)
        .order('order_index', { ascending: true })
        .order('post_date', { ascending: false });

      if (error) throw error;
      return data as SocialPost[];
    }
  });

  const filteredPosts = useMemo(() => {
    if (!posts) return [];

    return posts.filter((post) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          post.title.toLowerCase().includes(query) ||
          post.description.toLowerCase().includes(query) ||
          post.creator_name.toLowerCase().includes(query) ||
          post.creator_handle?.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Platform filter
      if (selectedPlatform !== "all" && post.platform !== selectedPlatform) {
        return false;
      }

      // Company filter
      if (selectedCompany !== "all" && post.company !== selectedCompany) {
        return false;
      }

      return true;
    });
  }, [posts, searchQuery, selectedPlatform, selectedCompany]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedPlatform("all");
    setSelectedCompany("all");
  };

  const hasActiveFilters = searchQuery || selectedPlatform !== "all" || selectedCompany !== "all";

  return (
    <Layout>
      <SEOHead
        title="Community Social Posts - Redrow Exposed"
        description="Discover social media content from the community about Redrow and Barratt Homes. Facebook groups, Instagram accounts, TikTok videos, and more."
        keywords="redrow social media, barratt homes social media, facebook groups, instagram, tiktok, community content"
      />

      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Share2 className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">Community Social Posts</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore social media content from the community about Redrow and Barratt Homes
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find specific social media posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts, creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Platform Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Company Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Company</label>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Companies</SelectItem>
                    <SelectItem value="redrow">Redrow</SelectItem>
                    <SelectItem value="barratt">Barratt</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: {searchQuery}
                  </Badge>
                )}
                {selectedPlatform !== "all" && (
                  <Badge variant="secondary">
                    Platform: {platformConfig[selectedPlatform as keyof typeof platformConfig]?.label}
                  </Badge>
                )}
                {selectedCompany !== "all" && (
                  <Badge variant="secondary">
                    Company: {companyConfig[selectedCompany as keyof typeof companyConfig]?.label}
                  </Badge>
                )}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              </div>
            )}

            {/* Results Count */}
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {hasActiveFilters ? "No posts match your filters" : "No posts available yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const PlatformIcon = platformConfig[post.platform].icon;
              const platformStyle = platformConfig[post.platform];
              const companyStyle = companyConfig[post.company];

              return (
                <Card key={post.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Thumbnail */}
                  {post.thumbnail_url && (
                    <div className="relative h-48 bg-muted">
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-2 left-2 ${platformStyle.bg} text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium`}>
                        <PlatformIcon className="h-4 w-4" />
                        <span>{platformStyle.label}</span>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Platform badge if no thumbnail */}
                    {!post.thumbnail_url && (
                      <div className={`${platformStyle.bg} text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium w-fit mb-4`}>
                        <PlatformIcon className="h-4 w-4" />
                        <span>{platformStyle.label}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl font-semibold mb-2 text-foreground line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge className={`${companyStyle.bg} ${companyStyle.text}`}>
                        {companyStyle.label}
                      </Badge>
                      <Badge variant="outline">
                        {format(new Date(post.post_date), 'MMM d, yyyy')}
                      </Badge>
                    </div>

                    {/* Creator */}
                    <div className="mb-4 text-sm">
                      <span className="text-muted-foreground">By </span>
                      <span className="font-medium text-foreground">{post.creator_name}</span>
                      {post.creator_handle && (
                        <span className="text-muted-foreground"> @{post.creator_handle}</span>
                      )}
                    </div>

                    {/* Social Share */}
                    <div className="mb-4">
                      <SocialShareButtons
                        url={`${window.location.origin}/socials#${post.id}`}
                        title={post.title}
                        description={post.description}
                      />
                    </div>

                    {/* View Button */}
                    <Button asChild className="w-full">
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Original Post
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </Layout>
  );
}
