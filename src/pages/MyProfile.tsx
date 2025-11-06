import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  propertyNumber: z.string().optional(),
  developmentName: z.string().optional(),
  streetName: z.string().min(1, "Street name is required"),
  townCity: z.string().min(1, "Town/City is required"),
  county: z.string().min(1, "County is required"),
  postcode: z.string().min(1, "Postcode is required"),
  homeTel: z.string().optional(),
  mobileTel: z.string().optional(),
  buildStyle: z.string().optional(),
  adviceToOthers: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function MyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      propertyNumber: "",
      developmentName: "",
      streetName: "",
      townCity: "",
      county: "",
      postcode: "",
      homeTel: "",
      mobileTel: "",
      buildStyle: "",
      adviceToOthers: "",
    },
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          firstName: data.first_name || "",
          lastName: data.last_name || "",
          propertyNumber: data.property_number || "",
          developmentName: data.development_name || "",
          streetName: data.street_name || "",
          townCity: data.town_city || "",
          county: data.county || "",
          postcode: data.postcode || "",
          homeTel: data.home_tel || "",
          mobileTel: data.mobile_tel || "",
          buildStyle: data.build_style || "",
          adviceToOthers: data.advice_to_others || "",
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          property_number: data.propertyNumber || null,
          development_name: data.developmentName || null,
          street_name: data.streetName,
          town_city: data.townCity,
          county: data.county,
          postcode: data.postcode,
          home_tel: data.homeTel || null,
          mobile_tel: data.mobileTel || null,
          build_style: data.buildStyle || null,
          advice_to_others: data.adviceToOthers || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information and property details
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details below</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="propertyNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Property Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="developmentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Development Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="streetName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Street Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="townCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Town/City *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="county"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>County *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="postcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Postcode *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="homeTel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home Tel</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="mobileTel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile Tel</FormLabel>
                            <FormControl>
                              <Input {...field} type="tel" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Property Experience</h3>
                    <FormField
                      control={form.control}
                      name="buildStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Build Style</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="adviceToOthers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advice to Others</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
