import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import UserDashboard from "./UserDashboard";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    checkRoleAndRedirect();
  }, [user]);

  const checkRoleAndRedirect = async () => {
    if (authLoading || !user) {
      setIsCheckingRole(false);
      return;
    }

    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (data) {
        // User is admin, redirect to admin dashboard
        navigate("/admin", { replace: true });
      } else {
        // Regular user, show user dashboard
        setIsCheckingRole(false);
      }
    } catch (error) {
      console.error("Error checking role:", error);
      setIsCheckingRole(false);
    }
  };

  if (authLoading || isCheckingRole) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show UserDashboard for regular users
  return <UserDashboard />;
}
