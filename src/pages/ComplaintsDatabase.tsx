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

  // Sample complaints data - in a real app, this would come from the database
  const complaints = [
    {
      id: 1,
      title: "Severe Water Damage and Poor Build Quality",
      description: "Our new Redrow home has experienced significant water ingress through poorly fitted windows and doors. The cavity wall insulation is soaked, and we've had to deal with mold issues. Redrow's response has been incredibly slow and unhelpful.",
      location: "Birmingham, West Midlands",
      development: "Erdington Village",
      category: "Structural Issues",
      severity: "High",
      date: "2024-01-15",
      rating: 1,
      status: "Ongoing",
      author: "Sarah M.",
      upvotes: 47,
      tags: ["water damage", "poor insulation", "mold", "windows", "customer service"]
    },
    {
      id: 2,
      title: "Defective Heating System and Unfinished Work",
      description: "The heating system installed in our property has never worked properly. Multiple engineer visits haven't resolved the issue. Additionally, several rooms were left unfinished with visible gaps in flooring and unpainted walls.",
      location: "Reading, Berkshire",
      development: "Green Park Village",
      category: "Heating & Plumbing",
      severity: "High",
      date: "2024-01-10",
      rating: 2,
      status: "Unresolved",
      author: "James T.",
      upvotes: 32,
      tags: ["heating", "plumbing", "unfinished work", "poor workmanship"]
    },
    {
      id: 3,
      title: "Cracked Walls and Foundation Issues",
      description: "Within 6 months of moving in, we noticed significant cracks appearing in multiple walls. A structural engineer confirmed these are foundation-related issues that should have been caught during construction.",
      location: "Cardiff, Wales",
      development: "St. Fagans Park",
      category: "Structural Issues",
      severity: "Critical",
      date: "2024-01-08",
      rating: 1,
      status: "Legal Action",
      author: "David L.",
      upvotes: 89,
      tags: ["foundation", "cracks", "structural", "engineering defect"]
    },
    {
      id: 4,
      title: "Electrical Safety Concerns",
      description: "Multiple electrical faults discovered by independent electrician including incorrectly wired sockets and missing earth connections. Redrow initially denied responsibility.",
      location: "Manchester, Greater Manchester",
      development: "Didsbury Gardens",
      category: "Electrical",
      severity: "Critical",
      date: "2024-01-05",
      rating: 1,
      status: "Partially Resolved",
      author: "Emma R.",
      upvotes: 56,
      tags: ["electrical", "safety", "wiring", "building standards"]
    },
    {
      id: 5,
      title: "Poor Kitchen Installation and Damaged Units",
      description: "Kitchen units were installed incorrectly with visible gaps, damaged cabinet doors, and non-functioning appliances. The worktop was cracked upon delivery but Redrow installed it anyway.",
      location: "Leeds, West Yorkshire",
      development: "Horsforth Vale",
      category: "Kitchen & Appliances",
      severity: "Medium",
      date: "2023-12-28",
      rating: 2,
      status: "Ongoing",
      author: "Michael P.",
      upvotes: 23,
      tags: ["kitchen", "installation", "appliances", "poor quality"]
    },
    {
      id: 6,
      title: "Drainage Problems and Garden Flooding",
      description: "Poor drainage design has led to regular garden flooding during moderate rainfall. The issue affects multiple properties in our development but Redrow claims it's not their responsibility.",
      location: "Bristol, Avon",
      development: "Filton Quarter",
      category: "Drainage & External",
      severity: "Medium",
      date: "2023-12-20",
      rating: 2,
      status: "Disputed",
      author: "Lisa K.",
      upvotes: 34,
      tags: ["drainage", "flooding", "garden", "design flaw"]
    },
    {
      id: 7,
      title: "Roof Leaks and Tile Issues",
      description: "Roof tiles were poorly fitted leading to water ingress during storms. Multiple repair attempts have failed to fully resolve the issue. Some tiles have already become loose and fallen.",
      location: "Newcastle, Tyne and Wear",
      development: "Gosforth Park",
      category: "Roofing",
      severity: "High",
      date: "2023-12-15",
      rating: 1,
      status: "Ongoing",
      author: "Paul W.",
      upvotes: 41,
      tags: ["roof", "tiles", "water ingress", "storm damage"]
    },
    {
      id: 8,
      title: "Bathroom Waterproofing Failures",
      description: "The bathroom waterproofing has failed causing water damage to the ceiling below. Mold is growing behind tiles and the smell is becoming unbearable. Redrow's repairs have been temporary at best.",
      location: "Southampton, Hampshire",
      development: "Centenary Quay",
      category: "Bathroom & Wetrooms",
      severity: "High",
      date: "2023-12-10",
      rating: 1,
      status: "Unresolved",
      author: "Helen C.",
      upvotes: 38,
      tags: ["bathroom", "waterproofing", "mold", "water damage"]
    }
  ];

  const categories = [
    "all",
    "Structural Issues",
    "Heating & Plumbing", 
    "Electrical",
    "Kitchen & Appliances",
    "Drainage & External",
    "Roofing",
    "Bathroom & Wetrooms"
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
        complaint.development.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      if (sortBy === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "rating") return a.rating - b.rating;
      if (sortBy === "popular") return b.upvotes - a.upvotes;
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
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Worst Rating</SelectItem>
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
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant={getSeverityColor(complaint.severity)}>
                            {complaint.severity} Priority
                          </Badge>
                          <Badge variant={getStatusColor(complaint.status)}>
                            {complaint.status}
                          </Badge>
                          <Badge variant="outline">{complaint.category}</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < complaint.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span>•</span>
                        <span>{complaint.upvotes} helpful</span>
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
                      <span>•</span>
                      <span>{complaint.development}</span>
                      <span>•</span>
                      <span>by {complaint.author}</span>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {complaint.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
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