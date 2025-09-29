import { Shield } from "lucide-react";
import AuthNavigation from "@/components/AuthNavigation";
import MobileNavigation from "@/components/MobileNavigation";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <a href="/" className="text-2xl font-bold text-foreground hover:text-primary transition-colors">
                RedrowExposed
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a 
                href="#features" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
              <a 
                href="/upload-evidence" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Upload Evidence
              </a>
              <a 
                href="#community" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Community
              </a>
              <a 
                href="#contact" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
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
    </div>
  );
}