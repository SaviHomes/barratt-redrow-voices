import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, MessageSquare } from "lucide-react";

interface DevelopmentExperience {
  development_name: string;
  advice_to_others: string | null;
  build_style: string | null;
  decision_influenced: boolean | null;
  first_name: string;
}

export default function DevelopmentFilter() {
  const [developments, setDevelopments] = useState<string[]>([]);
  const [selectedDevelopment, setSelectedDevelopment] = useState<string>("all");
  const [experiences, setExperiences] = useState<DevelopmentExperience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopments();
  }, []);

  useEffect(() => {
    if (selectedDevelopment !== "all") {
      fetchExperiences(selectedDevelopment);
    } else {
      setExperiences([]);
    }
  }, [selectedDevelopment]);

  const fetchDevelopments = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("development_name")
        .not("development_name", "is", null)
        .not("development_name", "eq", "")
        .order("development_name");

      if (error) {
        console.error("Error fetching developments:", error);
        return;
      }

      const uniqueDevelopments = Array.from(
        new Set(data?.map((d) => d.development_name).filter(Boolean) as string[])
      );
      setDevelopments(uniqueDevelopments);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExperiences = async (development: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("development_name, advice_to_others, build_style, decision_influenced, first_name")
        .eq("development_name", development)
        .not("advice_to_others", "is", null)
        .not("advice_to_others", "eq", "");

      if (error) {
        console.error("Error fetching experiences:", error);
        return;
      }

      setExperiences(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (developments.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Customer Experiences by Development
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Read real experiences from homeowners in different Redrow developments
          </p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <Select value={selectedDevelopment} onValueChange={setSelectedDevelopment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a development" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Developments</SelectItem>
              {developments.map((dev) => (
                <SelectItem key={dev} value={dev}>
                  {dev}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedDevelopment !== "all" && experiences.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Building2 className="h-4 w-4 mr-2" />
                {experiences.length} {experiences.length === 1 ? "Experience" : "Experiences"} from {selectedDevelopment}
              </Badge>
            </div>

            {experiences.map((exp, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Homeowner Experience
                  </CardTitle>
                  <CardDescription>
                    Development: {exp.development_name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exp.advice_to_others && (
                    <div>
                      <h4 className="font-semibold mb-2">Advice to Others:</h4>
                      <p className="text-muted-foreground bg-muted p-4 rounded-lg">
                        "{exp.advice_to_others}"
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 flex-wrap">
                    {exp.build_style && (
                      <Badge variant="outline">
                        Build Style: {exp.build_style}
                      </Badge>
                    )}
                    {exp.decision_influenced !== null && (
                      <Badge variant={exp.decision_influenced ? "destructive" : "secondary"}>
                        Decision {exp.decision_influenced ? "Influenced" : "Not Influenced"} by Platform
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedDevelopment !== "all" && experiences.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No experiences shared yet for {selectedDevelopment}. Be the first to share your experience!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
