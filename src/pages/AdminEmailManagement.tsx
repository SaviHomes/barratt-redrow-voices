import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Mail, Send, ArrowLeft, Users, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmailLog {
  id: string;
  template_type: string;
  subject: string;
  recipients: string[];
  sent_at: string;
  status: string;
  metadata: any;
}

export default function AdminEmailManagement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  
  // Form state
  const [template, setTemplate] = useState<string>("newsletter");
  const [subject, setSubject] = useState("");
  const [recipientType, setRecipientType] = useState<string>("all");
  const [specificEmails, setSpecificEmails] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");

  useEffect(() => {
    checkAdminAccess();
    fetchEmailLogs();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!data) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  };

  const fetchEmailLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setEmailLogs(data || []);
    } catch (error: any) {
      console.error("Error fetching email logs:", error);
      toast.error("Failed to load email history");
    } finally {
      setLoading(false);
    }
  };

  const getRecipients = async (): Promise<string[]> => {
    if (recipientType === "manual") {
      return specificEmails
        .split(",")
        .map(email => email.trim())
        .filter(email => email.length > 0);
    }

    try {
      let userIds: string[] = [];

      if (recipientType === "glo") {
        const { data: gloData } = await supabase
          .from("glo_interest")
          .select("user_id");
        
        userIds = gloData?.map((g: any) => g.user_id) || [];
      } else {
        const { data: profiles } = await supabase.from("profiles").select("user_id");
        userIds = profiles?.map((p: any) => p.user_id) || [];
      }

      if (userIds.length === 0) return [];

      const { data: authData } = await supabase.auth.admin.listUsers();
      const emails = authData.users
        .filter((u: User) => userIds.includes(u.id))
        .map((u: User) => u.email!)
        .filter(Boolean);

      return emails;
    } catch (error) {
      console.error("Error getting recipients:", error);
      return [];
    }
  };

  const handleSendEmail = async () => {
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    if (template === "newsletter" || template === "glo-update" || template === "custom") {
      if (!announcementTitle.trim() || !announcementBody.trim()) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setSendingEmail(true);
    try {
      const recipients = await getRecipients();

      if (recipients.length === 0) {
        toast.error("No recipients found");
        setSendingEmail(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-admin-email", {
        body: {
          template,
          recipients,
          subject,
          customData: {
            announcementTitle,
            announcementBody,
            ctaText: ctaText || undefined,
            ctaUrl: ctaUrl || undefined,
          },
        },
      });

      if (error) throw error;

      toast.success(`Email sent to ${recipients.length} recipients!`);
      
      // Reset form
      setSubject("");
      setAnnouncementTitle("");
      setAnnouncementBody("");
      setCtaText("");
      setCtaUrl("");
      setSpecificEmails("");
      
      // Refresh logs
      fetchEmailLogs();
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast.error(error.message || "Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const getTemplateBadge = (type: string) => {
    const badges: Record<string, { label: string; class: string }> = {
      'welcome': { label: 'Welcome', class: 'bg-primary' },
      'evidence-approved': { label: 'Approved', class: 'bg-success' },
      'evidence-rejected': { label: 'Revision', class: 'bg-warning' },
      'newsletter': { label: 'Newsletter', class: 'bg-cyan-600' },
      'glo-update': { label: 'GLO Update', class: 'bg-purple-600' },
      'custom': { label: 'Custom', class: 'bg-muted' },
    };
    const badge = badges[type] || { label: type, class: 'bg-muted' };
    return <span className={`${badge.class} text-white text-xs px-2 py-1 rounded`}>{badge.label}</span>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Button asChild variant="default" className="mb-6">
        <Link to="/admin" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Admin Dashboard
        </Link>
      </Button>
      
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">Send beautiful branded emails to your users</p>
        </div>
      </div>

      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">Compose Email</TabsTrigger>
          <TabsTrigger value="history">Email History</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose New Email</CardTitle>
              <CardDescription>
                Create and send beautiful HTML emails using professional templates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={template} onValueChange={setTemplate}>
                    <SelectTrigger id="template">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">📰 Newsletter</SelectItem>
                      <SelectItem value="glo-update">⚖️ GLO Update</SelectItem>
                      <SelectItem value="custom">✨ Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipients</Label>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger id="recipients">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="glo">GLO Registrants</SelectItem>
                      <SelectItem value="manual">Specific Emails</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {recipientType === "manual" && (
                <div className="space-y-2">
                  <Label htmlFor="specific-emails">Email Addresses (comma-separated)</Label>
                  <Textarea
                    id="specific-emails"
                    placeholder="email1@example.com, email2@example.com"
                    value={specificEmails}
                    onChange={(e) => setSpecificEmails(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Enter email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Email Title *</Label>
                <Input
                  id="title"
                  placeholder="Main heading of the email"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Email Body *</Label>
                <Textarea
                  id="body"
                  placeholder="Email content (supports HTML)"
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  rows={8}
                />
                <p className="text-sm text-muted-foreground">
                  You can use HTML tags for formatting (e.g., &lt;strong&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;)
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cta-text">Call-to-Action Text (optional)</Label>
                  <Input
                    id="cta-text"
                    placeholder="e.g., View More"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cta-url">Call-to-Action URL (optional)</Label>
                  <Input
                    id="cta-url"
                    placeholder="https://example.com"
                    value={ctaUrl}
                    onChange={(e) => setCtaUrl(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleSendEmail}
                disabled={sendingEmail}
                className="w-full"
                size="lg"
              >
                <Send className="mr-2 h-4 w-4" />
                {sendingEmail ? "Sending..." : "Send Email"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Email History</CardTitle>
              <CardDescription>
                View all emails sent through the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading email history...</div>
              ) : emailLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No emails sent yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{getTemplateBadge(log.template_type)}</TableCell>
                        <TableCell className="font-medium">{log.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {log.recipients.length}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {new Date(log.sent_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded ${
                            log.status === 'sent' ? 'bg-success text-white' : 'bg-warning text-white'
                          }`}>
                            {log.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
