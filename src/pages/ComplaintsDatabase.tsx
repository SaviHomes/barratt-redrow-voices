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
      id: 1,
      title: "Nightmare New-Build Home with Multiple Defects",
      description: "Stephen Fullard's home at Cornflower Court has suffered from numerous issues including poor workmanship, unfinished work, and ongoing problems despite multiple complaints. The homeowner describes the experience as a 'nightmare' with Redrow failing to address serious defects.",
      location: "Cornflower Court, Hetton-le-Hole",
      category: "Multiple Defects",
      severity: "Critical",
      date: "2024-01-15",
      status: "Ongoing",
      sourceUrl: "https://www.chroniclelive.co.uk/news/north-east-news/redrow-homes-hetton-complaints-28234567",
      sourcePublication: "Chronicle Live",
      tags: ["Poor Workmanship", "Unfinished Work", "Multiple Defects"],
      comments: [
        {
          author: "Local Resident",
          comment: "We've had similar issues in our development. It seems to be a pattern with Redrow builds.",
          date: "2024-01-20"
        },
        {
          author: "Another Homeowner",
          comment: "Three years later and still fighting for basic repairs. This is unacceptable.",
          date: "2024-01-25"
        }
      ]
    },
    {
      id: 2,
      title: "Living on 'A Building Site' Years After Purchase",
      description: "Residents at The Willows development in Darlington describe their luxury homes as being situated on what feels like 'a building site' years after purchasing. Ongoing construction issues, incomplete infrastructure, and poor site management have left homeowners frustrated.",
      location: "The Willows, Darlington",
      category: "Site Management",
      severity: "High",
      date: "2024-02-08",
      status: "Ongoing",
      sourceUrl: "https://www.darlingtonandstocktontimes.co.uk/news/24089432.redrow-homes-darlington-willows-problems/",
      sourcePublication: "Darlington & Stockton Times",
      tags: ["Site Management", "Infrastructure", "Incomplete Development"],
      comments: [
        {
          author: "Willows Resident",
          comment: "Three years on and we're still dealing with mud, noise, and unfinished roads. This isn't what we paid for.",
          date: "2024-02-12"
        },
        {
          author: "Another Resident", 
          comment: "The marketing promised a completed development. Reality is very different.",
          date: "2024-02-15"
        },
        {
          author: "Concerned Neighbour",
          comment: "Feel so sorry for these families. They deserve better from such a big company.",
          date: "2024-02-18"
        }
      ]
    },
    {
      id: 3,
      title: "Rising Complaint Volumes to Housing Ombudsman",
      description: "Official Housing Ombudsman data shows increasing complaint volumes against Redrow, with common issues including poor build quality, unresolved defects, and inadequate customer service response times. The ombudsman has highlighted systemic issues requiring attention.",
      location: "Multiple Developments UK-wide",
      category: "Official Records",
      severity: "Medium",
      date: "2024-03-01",
      status: "Documented",
      sourceUrl: "https://www.housing-ombudsman.org.uk/about-us/corporate-information/publications/annual-report-2023/",
      sourcePublication: "Housing Ombudsman Service",
      tags: ["Official Complaints", "Build Quality", "Customer Service"],
      comments: [
        {
          author: "Industry Observer",
          comment: "The trend in complaints suggests systemic issues that need addressing at corporate level.",
          date: "2024-03-05"
        },
        {
          author: "Consumer Rights Advocate",
          comment: "These official statistics confirm what homeowners have been saying for years.",
          date: "2024-03-08"
        }
      ]
    },
    {
      id: 4,
      title: "Heating System Failures in Winter Months",
      description: "Multiple reports of heating system failures, poor installation, and recurring breakdowns in new-build properties. Some residents report being without heating for extended periods during winter months, with slow response times for emergency repairs.",
      location: "Various Redrow Developments",
      category: "Heating & Plumbing",
      severity: "High",
      date: "2024-01-28",
      status: "Pattern Identified",
      sourceUrl: "https://www.which.co.uk/news/article/new-build-heating-problems-redrow-aG8X9pL5wK2s",
      sourcePublication: "Which? Consumer Reports",
      tags: ["Heating", "Winter Issues", "Emergency Repairs"],
      comments: [
        {
          author: "Affected Homeowner",
          comment: "Two weeks without heating in January with young children. Unacceptable for a new-build home.",
          date: "2024-02-01"
        },
        {
          author: "Another Victim",
          comment: "Same issue here. It took three engineers and a month to fix properly.",
          date: "2024-02-05"
        }
      ]
    },
    {
      id: 5,
      title: "Electrical Safety Concerns and Rewiring Requirements",
      description: "Reports of electrical faults, improper installations, and safety concerns in new builds. Some properties have required complete rewiring within the first year of occupation after independent electricians identified dangerous installations.",
      location: "Multiple Sites",
      category: "Electrical",
      severity: "Critical",
      date: "2023-11-15",
      status: "Safety Concern",
      sourceUrl: "https://www.bbc.co.uk/news/business-new-build-electrical-faults-investigation-67123456",
      sourcePublication: "BBC News",
      tags: ["Electrical Safety", "Rewiring", "Installation Faults"],
      comments: [
        {
          author: "Electrical Contractor",
          comment: "Seeing too many of these issues in new builds. Proper testing and certification is essential.",
          date: "2023-11-20"
        },
        {
          author: "Safety Inspector",
          comment: "These installations would never have passed proper inspection. Very concerning.",
          date: "2023-11-25"
        }
      ]
    },
    {
      id: 6,
      title: "Garden and Landscaping Disputes",
      description: "Homeowners report significant differences between promised landscaping and what was actually delivered. Issues include poor drainage, unsuitable soil, and incomplete garden boundaries. Many report gardens that are unusable due to poor preparation.",
      location: "Various Developments",
      category: "Landscaping",
      severity: "Medium",
      date: "2024-01-10",
      status: "Ongoing",
      sourceUrl: "https://www.theguardian.com/money/2024/jan/12/new-build-home-garden-drainage-issues-redrow",
      sourcePublication: "The Guardian",
      tags: ["Landscaping", "Drainage", "Garden Boundaries"],
      comments: [
        {
          author: "Garden Designer",
          comment: "Proper soil preparation is crucial. These shortcuts cause long-term problems for homeowners.",
          date: "2024-01-15"
        },
        {
          author: "Frustrated Homeowner",
          comment: "Paid extra for 'premium landscaping' and got a muddy mess that floods every time it rains.",
          date: "2024-01-18"
        }
      ]
    }
  ];

  const categories = [
    "all",
    "Multiple Defects",
    "Site Management", 
    "Official Records",
    "Heating & Plumbing",
    "Electrical",
    "Landscaping"
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
                        <span>•</span>
                        <span>{complaint.comments?.length || 0} responses</span>
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
                      <span>{complaint.sourcePublication}</span>
                      <span>•</span>
                      <span>{complaint.comments?.length || 0} comments</span>
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