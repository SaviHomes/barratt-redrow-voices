import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { User, LogOut, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AuthNavigation() {
  const { user, signOut, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

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

  if (loading) {
    return <div className="w-20 h-10 bg-muted animate-pulse rounded" />;
  }

  if (!user) {
    return (
      <div className="hidden md:flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link to="/login">Sign In</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{user.email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {isAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={signOut}
          className="flex items-center text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}