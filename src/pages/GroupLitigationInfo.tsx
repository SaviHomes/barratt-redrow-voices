import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import BackToDashboard from "@/components/BackToDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Scale, Users, Shield, Info, Upload, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const defectCategories = [
  "Structural issues",
  "Water ingress / damp",
  "Drainage problems",
  "Roof defects",
  "Window/door defects",
  "Heating/ventilation issues",
  "Plumbing issues",
  "Electrical issues",
  "Flooring defects",
  "External cladding issues",
  "Other"
];

const gloInterestSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().max(20).optional(),
  development_name: z.string().max(200).optional(),
  property_address: z.string().max(500).optional(),
  defect_categories: z.array(z.string()).min(1, "Select at least one defect category"),
  estimated_damages: z.string().optional(),
  additional_comments: z.string().max(2000).optional(),
  contact_consent: z.boolean().refine(val => val === true, {
    message: "You must consent to being contacted about GLO updates"
  })
});

type GLOInterestForm = z.infer<typeof gloInterestSchema>;

export default function GroupLitigationInfo() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [existingRegistration, setExistingRegistration] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<GLOInterestForm>({
    resolver: zodResolver(gloInterestSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      development_name: "",
      property_address: "",
      defect_categories: [],
      estimated_damages: "",
      additional_comments: "",
      contact_consent: false
    }
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      checkExistingRegistration();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data && !error) {
        form.setValue('first_name', data.first_name || '');
        form.setValue('last_name', data.last_name || '');
        form.setValue('email', user?.email || '');
        form.setValue('phone', data.mobile_tel || data.home_tel || '');
        form.setValue('development_name', data.development_name || '');
        const address = [data.property_number, data.street_name, data.town_city, data.county, data.postcode]
          .filter(Boolean)
          .join(', ');
        form.setValue('property_address', address);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const checkExistingRegistration = async () => {
    try {
      const { data, error } = await supabase
        .from('glo_interest')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (data && !error) {
        setExistingRegistration(data);
        // Populate form with existing data
        form.setValue('first_name', data.first_name);
        form.setValue('last_name', data.last_name);
        form.setValue('email', data.email);
        form.setValue('phone', data.phone || '');
        form.setValue('development_name', data.development_name || '');
        form.setValue('property_address', data.property_address || '');
        form.setValue('defect_categories', data.defect_categories || []);
        form.setValue('estimated_damages', data.estimated_damages?.toString() || '');
        form.setValue('additional_comments', data.additional_comments || '');
        form.setValue('contact_consent', data.contact_consent);
      }
    } catch (error) {
      console.error('Error checking existing registration:', error);
    }
  };

  const onSubmit = async (data: GLOInterestForm) => {
    setSubmitting(true);
    try {
      const payload = {
        user_id: user?.id || '',
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        development_name: data.development_name || null,
        property_address: data.property_address || null,
        defect_categories: data.defect_categories,
        estimated_damages: data.estimated_damages ? parseFloat(data.estimated_damages) : null,
        additional_comments: data.additional_comments || null,
        contact_consent: data.contact_consent
      };

      if (existingRegistration) {
        const { error } = await supabase
          .from('glo_interest')
          .update(payload)
          .eq('id', existingRegistration.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Your registration has been updated successfully."
        });
      } else {
        const { error } = await supabase
          .from('glo_interest')
          .insert([payload]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Thank you for registering your interest! We'll keep you informed as we progress."
        });
      }

      await checkExistingRegistration();
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast({
        title: "Error",
        description: "Failed to register interest. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <BackToDashboard />
          
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              Coming Soon
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Group Litigation Orders (GLOs)</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Exploring collective legal action to help homeowners with similar defects achieve better outcomes together
            </p>
          </div>

          {/* Alert */}
          <Alert className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              We're currently investigating the feasibility of Group Litigation Orders for homeowners affected by similar construction defects. This page explains what GLOs are and how they could benefit you.
            </AlertDescription>
          </Alert>

          {/* What is a GLO */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-5 w-5 text-primary" />
                <CardTitle>What is a Group Litigation Order?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A Group Litigation Order (GLO) is a legal mechanism in England and Wales that allows multiple claimants with similar claims to bring their cases together in a coordinated way. Unlike a class action, each claimant maintains their individual claim while benefiting from collective case management.
              </p>
              <p>
                When a GLO is established, the court manages all related cases together. One or more claims are typically selected as "test cases" to establish legal principles that can then be applied to similar claims, making the process more efficient for everyone involved.
              </p>
            </CardContent>
          </Card>

          {/* Why GLOs for Housing Defects */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Why GLOs for Housing Defects?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Many homeowners face similar defects from the same developers or developments. These patterns of defects make GLOs an ideal legal approach because:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Multiple homeowners experience the same types of construction issues</li>
                <li>The same legal arguments and evidence apply across similar cases</li>
                <li>Developers often use standard building practices that lead to repeated defects</li>
                <li>Collective action creates a stronger position in negotiations and litigation</li>
                <li>Test cases can establish precedents that benefit all similar claimants</li>
              </ul>
            </CardContent>
          </Card>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle>Strength in Numbers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Stronger negotiating position with developers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Shared expert witness resources and costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Collective voice amplifies individual concerns</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Cost Efficiency</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Legal costs distributed across multiple claimants</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>Shared investigation and evidence gathering expenses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <span>More affordable access to legal expertise</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* How We're Exploring This */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Current Process</CardTitle>
              <CardDescription>How we're working towards establishing a GLO</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">1</div>
                  <div>
                    <h4 className="font-semibold mb-1">Evidence Collection</h4>
                    <p className="text-sm text-muted-foreground">We're gathering and analyzing evidence submissions to identify common patterns and defects across developments.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">2</div>
                  <div>
                    <h4 className="font-semibold mb-1">Legal Consultation</h4>
                    <p className="text-sm text-muted-foreground">Consulting with legal experts specializing in construction defects and group litigation to assess viability.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">3</div>
                  <div>
                    <h4 className="font-semibold mb-1">Case Assessment</h4>
                    <p className="text-sm text-muted-foreground">Evaluating the strength of potential claims and identifying suitable test cases for the GLO.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">4</div>
                  <div>
                    <h4 className="font-semibold mb-1">User Notification</h4>
                    <p className="text-sm text-muted-foreground">When ready, we'll notify eligible users and provide clear information about participation options.</p>
                  </div>
                </div>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> This is a thorough process that requires careful legal review. We cannot provide specific timelines yet, but we're committed to keeping you informed as we progress.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How is a GLO different from a class action?</AccordionTrigger>
                  <AccordionContent>
                    Unlike class actions (common in the US), GLOs maintain individual claims for each claimant. You retain control over your specific case while benefiting from coordinated case management. Settlements or judgments are assessed individually based on your specific circumstances, not applied uniformly to all claimants.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Will I lose control of my individual claim?</AccordionTrigger>
                  <AccordionContent>
                    No. While cases are managed together for efficiency, you maintain your individual claim. You can typically opt out if you prefer to pursue your case independently, though this may mean losing the cost and efficiency benefits of the GLO.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How much might this cost?</AccordionTrigger>
                  <AccordionContent>
                    Costs are significantly reduced compared to individual litigation because they're shared among participants. The exact cost structure will depend on the arrangement with legal representatives, which could include no-win-no-fee agreements or cost-sharing models. Detailed cost information will be provided if and when a GLO is established.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>When will this be available?</AccordionTrigger>
                  <AccordionContent>
                    We're currently in the early investigation stages. Establishing a GLO is a complex legal process that requires thorough preparation. We cannot provide a specific timeline yet, but we'll notify all potentially eligible users as soon as we have concrete developments to share.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I express interest?</AccordionTrigger>
                  <AccordionContent>
                    The best way to express interest is to continue uploading evidence of defects through our platform. This helps us identify patterns and assess the viability of a GLO. When we're ready to move forward, we'll contact users who have submitted relevant evidence.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>What happens to my current evidence submissions?</AccordionTrigger>
                  <AccordionContent>
                    All evidence you've submitted remains valuable and confidential. It helps us identify common defects and patterns that could support a GLO. Your submissions could become crucial evidence in establishing the scope and strength of collective claims.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Stay Informed CTA */}
          <Card className="mb-8 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Stay Informed & Support the Process</CardTitle>
              <CardDescription>Continue contributing to build a stronger case</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Your continued participation is essential. Every piece of evidence you submit helps us identify patterns, assess the viability of collective action, and build a comprehensive understanding of the issues affecting homeowners.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild>
                  <Link to="/upload-evidence" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Evidence
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/my-evidence">View My Submissions</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* GLO Interest Registration Form */}
          <Card className="mb-8 border-primary/30">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle>Register Your Interest</CardTitle>
              </div>
              <CardDescription>
                Let us know you're interested in participating in a potential GLO. This helps us assess viability and keep you informed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {existingRegistration && (
                <Alert className="mb-6">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You've already registered your interest on {new Date(existingRegistration.created_at).toLocaleDateString()}. You can update your information below.
                  </AlertDescription>
                </Alert>
              )}

              <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Help us assess the viability of a Group Litigation Order by registering your interest. This information will be kept confidential and only used to evaluate collective legal action. By registering, you're not committing to participate—we'll contact you if a GLO becomes available with full details so you can make an informed decision.
                </p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
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
                      name="last_name"
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
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
                    name="development_name"
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

                  <FormField
                    control={form.control}
                    name="property_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Address</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defect_categories"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>What defects are you experiencing? *</FormLabel>
                          <FormDescription>Select all that apply</FormDescription>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          {defectCategories.map((category) => (
                            <FormField
                              key={category}
                              control={form.control}
                              name="defect_categories"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(category)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, category])
                                          : field.onChange(field.value?.filter((value) => value !== category));
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {category}
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimated_damages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estimated Damages or Costs Incurred (£) (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormDescription>Approximate total damages or repair costs</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additional_comments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Comments (Optional)</FormLabel>
                        <FormControl>
                          <Textarea rows={4} {...field} />
                        </FormControl>
                        <FormDescription>Any additional information you'd like to share</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_consent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="cursor-pointer">
                            I consent to being contacted about GLO updates and developments *
                          </FormLabel>
                          <FormDescription>
                            We'll only contact you regarding the Group Litigation Order initiative
                          </FormDescription>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={submitting} size="lg">
                    {submitting ? "Submitting..." : existingRegistration ? "Update Registration" : "Register Interest"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Alert variant="default" className="mb-8">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Please Note:</strong> The information on this page is for educational purposes only and does not constitute legal advice. The exploration of a GLO does not guarantee that one will be established. Individual circumstances vary, and you should seek independent legal advice for your specific situation.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
