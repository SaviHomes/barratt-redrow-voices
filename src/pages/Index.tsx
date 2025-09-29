import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Camera, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Development Notice */}
      <div className="bg-muted py-3 text-center">
        <p className="text-sm text-muted-foreground">
          🚧 <strong>Site in Development</strong> - Content, statistics, and features shown are placeholders for demonstration purposes
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">RedrowExposed</h1>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#community" className="text-muted-foreground hover:text-primary transition-colors">Community</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-secondary/20">
        <div className="container mx-auto px-6 text-center">
          <Badge variant="secondary" className="mb-6">
            Your Voice Matters
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Share Your <span className="text-primary">Barratt Redrow</span><br />
            Home Experience
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            A platform dedicated to transparency, accountability, and community support for Barratt Redrow homeowners. 
            Share your story, upload evidence, and help others navigate their property issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="px-8 py-6 text-lg">
              Share Your Experience
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              Browse Stories
            </Button>
          </div>
        </div>
      </section>

      {/* Issues Alert */}
      <section className="py-12 bg-primary/10 border-y border-primary/20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center space-x-4">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <p className="text-lg font-medium text-foreground">
              Experiencing quality issues with your Barratt Redrow home? You're not alone.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Platform Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to document, share, and resolve property issues
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
          <Button size="lg" variant="secondary" className="px-8 py-6 text-lg">
            Get Started Today
          </Button>
        </div>
      </section>

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
            <p className="text-muted-foreground">
              © 2024 RedrowExposed. Empowering homeowners through transparency.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;