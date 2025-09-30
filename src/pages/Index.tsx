import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Camera, MessageSquare, AlertTriangle, CheckCircle, Share2, Facebook, Twitter, Linkedin, Instagram, MessageCircle, Mail, Copy, Youtube, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import SEOContent from "@/components/SEOContent";
import Layout from "@/components/Layout";

const Index = () => {
  const { user } = useAuth();
  
  // Track visitor analytics
  useVisitorTracking();

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
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
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