import React, { useState } from "react";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Star, Search, Filter } from "lucide-react";

const ComplaintsDatabase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Real documented complaints from news sources and official records
  const complaints = [
    {
      id: 3,
      title: "Property was built on a Swallowhole",
      description: "We were looking to purchase a Henley at Monchelsea Park, Langley, however our search came back with \"Moderate Potential for Collapsibility\" and that the property was built on a \"Swallowhole\", unfortunately Redrow, who openly admitted to knowing about the issues before selling it to us, are refusing to return the money paid for upgraded appliances, which has left us hugely out of pocket. I would strongly recommend getting your own searches carried out before instructing solicitors to save you a whole world of pain! Heaven knows what the rest of the development is like….",
      location: "Monchelsea Park, Langley",
      category: "",
      severity: "",
      date: "2024-03-01",
      status: "",
      sourceUrl: "",
      sourcePublication: "",
      tags: [],
      comments: []
    }
  ];

  const categories = [
    "all"
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "destructive";
      case "High": return "secondary";
      case "Medium": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Legal Action": return "destructive";
      case "Unresolved": return "secondary";
      case "Ongoing": return "outline";
      case "Disputed": return "secondary";
      case "Partially Resolved": return "outline";
      default: return "outline";
    }
  };

  const filteredComplaints = complaints
    .filter(complaint => 
      (filterCategory === "all" || complaint.category === filterCategory) &&
      (searchTerm === "" || 
        complaint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.sourcePublication.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "severity") {
        const severityOrder = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 };
        return (severityOrder[a.severity as keyof typeof severityOrder] || 4) - (severityOrder[b.severity as keyof typeof severityOrder] || 4);
      }
      if (sortBy === "comments") return (b.comments?.length || 0) - (a.comments?.length || 0);
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
                    placeholder="Search by keywords, location, or development..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <label htmlFor="category" className="block text-sm font-medium mb-2">
                  Category
                </label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="severity">Most Severe</SelectItem>
                    <SelectItem value="comments">Most Discussed</SelectItem>
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

            {/* Complaints Grid */}
            <div className="space-y-6">
              {filteredComplaints.map((complaint) => (
                <Card key={complaint.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{complaint.title}</h3>
                        {(complaint.severity || complaint.status || complaint.category) && (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {complaint.severity && (
                              <Badge variant={getSeverityColor(complaint.severity)}>
                                {complaint.severity} Priority
                              </Badge>
                            )}
                            {complaint.status && (
                              <Badge variant={getStatusColor(complaint.status)}>
                                {complaint.status}
                              </Badge>
                            )}
                            {complaint.category && (
                              <Badge variant="outline">{complaint.category}</Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {complaint.sourceUrl && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              className="h-6 px-2 text-xs"
                            >
                              <a href={complaint.sourceUrl} target="_blank" rel="noopener noreferrer">
                                Source
                              </a>
                            </Button>
                            {(complaint.comments?.length || 0) > 0 && <span>•</span>}
                          </>
                        )}
                        {(complaint.comments?.length || 0) > 0 && (
                          <span>{complaint.comments?.length} responses</span>
                        )}
                      </div>
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
                        <span>{new Date(complaint.date).toLocaleDateString()}</span>
                      </div>
                      {complaint.sourcePublication && (
                        <>
                          <span>•</span>
                          <span>{complaint.sourcePublication}</span>
                        </>
                      )}
                      {(complaint.comments?.length || 0) > 0 && (
                        <>
                          <span>•</span>
                          <span>{complaint.comments?.length} comments</span>
                        </>
                      )}
                    </div>

                    {/* Comments Section */}
                    {complaint.comments && complaint.comments.length > 0 && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                        <h4 className="font-medium mb-3 text-sm">Community Responses:</h4>
                        <div className="space-y-3">
                          {complaint.comments.map((comment, index) => (
                            <div key={index} className="text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-xs">{comment.author}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(comment.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-muted-foreground">{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {complaint.tags && complaint.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {complaint.tags.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button variant="outline" size="lg">
                Load More Complaints
              </Button>
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