import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  propertyNumber: z.string().optional(),
  developmentName: z.string().max(100, "Development name must be less than 100 characters").optional(),
  streetName: z.string().min(1, "Street/Road name is required").max(100, "Street name must be less than 100 characters"),
  townCity: z.string().min(1, "Town/City is required").max(50, "Town/City must be less than 50 characters"),
  county: z.string().min(1, "County is required").max(50, "County must be less than 50 characters"),
  postcode: z.string().min(1, "Postcode is required").max(10, "Postcode must be less than 10 characters"),
  homeTel: z.string().optional(),
  mobileTel: z.string().optional(),
  whatsappConsent: z.boolean().default(false),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  confirmPassword: z.string(),
  buildStyle: z.string().optional(),
  adviceToOthers: z.string().optional(),
  gloUpdatesConsent: z.boolean().default(false),
  nhbcContact: z.enum(["yes", "no", "not-answered"], {
    required_error: "Please select an option"
  }),
  socialMediaConsent: z.enum(["yes", "no", "not-answered"], {
    required_error: "Please select an option"
  }),
  decisionInfluenced: z.enum(["yes", "no", "not-answered"], {
    required_error: "Please select an option"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
type RegisterFormData = z.infer<typeof registerSchema>;
export default function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      whatsappConsent: false,
      gloUpdatesConsent: false,
      nhbcContact: "not-answered",
      socialMediaConsent: "not-answered",
      decisionInfluenced: "not-answered"
    }
  });
  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const {
        data: authData,
        error
      } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            property_number: data.propertyNumber || '',
            development_name: data.developmentName || '',
            street_name: data.streetName,
            town_city: data.townCity,
            county: data.county,
            postcode: data.postcode,
            home_tel: data.homeTel || '',
            mobile_tel: data.mobileTel || '',
            whatsapp_consent: data.whatsappConsent,
            build_style: data.buildStyle || '',
            advice_to_others: data.adviceToOthers || '',
            nhbc_contact: data.nhbcContact === "yes",
            social_media_consent: data.socialMediaConsent === "yes",
            decision_influenced: data.decisionInfluenced === "yes",
            glo_updates_consent: data.gloUpdatesConsent
          }
        }
      });
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // If user consented to GLO updates, create glo_interest record
      if (data.gloUpdatesConsent && authData.user) {
        const { error: gloError } = await supabase
          .from('glo_interest')
          .insert({
            user_id: authData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: data.mobileTel || data.homeTel || null,
            development_name: data.developmentName || null,
            property_address: `${data.propertyNumber || ''} ${data.streetName}, ${data.townCity}, ${data.county}, ${data.postcode}`.trim(),
            contact_consent: true,
            additional_comments: `Registered interest during account creation on ${new Date().toLocaleDateString()}`
          });

        if (gloError) {
          console.error('Error creating GLO interest record:', gloError);
          // Don't block registration if this fails
        }
      }

      toast({
        title: "Registration Successful!",
        description: "Welcome! You can now access all features."
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <Layout>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Join Redrow Exposed</CardTitle>
            <CardDescription>
              Share your experience and help others make informed decisions about Barratt Redrow properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={form.control} name="lastName" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                </div>

                <Separator />

                {/* Property Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="propertyNumber" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Property Number / Plot Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={form.control} name="developmentName" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Development Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., The Meadows, Riverside Park, etc." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField control={form.control} name="streetName" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Street/Road Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField control={form.control} name="townCity" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Town/City *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={form.control} name="county" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>County *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={form.control} name="postcode" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Postcode *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="homeTel" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Home Tel</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={form.control} name="mobileTel" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Mobile Tel</FormLabel>
                          <FormControl>
                            <Input {...field} type="tel" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                  <FormField control={form.control} name="whatsappConsent" render={({
                    field
                  }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm">
                          I would like to join the WhatsApp group for updates and discussions
                        </FormLabel>
                      </FormItem>} />
                  <FormField control={form.control} name="gloUpdatesConsent" render={({
                    field
                  }) => <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm">
                          I want to be kept informed about updates and developments regarding Group Litigation Orders (GLOs)
                        </FormLabel>
                      </FormItem>} />
                  <FormField control={form.control} name="email" render={({
                    field
                  }) => <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>

                <Separator />

                {/* Account Security */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="password" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Choose Password *</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    <FormField control={form.control} name="confirmPassword" render={({
                      field
                    }) => <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                  </div>
                </div>

                <Separator />

                {/* Property Experience */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Your Experience</h3>
                  <FormField control={form.control} name="buildStyle" render={({
                    field
                  }) => <FormItem>
                        <FormLabel>What build style did you buy?</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., New Build, Help to Buy, Off Plan, etc." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="adviceToOthers" render={({
                    field
                  }) => <FormItem>
                        <FormLabel>What advice would you give to others thinking about buying a Barratt Redrow property?</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" placeholder="Share your experience and advice..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="nhbcContact" render={({
                    field
                  }) => <FormItem className="space-y-3">
                        <FormLabel>Did you contact NHBC or any other redress scheme in relation to your experience?</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="nhbc-yes" />
                              <Label htmlFor="nhbc-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="nhbc-no" />
                              <Label htmlFor="nhbc-no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="socialMediaConsent" render={({
                    field
                  }) => <FormItem className="space-y-3">
                        <FormLabel>If you have left negative comments about your experience on Social Media, are you prepared to remove these comments in the event a positive outcome is achieved?</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="social-yes" />
                              <Label htmlFor="social-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="social-no" />
                              <Label htmlFor="social-no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                  <FormField control={form.control} name="decisionInfluenced" render={({
                    field
                  }) => <FormItem className="space-y-3">
                        <FormLabel>We are planning on making all UK Estate Agents aware of people's experience with Barratt Redrow by virtue of this website. It is hoped they will help their sellers make more informed buying decisions when considering a new build property. Do you think your decision would have been influenced with the benefit of this information?</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="decision-yes" />
                              <Label htmlFor="decision-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="decision-no" />
                              <Label htmlFor="decision-no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />
                </div>

                <div className="flex flex-col space-y-4">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary hover:underline">
                      Sign in here
                    </Link>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
          </Card>
        </div>
      </div>
    </Layout>;
}