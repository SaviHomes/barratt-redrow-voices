import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Star, Clock, TrendingUp, Users, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const RedrowComplaints = () => {
  const [showReviewForm, setShowReviewForm] = useState(false);

  const complaintCategories = [
    {
      category: "Build Quality",
      count: "156 complaints",
      severity: "High",
      common: ["Poor workmanship", "Structural defects", "Finishing issues", "Safety concerns"]
    },
    {
      category: "Customer Service", 
      count: "89 complaints",
      severity: "Medium",
      common: ["Slow response times", "Unhelpful staff", "Broken promises", "Poor communication"]
    },
    {
      category: "Warranty Claims",
      count: "134 complaints", 
      severity: "High",
      common: ["Denied valid claims", "Delayed repairs", "Incomplete fixes", "Hidden costs"]
    },
    {
      category: "Sales Process",
      count: "67 complaints",
      severity: "Medium", 
      common: ["Misleading information", "Pressure tactics", "Hidden fees", "Contract issues"]
    }
  ];

  const recentComplaints = [
    {
      location: "Heritage Village, Birmingham",
      date: "March 2024",
      issue: "Multiple roof leaks causing interior damage. Redrow refusing warranty coverage.",
      status: "Unresolved",
      rating: 1
    },
    {
      location: "Meadowbrook, Manchester",
      date: "February 2024", 
      issue: "Electrical faults throughout property. Safety concerns raised with local authority.",
      status: "Ongoing",
      rating: 1
    },
    {
      location: "Riverside Gardens, Leeds",
      date: "January 2024",
      issue: "Foundation settling causing cracks. Told it's 'normal settling' by Redrow.",
      status: "Escalated",
      rating: 2
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Redrow Complaints & Customer Reviews | Real Homeowner Experiences</title>
      <meta name="description" content="Read real Redrow complaints and customer reviews from homeowners. Build quality issues, poor customer service, and warranty claim problems documented." />
      <meta name="keywords" content="Redrow complaints, Redrow reviews, Redrow customer service, Redrow problems, Redrow homeowner complaints, Redrow build quality complaints" />
      <link rel="canonical" href={`${window.location.origin}/redrow-complaints`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Review",
          "itemReviewed": {
            "@type": "Organization",
            "name": "Redrow Homes"
          },
          "reviewRating": {
            "@type": "Rating", 
            "ratingValue": "2.1",
            "bestRating": "5"
          },
          "author": {
            "@type": "Organization",
            "name": "Redrow Exposed"
          },
          "reviewBody": "Collection of verified homeowner complaints and experiences with Redrow Homes build quality and customer service issues."
        })}
      </script>

      <Layout>
        <main className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <span className="mx-2">/</span>
              <span className="text-foreground">Redrow Complaints</span>
            </nav>

            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Redrow Complaints & Customer Reviews
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Real experiences from Redrow homeowners. Read verified complaints about build quality, 
                customer service, and warranty issues. Share your own experience.
              </p>
              
              {/* Overall Rating */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-destructive">2.1</div>
                  <div className="flex items-center justify-center mb-2">
                    {[1,2,3,4,5].map((star) => (
                      <Star 
                        key={star} 
                        className={`h-5 w-5 ${star <= 2 ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} 
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Based on 446 reviews</p>
                </div>
              </div>

              <Button onClick={() => setShowReviewForm(!showReviewForm)} className="mr-4">
                Share Your Experience
              </Button>
              <Button variant="outline" asChild>
                <Link to="/submit-claim">Submit Formal Complaint</Link>
              </Button>
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <Card className="mb-12">
                <CardHeader>
                  <CardTitle>Share Your Redrow Experience</CardTitle>
                  <CardDescription>
                    Help other homeowners by sharing your experience with Redrow Homes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Your Experience</label>
                      <Textarea placeholder="Tell us about your experience with Redrow - build quality, customer service, any issues you've encountered..." />
                    </div>
                    <div className="flex gap-4">
                      <Button>Submit Review</Button>
                      <Button variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Complaint Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-2">446</div>
                  <p className="text-muted-foreground">Total Complaints</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-destructive mx-auto mb-3" />
                  <div className="text-3xl font-bold text-destructive mb-2">23%</div>
                  <p className="text-muted-foreground">Increase this year</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                  <div className="text-3xl font-bold text-orange-500 mb-2">67%</div>
                  <p className="text-muted-foreground">Unresolved cases</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-2">312</div>
                  <p className="text-muted-foreground">Affected homeowners</p>
                </CardContent>
              </Card>
            </div>

            {/* Complaint Categories */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8">Common Redrow Complaint Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {complaintCategories.map((category, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{category.category}</CardTitle>
                        <Badge variant={category.severity === "High" ? "destructive" : "secondary"}>
                          {category.severity}
                        </Badge>
                      </div>
                      <CardDescription>{category.count}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {category.common.map((issue, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recent Complaints */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8">Recent Redrow Complaints</h2>
              <div className="space-y-6">
                {recentComplaints.map((complaint, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{complaint.location}</CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {complaint.date}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            {[1,2,3,4,5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-4 w-4 ${star <= complaint.rating ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} 
                              />
                            ))}
                          </div>
                          <Badge variant={complaint.status === "Unresolved" ? "destructive" : "secondary"}>
                            {complaint.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{complaint.issue}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* How to Complain */}
            <section className="mb-12">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    How to Make an Effective Redrow Complaint
                  </CardTitle>
                  <CardDescription>
                    Follow these steps to ensure your complaint is taken seriously
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Document Everything</h3>
                        <p className="text-muted-foreground">
                          Take detailed photos, keep all correspondence, and maintain a timeline of events. 
                          Evidence is crucial for a successful complaint.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Contact Redrow Customer Care First</h3>
                        <p className="text-muted-foreground">
                          Give Redrow the opportunity to resolve the issue through their official complaint process. 
                          Keep records of all interactions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Escalate if Necessary</h3>
                        <p className="text-muted-foreground">
                          If Redrow doesn't respond adequately, escalate to the Housing Ombudsman, 
                          local trading standards, or consider legal action.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Get Professional Support</h3>
                        <p className="text-muted-foreground">
                          Submit a formal complaint through our platform to get professional support 
                          and increase your chances of a successful resolution.
                        </p>
                        <Button className="mt-3" asChild>
                          <Link to="/submit-claim">Submit Formal Complaint</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Warning Section */}
            <section className="mb-12">
              <Card className="border-destructive bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-destructive">⚠️ Common Issues with Redrow Customer Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• Delayed responses to complaints (often exceeding their stated timeframes)</li>
                    <li>• Denial of valid warranty claims using technical loopholes</li>
                    <li>• Inadequate temporary repairs that don't address root causes</li>
                    <li>• Pressure to accept settlement offers that don't cover full costs</li>
                    <li>• Poor communication between different Redrow departments</li>
                    <li>• Reluctance to take responsibility for serious structural defects</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* CTA Section */}
            <section className="text-center">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-4">Don't Let Your Redrow Complaint Be Ignored</h2>
                  <p className="text-xl mb-6 opacity-90">
                    Get professional support to ensure your complaint is taken seriously and resolved fairly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" asChild>
                      <Link to="/submit-claim">Submit Formal Complaint</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                      <Link to="/contact">Get Free Advice</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default RedrowComplaints;