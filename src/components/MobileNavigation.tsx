import { useState, useEffect } from "react";
import { Menu, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        setIsAdmin(!!data);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col space-y-4 mt-6">
            <Link 
              to="/developments" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Developments
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className="text-foreground hover:text-primary transition-colors py-2 text-lg"
                onClick={closeMenu}
              >
                My Dashboard
              </Link>
            )}
            <Link 
              to="/redrow-defects" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Defects
            </Link>
            <Link 
              to="/redrow-complaints" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Complaints
            </Link>
            <Link 
              to="/submit-claim" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Submit Claim
            </Link>
            <Link 
              to="/upload-evidence" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Upload Evidence
            </Link>
            <a 
              href="/#faq" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              FAQ
            </a>
            <Link 
              to="/contact" 
              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
              onClick={closeMenu}
            >
              Contact
            </Link>
            {user && (
              <Button asChild variant="default" className="justify-start h-12 w-full">
                <Link to="/dashboard" onClick={closeMenu}>
                  Dashboard
                </Link>
              </Button>
            )}
            
            {/* Authentication Section */}
            <div className="border-t border-border pt-4 mt-6">
              {loading ? (
                <div className="w-full h-10 bg-muted animate-pulse rounded" />
              ) : !user ? (
                <div className="flex flex-col space-y-3">
                  <Button variant="ghost" asChild className="justify-start h-12">
                    <Link to="/login" onClick={closeMenu}>
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className="justify-start h-12">
                    <Link to="/register" onClick={closeMenu}>
                      Register
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center space-x-2 px-3 py-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">{user.email}</span>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" asChild className="justify-start h-12">
                      <Link to="/admin" onClick={closeMenu}>
                        <Shield className="h-4 w-4 mr-2" />
                        Admin Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      signOut();
                      closeMenu();
                    }}
                    className="justify-start h-12 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}