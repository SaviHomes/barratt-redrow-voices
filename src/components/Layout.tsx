import { Shield } from "lucide-react";
import AuthNavigation from "@/components/AuthNavigation";
import MobileNavigation from "@/components/MobileNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
interface LayoutProps {
  children: React.ReactNode;
}
export default function Layout({
  children
}: LayoutProps) {
  const {
    user
  } = useAuth();
  const {
    developmentsEnabled
  } = useSiteSettings();
  return <div className="min-h-screen bg-background">
      {/* Development Notice */}
      <div className="bg-muted py-3 text-center border-b border-border">
        <p className="text-sm text-muted-foreground px-4">🚧 Site in Development - This platform is under active development. Some content, figures, layouts, and features are provisional and may change as submissions are verified and additional source material is added. Content reflects contributor experiences and illustrative summaries rather than definitive statements of fact.<strong>Site in Development</strong> - Content, statistics, and features shown are placeholders for demonstration purposes
        </p>
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <Link to="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">Redrow Exposed</Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              {developmentsEnabled && <Link to="/developments" className="text-muted-foreground hover:text-primary transition-colors">
                  Developments
                </Link>}
              <Link to="/redrow-defects" className="text-muted-foreground hover:text-primary transition-colors">
                Defects
              </Link>
              <Link to="/redrow-complaints" className="text-muted-foreground hover:text-primary transition-colors">
                Complaints
              </Link>
              <Link to="/news-articles" className="text-muted-foreground hover:text-primary transition-colors">
                News Articles
              </Link>
              <Link to="/socials" className="text-muted-foreground hover:text-primary transition-colors">
                Socials
              </Link>
              <Link to="/submit-claim" className="text-muted-foreground hover:text-primary transition-colors">
                Submit Claim
              </Link>
              <Link to="/upload-evidence" className="text-muted-foreground hover:text-primary transition-colors">
                Upload Evidence
              </Link>
              <a href="/#faq" className="text-muted-foreground hover:text-primary transition-colors">
                FAQ
              </a>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              {user && <Button asChild variant="default" size="sm">
                  <Link to="/dashboard">
                    Dashboard
                  </Link>
                </Button>}
            </nav>

            <div className="flex items-center space-x-4">
              <AuthNavigation />
              <MobileNavigation />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {children}
    </div>;
}