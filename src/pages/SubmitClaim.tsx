import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2, DollarSign, FileText, Shield, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const claimSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  last_name: z.string().trim().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().optional(),
  property_address: z.string().trim().min(1, "Property address is required").max(500, "Address must be less than 500 characters"),
  development_name: z.string().trim().optional(),
  purchase_date: z.string().optional(),
  completion_date: z.string().optional(),
  property_type: z.string().optional(),
  claim_title: z.string().trim().min(1, "Claim title is required").max(200, "Title must be less than 200 characters"),
  claim_description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000, "Description must be less than 5000 characters"),
  issues_discovered_date: z.string().optional(),
  estimated_damages: z.string().optional(),
  costs_incurred: z.string().optional(),
  additional_notes: z.string().trim().optional(),
});

type ClaimForm = z.infer<typeof claimSchema>;

const SubmitClaim = () => {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState<ClaimForm>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    property_address: "",
    development_name: "",
    purchase_date: "",
    completion_date: "",
    property_type: "",
    claim_title: "",
    claim_description: "",
    issues_discovered_date: "",
    estimated_damages: "",
    costs_incurred: "",
    additional_notes: "",
  });

  const [defectCategories, setDefectCategories] = useState<string[]>([]);
  const [receiptsAvailable, setReceiptsAvailable] = useState(false);
  const [repairQuotes, setRepairQuotes] = useState(false);
  const [previousContact, setPreviousContact] = useState(false);
  const [legalRepresentation, setLegalRepresentation] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ClaimForm, string>>>({});
  const { toast } = useToast();

  const defectOptions = [
    "Structural defects",
    "Water damage/leaks",
    "Electrical issues",
    "Plumbing problems",
    "Heating/ventilation",
    "Poor insulation",
    "Cracking walls/ceilings",
    "Window/door defects",
    "Roof problems",
    "Foundation issues",
    "Other"
  ];

  const handleInputChange = (field: keyof ClaimForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDefectCategoryToggle = (category: string) => {
    setDefectCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a claim.",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    const result = claimSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ClaimForm, string>> = {};
      result.error.errors.forEach(error => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof ClaimForm] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const claimData = {
        user_id: user.id,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.phone || null,
        property_address: form.property_address,
        development_name: form.development_name || null,
        purchase_date: form.purchase_date || null,
        completion_date: form.completion_date || null,
        property_type: form.property_type || null,
        claim_title: form.claim_title,
        claim_description: form.claim_description,
        issues_discovered_date: form.issues_discovered_date || null,
        defects_categories: defectCategories,
        estimated_damages: form.estimated_damages ? parseFloat(form.estimated_damages) : null,
        costs_incurred: form.costs_incurred ? parseFloat(form.costs_incurred) : null,
        receipts_available: receiptsAvailable,
        repair_quotes_obtained: repairQuotes,
        previous_contact_with_redrow: previousContact,
        legal_representation: legalRepresentation,
        additional_notes: form.additional_notes || null,
        supporting_documents: [],
        status: 'submitted'
      };

      const { error } = await supabase
        .from('claims')
        .insert([claimData]);

      if (error) throw error;

      toast({
        title: "Claim submitted successfully!",
        description: "Your financial claim has been submitted. We'll review it and contact you soon.",
      });

      // Reset form
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        property_address: "",
        development_name: "",
        purchase_date: "",
        completion_date: "",
        property_type: "",
        claim_title: "",
        claim_description: "",
        issues_discovered_date: "",
        estimated_damages: "",
        costs_incurred: "",
        additional_notes: "",
      });
      setDefectCategories([]);
      setReceiptsAvailable(false);
      setRepairQuotes(false);
      setPreviousContact(false);
      setLegalRepresentation(false);

    } catch (error) {
      console.error('Error submitting claim:', error);
      toast({
        title: "Failed to submit claim",
        description: "There was an error submitting your claim. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-6 max-w-2xl text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">
              You need to be signed in to submit a financial claim. Please create an account or sign in to continue.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/register">Create Account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>Submit Financial Claim - Redrow Exposed Property Defects</title>
      <meta name="description" content="Submit a financial claim for property defects and damages caused by poor build quality. Professional support for Barratt Redrow homeowners seeking compensation." />
      <meta name="keywords" content="property defects claim, housing compensation, redrow damages, financial claim, property defects compensation" />
      <link rel="canonical" href={`${window.location.origin}/submit-claim`} />
      
      <Layout>
        <main className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <span className="mx-2">/</span>
              <span className="text-foreground">Submit Financial Claim</span>
            </nav>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <DollarSign className="h-6 w-6 text-primary" />
                      Submit Financial Claim
                    </CardTitle>
                    <CardDescription>
                      Submit a detailed financial claim for property defects and damages. All information is confidential and secure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                              id="first_name"
                              value={form.first_name}
                              onChange={(e) => handleInputChange("first_name", e.target.value)}
                              className={errors.first_name ? "border-destructive" : ""}
                              disabled={isSubmitting}
                            />
                            {errors.first_name && (
                              <p className="text-sm text-destructive">{errors.first_name}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                              id="last_name"
                              value={form.last_name}
                              onChange={(e) => handleInputChange("last_name", e.target.value)}
                              className={errors.last_name ? "border-destructive" : ""}
                              disabled={isSubmitting}
                            />
                            {errors.last_name && (
                              <p className="text-sm text-destructive">{errors.last_name}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={form.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              className={errors.email ? "border-destructive" : ""}
                              disabled={isSubmitting}
                            />
                            {errors.email && (
                              <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={form.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Property Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Property Information</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="property_address">Property Address *</Label>
                            <Textarea
                              id="property_address"
                              value={form.property_address}
                              onChange={(e) => handleInputChange("property_address", e.target.value)}
                              placeholder="Full property address including postcode"
                              className={errors.property_address ? "border-destructive" : ""}
                              disabled={isSubmitting}
                            />
                            {errors.property_address && (
                              <p className="text-sm text-destructive">{errors.property_address}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="development_name">Development Name</Label>
                              <Input
                                id="development_name"
                                value={form.development_name}
                                onChange={(e) => handleInputChange("development_name", e.target.value)}
                                placeholder="e.g., Miller Homes, Barratt Homes"
                                disabled={isSubmitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="property_type">Property Type</Label>
                              <Select value={form.property_type} onValueChange={(value) => handleInputChange("property_type", value)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select property type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="detached">Detached House</SelectItem>
                                  <SelectItem value="semi-detached">Semi-Detached House</SelectItem>
                                  <SelectItem value="terraced">Terraced House</SelectItem>
                                  <SelectItem value="flat">Flat/Apartment</SelectItem>
                                  <SelectItem value="bungalow">Bungalow</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="purchase_date">Purchase Date</Label>
                              <Input
                                id="purchase_date"
                                type="date"
                                value={form.purchase_date}
                                onChange={(e) => handleInputChange("purchase_date", e.target.value)}
                                disabled={isSubmitting}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="completion_date">Completion Date</Label>
                              <Input
                                id="completion_date"
                                type="date"
                                value={form.completion_date}
                                onChange={(e) => handleInputChange("completion_date", e.target.value)}
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Claim Details */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Claim Details</h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="claim_title">Claim Title *</Label>
                          <Input
                            id="claim_title"
                            value={form.claim_title}
                            onChange={(e) => handleInputChange("claim_title", e.target.value)}
                            placeholder="Brief summary of your claim"
                            className={errors.claim_title ? "border-destructive" : ""}
                            disabled={isSubmitting}
                          />
                          {errors.claim_title && (
                            <p className="text-sm text-destructive">{errors.claim_title}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="claim_description">Detailed Description *</Label>
                          <Textarea
                            id="claim_description"
                            value={form.claim_description}
                            onChange={(e) => handleInputChange("claim_description", e.target.value)}
                            placeholder="Provide a detailed description of the defects, when they were discovered, how they've affected you, and any actions you've taken..."
                            className={`min-h-[120px] ${errors.claim_description ? "border-destructive" : ""}`}
                            disabled={isSubmitting}
                          />
                          {errors.claim_description && (
                            <p className="text-sm text-destructive">{errors.claim_description}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="issues_discovered_date">When Were Issues First Discovered?</Label>
                          <Input
                            id="issues_discovered_date"
                            type="date"
                            value={form.issues_discovered_date}
                            onChange={(e) => handleInputChange("issues_discovered_date", e.target.value)}
                            disabled={isSubmitting}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Types of Defects (Select all that apply)</Label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {defectOptions.map((defect) => (
                              <div key={defect} className="flex items-center space-x-2">
                                <Checkbox
                                  id={defect}
                                  checked={defectCategories.includes(defect)}
                                  onCheckedChange={() => handleDefectCategoryToggle(defect)}
                                  disabled={isSubmitting}
                                />
                                <Label htmlFor={defect} className="text-sm">{defect}</Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Financial Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Financial Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="estimated_damages">Estimated Damages (£)</Label>
                            <Input
                              id="estimated_damages"
                              type="number"
                              step="0.01"
                              value={form.estimated_damages}
                              onChange={(e) => handleInputChange("estimated_damages", e.target.value)}
                              placeholder="0.00"
                              disabled={isSubmitting}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="costs_incurred">Costs Already Incurred (£)</Label>
                            <Input
                              id="costs_incurred"
                              type="number"
                              step="0.01"
                              value={form.costs_incurred}
                              onChange={(e) => handleInputChange("costs_incurred", e.target.value)}
                              placeholder="0.00"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="receipts"
                              checked={receiptsAvailable}
                              onCheckedChange={(checked) => setReceiptsAvailable(checked === true)}
                              disabled={isSubmitting}
                            />
                            <Label htmlFor="receipts">I have receipts/invoices for costs incurred</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="quotes"
                              checked={repairQuotes}
                              onCheckedChange={(checked) => setRepairQuotes(checked === true)}
                              disabled={isSubmitting}
                            />
                            <Label htmlFor="quotes">I have obtained repair quotes</Label>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Additional Information</h3>
                        
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="previous_contact"
                              checked={previousContact}
                              onCheckedChange={(checked) => setPreviousContact(checked === true)}
                              disabled={isSubmitting}
                            />
                            <Label htmlFor="previous_contact">I have previously contacted Redrow about these issues</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="legal_rep"
                              checked={legalRepresentation}
                              onCheckedChange={(checked) => setLegalRepresentation(checked === true)}
                              disabled={isSubmitting}
                            />
                            <Label htmlFor="legal_rep">I have legal representation</Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="additional_notes">Additional Notes</Label>
                          <Textarea
                            id="additional_notes"
                            value={form.additional_notes}
                            onChange={(e) => handleInputChange("additional_notes", e.target.value)}
                            placeholder="Any additional information you'd like to provide..."
                            className="min-h-[80px]"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting Claim...
                          </>
                        ) : (
                          "Submit Financial Claim"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      Secure & Confidential
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• All information is encrypted and secure</p>
                    <p>• Claims are reviewed by qualified professionals</p>
                    <p>• We'll contact you within 48 hours</p>
                    <p>• No upfront costs or fees</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      What to Include
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>• Detailed description of defects</p>
                    <p>• Timeline of when issues appeared</p>
                    <p>• Financial impact and costs</p>
                    <p>• Previous communication with builder</p>
                    <p>• Supporting documentation</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. Submit your claim form</p>
                    <p>2. Our team reviews your case</p>
                    <p>3. We contact you to discuss options</p>
                    <p>4. Professional assessment if needed</p>
                    <p>5. Support throughout the process</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};

export default SubmitClaim;