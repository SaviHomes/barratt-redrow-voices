import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSetting {
  id: string;
  key: string;
  value: any; // JSONB type from database
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

export function useSiteSettings() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      // Convert array to object for easy access
      const settings: Record<string, any> = {};
      data?.forEach((setting: SiteSetting) => {
        settings[setting.key] = setting.value;
      });

      return settings;
    },
    staleTime: 60000, // Cache for 1 minute
  });

  return {
    developmentsEnabled: data?.developments_page_enabled === true,
    settings: data,
    isLoading,
    refetch,
  };
}
