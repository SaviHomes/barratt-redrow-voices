import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Smartphone, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  display_name: string;
  subject_template: string;
  html_content: string;
  variables: any;
  preview_data: any;
}

interface TemplatePreviewProps {
  open: boolean;
  template: EmailTemplate | null;
  onClose: () => void;
}

export function TemplatePreview({ open, template, onClose }: TemplatePreviewProps) {
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  if (!template) return null;

  const replaceVariables = (text: string, data: Record<string, any>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  };

  const previewData = template.preview_data || {};
  const renderedHtml = replaceVariables(template.html_content, previewData);
  const renderedSubject = replaceVariables(template.subject_template, previewData);

  const handleSendTest = async () => {
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('send-admin-email', {
        body: {
          templateId: template.id,
          recipients: [testEmail],
          customData: previewData,
        },
      });

      if (error) throw error;
      
      toast.success("Test email sent successfully!");
      setTestEmail("");
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{template.display_name}</DialogTitle>
          <DialogDescription>
            Subject: <span className="font-medium text-foreground">{renderedSubject}</span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="desktop" className="w-full">
          <TabsList>
            <TabsTrigger value="desktop" className="gap-2">
              <Monitor className="h-4 w-4" />
              Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="gap-2">
              <Smartphone className="h-4 w-4" />
              Mobile
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="desktop" className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-white" style={{ height: '500px' }}>
              <iframe
                srcDoc={renderedHtml}
                className="w-full h-full"
                title="Email Preview Desktop"
                sandbox="allow-same-origin"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="mobile" className="space-y-4">
            <div className="border rounded-lg overflow-hidden bg-white mx-auto" style={{ width: '375px', height: '500px' }}>
              <iframe
                srcDoc={renderedHtml}
                className="w-full h-full"
                title="Email Preview Mobile"
                sandbox="allow-same-origin"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t">
          <div className="flex-1 space-y-2">
            <Label htmlFor="test-email">Send Test Email</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <Button
            onClick={handleSendTest}
            disabled={sending || !testEmail}
            className="mt-auto gap-2"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Sending...' : 'Send Test'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
