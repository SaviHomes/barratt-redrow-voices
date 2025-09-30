import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Home, Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const RedrowDefects = () => {
  const commonDefects = [
    {
      category: "Structural Issues",
      problems: ["Foundation settling", "Wall cracks", "Roof leaks", "Window frame problems"],
      severity: "High",
      timeframe: "Often appear within 2-5 years"
    },
    {
      category: "Water Damage",
      problems: ["Bathroom leaks", "Kitchen plumbing", "Heating system issues", "Poor waterproofing"],
      severity: "High", 
      timeframe: "Can appear immediately or within first year"
    },
    {
      category: "Electrical Problems",
      problems: ["Faulty wiring", "Power outages", "Socket issues", "Safety concerns"],
      severity: "Critical",
      timeframe: "May not be apparent until later inspections"
    },
    {
      category: "Heating & Insulation",
      problems: ["Poor insulation", "Boiler problems", "Radiator issues", "High energy bills"],
      severity: "Medium",
      timeframe: "Usually noticed in first winter"
    }
  ];

  const developmentIssues = [
    {
      name: "The Meadows, Birmingham",
      year: "2019-2021",
      issues: "Multiple properties with foundation problems, water ingress",
      status: "Ongoing legal action"
    },
    {
      name: "Riverside Gardens, Manchester", 
      year: "2020-2022",
      issues: "Heating system failures, poor insulation, electrical faults",
      status: "Remedial work partially completed"
    },
    {
      name: "Heritage Park, Leeds",
      year: "2018-2020", 
      issues: "Roof leaks, window defects, drainage problems",
      status: "Individual claims being processed"
    }
  ];

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Redrow Property Defects & Build Quality Issues | Common Problems & Solutions</title>
      <meta name="description" content="Comprehensive guide to Redrow property defects, build quality issues, and common problems. Get help with Redrow homeowner complaints and defect claims." />
      <meta name="keywords" content="Redrow defects, Redrow build quality, Redrow problems, Redrow complaints, Redrow property issues, Redrow homeowner problems" />
      <link rel="canonical" href={`${window.location.origin}/redrow-defects`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "Redrow Property Defects & Build Quality Issues",
          "description": "Comprehensive guide to common Redrow property defects and how to address them",
          "author": {
            "@type": "Organization",
            "name": "Redrow Exposed"
          },
          "publisher": {
            "@type": "Organization", 
            "name": "Redrow Exposed"
          },
          "datePublished": new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${window.location.origin}/redrow-defects`
          }
        })}
      </script>

      <Layout>
        <main className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-6 max-w-6xl">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <span className="mx-2">/</span>
              <span className="text-foreground">Redrow Property Defects</span>
            </nav>

            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Redrow Property Defects & Build Quality Issues
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Comprehensive guide to common Redrow property defects, what to look for, and how to take action. 
                If you're experiencing issues with your Redrow home, you're not alone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/submit-claim">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Submit Your Claim
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/upload-evidence">
                    Upload Evidence
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6 text-center">
                  <Home className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-2">500+</div>
                  <p className="text-muted-foreground">Properties with reported defects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-2">200+</div>
                  <p className="text-muted-foreground">Homeowners seeking support</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-3xl font-bold text-primary mb-2">2018+</div>
                  <p className="text-muted-foreground">Years of documented issues</p>
                </CardContent>
              </Card>
            </div>

            {/* Common Defects Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8">Common Redrow Property Defects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {commonDefects.map((defect, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{defect.category}</CardTitle>
                        <Badge variant={
                          defect.severity === "Critical" ? "destructive" : 
                          defect.severity === "High" ? "secondary" : "outline"
                        }>
                          {defect.severity}
                        </Badge>
                      </div>
                      <CardDescription>{defect.timeframe}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {defect.problems.map((problem, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <AlertTriangle className="h-4 w-4 text-destructive mr-2 flex-shrink-0" />
                            {problem}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Development Issues */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8">Known Redrow Development Issues</h2>
              <div className="space-y-6">
                {developmentIssues.map((development, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary" />
                            {development.name}
                          </CardTitle>
                          <CardDescription>Built: {development.year}</CardDescription>
                        </div>
                        <Badge variant="outline">{development.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{development.issues}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* What to Do Section */}
            <section className="mb-12">
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="text-2xl">What to Do if You Have Redrow Property Defects</CardTitle>
                  <CardDescription>
                    Step-by-step guide to addressing issues with your Redrow property
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
                          Take photos, videos, and detailed notes of all defects. Keep records of when issues first appeared.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Contact Redrow Customer Care</h3>
                        <p className="text-muted-foreground">
                          Report issues through official channels first. Keep copies of all correspondence.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Get Professional Assessment</h3>
                        <p className="text-muted-foreground">
                          Hire an independent surveyor or building inspector to assess the defects professionally.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Submit a Financial Claim</h3>
                        <p className="text-muted-foreground">
                          If Redrow doesn't respond appropriately, submit a formal financial claim for damages and costs.
                        </p>
                        <Button className="mt-3" asChild>
                          <Link to="/submit-claim">
                            Submit Claim Now
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* FAQ Section */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions About Redrow Defects</h2>
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">How long do I have to report Redrow property defects?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      You typically have up to 6 years from discovery of defects to take legal action, though warranty periods may vary. 
                      Contact us immediately if you discover issues.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">What compensation can I claim for Redrow defects?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      You may be entitled to repair costs, temporary accommodation expenses, legal fees, and compensation for 
                      inconvenience and stress. Each case is assessed individually.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Do I need a lawyer for Redrow defect claims?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      While not always necessary, legal representation can significantly improve your chances of success, 
                      especially for complex cases or when Redrow disputes your claim.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold mb-4">Don't Let Redrow Ignore Your Property Defects</h2>
                  <p className="text-xl mb-6 opacity-90">
                    Join hundreds of other homeowners who have taken action against poor build quality.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button size="lg" variant="secondary" asChild>
                      <Link to="/submit-claim">Submit Your Claim</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                      <Link to="/contact">Get Free Consultation</Link>
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

export default RedrowDefects;