import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Camera, MessageSquare, AlertTriangle, CheckCircle, Share2, Facebook, Twitter, Linkedin, Instagram, MessageCircle, Mail, Copy, Youtube, Send, Scale, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import SEOContent from "@/components/SEOContent";
import Layout from "@/components/Layout";
import DevelopmentFilter from "@/components/DevelopmentFilter";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_published: boolean;
}

const Index = () => {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  
  // Track visitor analytics
  useVisitorTracking();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_published', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Redrow Exposed - Redrow Property Defects, Build Quality Issues & Homeowner Complaints</title>
      <meta name="description" content="The definitive resource for Redrow property defects and build quality issues. Submit financial claims, document defects, read complaints, and get compensation for Redrow homeowner problems." />
      <meta name="keywords" content="Redrow defects, Redrow complaints, Redrow build quality, Redrow property issues, Redrow homeowner problems, Redrow compensation claims" />
      <link rel="canonical" href={window.location.origin} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Redrow Exposed",
          "description": "Platform for Redrow homeowners to document property defects, submit financial claims, and share experiences about build quality issues",
          "url": window.location.origin,
          "sameAs": [],
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${window.location.origin}/redrow-defects?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          }
        })}
      </script>

      {/* FAQ Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "What types of Redrow property defects are common?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Common Redrow defects include structural issues, water damage, electrical problems, heating/insulation issues, roof leaks, and poor build quality finishing."
              }
            },
            {
              "@type": "Question", 
              "name": "Can I claim compensation for Redrow property defects?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, you may be entitled to compensation for repair costs, temporary accommodation, legal fees, and inconvenience caused by Redrow property defects."
              }
            },
            {
              "@type": "Question",
              "name": "How do I submit a complaint about Redrow build quality?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "You can submit a formal complaint through our platform, contact Redrow customer care directly, or escalate to the Housing Ombudsman if necessary."
              }
            }
          ]
        })}
      </script>

    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
        <div className="container mx-auto px-6 text-center">
          <Badge variant="secondary" className="mb-6">
            Your Voice Matters
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            <span className="text-primary">Redrow Exposed</span> - Redrow Property Defects<br />
            & Build Quality Issues Hub
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            The authoritative source for Redrow homeowner experiences, property defects, and build quality issues. 
            Join hundreds of Redrow homeowners documenting defects, sharing evidence, and fighting for accountability. 
            Submit financial claims for compensation and get support from our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-8 py-6 text-lg" asChild>
              <a href="/submit-claim">Submit Redrow Claim</a>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg" asChild>
              <a href="/redrow-defects">View Redrow Defects</a>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg" asChild>
              <a href="/redrow-complaints">Read Complaints</a>
            </Button>
          </div>
          
          {/* Quick Navigation to Key Pages */}
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <a href="/redrow-defects" className="text-primary hover:underline">Common Redrow Defects</a>
            <span className="text-muted-foreground">•</span>
            <a href="/redrow-complaints" className="text-primary hover:underline">Redrow Complaints & Reviews</a>
            <span className="text-muted-foreground">•</span>
            <a href="/upload-evidence" className="text-primary hover:underline">Upload Evidence</a>
          </div>
      </div>
    </section>

    {/* GLO Promotional Banner */}
    <section className="py-16 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-purple-500/20 border-y-2 border-primary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <Scale className="h-10 w-10 text-white" />
          </div>
          
          <Badge variant="secondary" className="mb-4 text-base px-4 py-1.5">
            🎯 New Legal Initiative
          </Badge>
          
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
            Join the Group Litigation Order Initiative
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Strength in numbers. We're exploring collective legal action to help Redrow homeowners pursue 
            claims together. Lower costs, expert legal support, and a stronger voice for justice.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-10 py-7 text-lg bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 shadow-lg" asChild>
              <a href="/group-litigation-info" className="flex items-center gap-2">
                Learn About Group Litigation
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Community-driven</span>
            </div>
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span>Legal expertise</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>Shared resources</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Issues Alert */}
      <section className="py-12 bg-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-4">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <p className="text-lg font-medium text-foreground">
              Experiencing Redrow property defects or build quality issues? Document your case and claim compensation.
            </p>
          </div>
        </div>
      </section>

      {/* Group Litigation Orders Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-blue-950/20 dark:via-indigo-950/10 dark:to-purple-950/20 border-t border-primary/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <Badge variant="secondary" className="mb-4">
                New Initiative
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Exploring Group Litigation Orders (GLOs)
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                We're investigating the possibility of Group Litigation Orders to help homeowners with similar Redrow property defects pursue claims collectively. GLOs allow multiple claimants to bring cases together, reducing individual costs and strengthening our negotiating position.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                By pooling resources and evidence, homeowners can access expert legal support and share the financial burden of litigation. This collective approach has proven effective in similar housing defect cases across the UK.
              </p>
              <Button size="lg" asChild>
                <a href="/group-litigation-info" className="flex items-center gap-2">
                  Learn More About GLOs
                  <ArrowRight className="h-5 w-5" />
                </a>
              </Button>
            </div>
            
            {/* Right: Visual Element */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
                <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-2xl p-12 shadow-xl border border-primary/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-24 h-24 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <Scale className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">Stronger Together</h3>
                    <p className="text-muted-foreground max-w-xs">
                      Join homeowners exploring collective legal action for justice and accountability
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Community-driven initiative</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Redrow Property Issues Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to document Redrow defects, submit financial claims, and get compensation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Share Experiences</CardTitle>
                <CardDescription>
                  Document and share your Barratt Redrow experience with detailed stories and timelines
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Photo Evidence</CardTitle>
                <CardDescription>
                  Upload photos of property issues to build a comprehensive record of problems
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Community Support</CardTitle>
                <CardDescription>
                  Connect with other homeowners facing similar issues and share advice
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>User Dashboard</CardTitle>
                <CardDescription>
                  Personal dashboard to track your cases, financial claims, photos, and communication history
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Admin Oversight</CardTitle>
                <CardDescription>
                  Dedicated admin dashboard for content moderation and community management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Developer Access</CardTitle>
                <CardDescription>
                  Dedicated portal for Barratt Redrow to view and respond to customer concerns
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Media Sharing Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-secondary/10 to-primary/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Share2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Help Spread Awareness
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Share RedrowExposed with your network to help more homeowners find support, document their experiences, 
              and drive positive change in the housing industry. Every share makes our community stronger.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {/* Facebook */}
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent("Join the RedrowExposed community - A platform for homeowner transparency and accountability");
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
              }}
              className="group flex flex-col items-center p-6 bg-card hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border"
            >
              <div className="w-12 h-12 bg-[#1877F2]/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#1877F2]/20 transition-colors">
                <Facebook className="h-6 w-6 text-[#1877F2] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">Facebook</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent("Check out RedrowExposed - A platform for homeowner transparency and accountability #HomeownerRights #PropertyIssues");
                window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
              }}
              className="group flex flex-col items-center p-6 bg-card hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border"
            >
              <div className="w-12 h-12 bg-foreground/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-foreground/20 transition-colors">
                <Twitter className="h-6 w-6 text-foreground group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">Twitter/X</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent("RedrowExposed - Homeowner Transparency Platform");
                const summary = encodeURIComponent("A community-driven platform for Barratt Redrow homeowners to share experiences and drive accountability");
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
              }}
              className="group flex flex-col items-center p-6 bg-card hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border"
            >
              <div className="w-12 h-12 bg-[#0A66C2]/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#0A66C2]/20 transition-colors">
                <Linkedin className="h-6 w-6 text-[#0A66C2] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">LinkedIn</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent("Check out RedrowExposed - A platform for homeowner transparency and accountability");
                window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
              }}
              className="group flex flex-col items-center p-6 bg-card hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border"
            >
              <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#25D366]/20 transition-colors">
                <MessageCircle className="h-6 w-6 text-[#25D366] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">WhatsApp</span>
            </button>

            {/* Telegram */}
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent("Check out RedrowExposed - A platform for homeowner transparency and accountability");
                window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
              }}
              className="group flex flex-col items-center p-6 bg-card hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border"
            >
              <div className="w-12 h-12 bg-[#0088CC]/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#0088CC]/20 transition-colors">
                <Send className="h-6 w-6 text-[#0088CC] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">Telegram</span>
            </button>

            {/* Email */}
            <button
              onClick={() => {
                const subject = encodeURIComponent("RedrowExposed - Homeowner Transparency Platform");
                const body = encodeURIComponent(`I wanted to share this platform with you: RedrowExposed\n\nIt's a community-driven platform for Barratt Redrow homeowners to share experiences, upload evidence of property issues, and drive accountability in the housing industry.\n\nCheck it out: ${window.location.href}\n\nBest regards`);
                window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
              }}
              className="group flex flex-col items-center p-6 bg-card hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                <Mail className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">Email</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  // You could add a toast notification here
                  alert('Link copied to clipboard!');
                } catch (err) {
                  // Fallback for older browsers
                  const textArea = document.createElement('textarea');
                  textArea.value = window.location.href;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  alert('Link copied to clipboard!');
                }
              }}
              className="group flex flex-col items-center p-6 bg-card hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border"
            >
              <div className="w-12 h-12 bg-secondary/30 rounded-full flex items-center justify-center mb-3 group-hover:bg-secondary/50 transition-colors">
                <Copy className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">Copy Link</span>
            </button>

            {/* Reddit */}
            <button
              onClick={() => {
                const url = encodeURIComponent(window.location.href);
                const title = encodeURIComponent("RedrowExposed - A platform for homeowner transparency and accountability");
                window.open(`https://reddit.com/submit?url=${url}&title=${title}`, '_blank');
              }}
              className="group flex flex-col items-center p-6 bg-card hover:bg-accent rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border border-border"
            >
              <div className="w-12 h-12 bg-[#FF4500]/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#FF4500]/20 transition-colors">
                <MessageSquare className="h-6 w-6 text-[#FF4500] group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-foreground group-hover:text-white transition-colors">Reddit</span>
            </button>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              <strong>Help us grow:</strong> The more homeowners who know about RedrowExposed, 
              the stronger our collective voice becomes in demanding quality and accountability.
            </p>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section id="community" className="py-20 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Building Transparency Together
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join a growing community of homeowners committed to accountability and quality
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Homeowner Stories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">1,200+</div>
              <div className="text-muted-foreground">Photos Uploaded</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">85%</div>
              <div className="text-muted-foreground">Issues Documented</div>
            </div>
          </div>
        </div>
      </section>

      {/* Development Filter Section */}
      <DevelopmentFilter />

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Common questions about Redrow property defects, claims, and using our platform
            </p>
          </div>

          <Accordion type="multiple" className="max-w-4xl mx-auto space-y-4">
            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <AccordionItem 
                  key={faq.id} 
                  value={faq.id}
                  className="border rounded-lg px-6 bg-card"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="text-lg font-semibold">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No FAQs available at this time.
              </div>
            )}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Help build a transparent community where homeowner experiences drive positive change
          </p>
          <Button size="lg" variant="secondary" className="px-8 py-6 text-lg" asChild>
            <a href={user ? "/upload-evidence" : "/register"}>
              {user ? "Upload Evidence" : "Get Started Today"}
            </a>
          </Button>
        </div>
      </section>

      {/* SEO Content Sections */}
      <SEOContent />

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">RedrowExposed</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-muted-foreground mb-2">
              © 2024 RedrowExposed. Empowering homeowners through transparency.
            </p>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Redrow Exposed</strong> - The UK's definitive resource for Barratt Redrow homeowner experiences and property issues
              </p>
              <p className="mb-2">
                Covering: Redrow problems, new build defects, homeowner rights, property warranties, building quality issues, and customer service complaints
              </p>
              <p>
                Join our community of homeowners sharing real experiences across England, Wales, and Scotland
              </p>
            </div>
          </div>
        </div>
      </footer>
    </Layout>
    </>
  );
};

export default Index;