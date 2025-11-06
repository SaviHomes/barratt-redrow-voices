import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings, ArrowLeft } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { developmentsEnabled, customerExperiencesEnabled, isLoading: settingsLoading, refetch } = useSiteSettings();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    developmentsPageEnabled: false,
    customerExperiencesEnabled: false,
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    if (!settingsLoading) {
      setSettings({
        developmentsPageEnabled: developmentsEnabled,
        customerExperiencesEnabled: customerExperiencesEnabled,
      });
    }
  }, [developmentsEnabled, customerExperiencesEnabled, settingsLoading]);

  const checkAdminStatus = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setIsAdmin(!!data);
      
      if (!data) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges to view this page.",
          variant: "destructive",
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Error",
        description: "Failed to verify admin status.",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update developments page setting
      const { error: devError } = await supabase
        .from('site_settings')
        .update({
          value: settings.developmentsPageEnabled,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'developments_page_enabled');

      if (devError) throw devError;

      // Update customer experiences setting
      const { error: custError } = await supabase
        .from('site_settings')
        .update({
          value: settings.customerExperiencesEnabled,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'customer_experiences_enabled');

      if (custError) throw custError;

      await refetch();

      toast({
        title: "Settings saved",
        description: "Site settings have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || settingsLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button onClick={() => navigate('/admin')} variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Site Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure site-wide features and visibility settings
          </p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Page Visibility</CardTitle>
              <CardDescription>
                Control which pages are visible to public users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                  <Label htmlFor="developments-page" className="text-base font-medium">
                    Developments Directory Page
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    When enabled, the Developments page will be visible in navigation and accessible to all users.
                    When disabled, only admins can access it for preview.
                  </p>
                </div>
                <Switch
                  id="developments-page"
                  checked={settings.developmentsPageEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, developmentsPageEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between space-x-4 pt-6 border-t">
                <div className="flex-1">
                  <Label htmlFor="customer-experiences" className="text-base font-medium">
                    Customer Experiences by Development Section
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    When enabled, the "Customer Experiences by Development" section will be visible on the homepage.
                    When disabled, the section will be hidden from all users.
                  </p>
                </div>
                <Switch
                  id="customer-experiences"
                  checked={settings.customerExperiencesEnabled}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, customerExperiencesEnabled: checked }))
                  }
                />
              </div>

              <div className="pt-4 border-t">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
