import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2, Mail, Phone, MapPin } from "lucide-react";
const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject must be less than 200 characters"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters")
});
type ContactForm = z.infer<typeof contactSchema>;
const Contact = () => {
  const [form, setForm] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const {
    toast
  } = useToast();
  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactForm, string>> = {};
      result.error.errors.forEach(error => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as keyof ContactForm] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    setErrors({});
    try {
      const {
        error
      } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message
        }
      });
      if (error) throw error;
      toast({
        title: "Message sent successfully!",
        description: "Thank you for contacting us. We'll get back to you soon."
      });

      // Reset form
      setForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Error sending contact form:', error);
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <>
      {/* SEO Meta Tags */}
      <title>Contact Redrow Exposed - Report Housing Issues</title>
      <meta name="description" content="Contact Redrow Exposed to report housing defects, share your story, or get support. We're here to help you fight for quality housing standards." />
      <meta name="keywords" content="contact redrow exposed, housing complaints, defects report, customer support" />
      <link rel="canonical" href={`${window.location.origin}/contact`} />
      
      <Layout>
        <main className="min-h-screen bg-background py-12">
          <div className="container mx-auto px-6 max-w-4xl">
            {/* Breadcrumb */}
            <nav className="mb-8 text-sm text-muted-foreground">
              <a href="/" className="hover:text-foreground transition-colors">Home</a>
              <span className="mx-2">/</span>
              <span className="text-foreground">Contact</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Get in Touch</CardTitle>
                  <CardDescription>Send us a message and we'll respond as soon as possible (usually within 24 hours). All communications are treated confidentially.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" type="text" value={form.name} onChange={e => handleInputChange("name", e.target.value)} placeholder="Your full name" className={errors.name ? "border-destructive" : ""} disabled={isSubmitting} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" value={form.email} onChange={e => handleInputChange("email", e.target.value)} placeholder="your.email@example.com" className={errors.email ? "border-destructive" : ""} disabled={isSubmitting} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input id="subject" type="text" value={form.subject} onChange={e => handleInputChange("subject", e.target.value)} placeholder="Brief description of your inquiry" className={errors.subject ? "border-destructive" : ""} disabled={isSubmitting} />
                      {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea id="message" value={form.message} onChange={e => handleInputChange("message", e.target.value)} placeholder="Please provide details about your inquiry, including any relevant property information, timeline, and specific issues you're experiencing..." className={`min-h-[120px] ${errors.message ? "border-destructive" : ""}`} disabled={isSubmitting} />
                      {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending Message...
                        </> : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                      Other ways to reach us or get immediate help
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <h3 className="font-medium">Email</h3>
                        <p className="text-sm text-muted-foreground">contact@redrowexposed.co.uk</p>
                        <p className="text-xs text-muted-foreground mt-1">We typically respond within 24 hours</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <h3 className="font-medium">Phone Support</h3>
                        <p className="text-sm text-muted-foreground">Available upon request</p>
                        <p className="text-xs text-muted-foreground mt-1">Contact us via email first to arrange a call</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                      <div>
                        <h3 className="font-medium">Coverage Area</h3>
                        <p className="text-sm text-muted-foreground">United Kingdom</p>
                        <p className="text-xs text-muted-foreground mt-1">Helping homeowners across the UK</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What to Include</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Property address and development name</li>
                      <li>• Timeline of when issues started</li>
                      <li>• Description of defects or problems</li>
                      <li>• Previous correspondence with Redrow</li>
                      <li>• Photos or documentation (if available)</li>
                      <li>• Your preferred contact method</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </Layout>
    </>;
};
export default Contact;