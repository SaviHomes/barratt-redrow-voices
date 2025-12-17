import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Search, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ComplaintsDatabase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  // Fetch published complaints from database
  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['published-complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .eq('is_published', true)
        .order('complaint_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const filteredComplaints = complaints
    .filter(complaint => 
      searchTerm === "" || 
      complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (complaint.source && complaint.source.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.complaint_date).getTime() - new Date(a.complaint_date).getTime();
      }
      return 0;
    });

  return (
    <>
      <SEOHead
        title="Redrow Complaints Database - Real Customer Experiences"
        description="Browse through hundreds of real complaints and issues reported by Redrow homeowners. Find detailed accounts of defects, poor customer service, and unresolved problems."
        keywords="Redrow complaints, homeowner issues, property defects, customer service problems, building quality"
      />
      
      <Layout>
        <main className="min-h-screen py-12">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Redrow Complaints Database
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Real complaints and experiences from Redrow homeowners across the UK. 
                Search through detailed accounts of defects, poor service, and unresolved issues.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-8 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-end">
              <div className="flex-1">
                <label htmlFor="search" className="block text-sm font-medium mb-2">
                  Search Complaints
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by keywords, location, or source..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:w-48">
                <label htmlFor="sort" className="block text-sm font-medium mb-2">
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Most Recent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredComplaints.length} of {complaints.length} complaints
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredComplaints.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No complaints found.</p>
              </div>
            )}

            {/* Complaints Grid */}
            <div className="space-y-6">
              {filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{complaint.title}</h3>
                      </div>
                      
                      {complaint.source_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          asChild
                          className="h-8 px-3 text-xs"
                        >
                          <a href={complaint.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Source
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground leading-relaxed">
                      {complaint.description}
                    </p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-4 border-t">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{complaint.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(complaint.complaint_date).toLocaleDateString()}</span>
                      </div>
                      {complaint.source && (
                        <>
                          <span>•</span>
                          <span>Source: {complaint.source}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 text-center bg-muted/50 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">
                Have Your Own Redrow Complaint?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Don't suffer in silence. Share your experience to help other homeowners and build a case for better standards from Redrow Homes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <a href="/submit-claim">Submit Your Complaint</a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="/upload-evidence">Upload Evidence</a>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default ComplaintsDatabase;