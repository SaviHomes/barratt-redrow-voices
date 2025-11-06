import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailTemplate {
  id: string;
  name: string;
  display_name: string;
  preview_data: any;
}

interface QuickTestDialogProps {
  open: boolean;
  template: EmailTemplate | null;
  onClose: () => void;
  userEmail?: string;
}

export function QuickTestDialog({ open, template, onClose, userEmail }: QuickTestDialogProps) {
  const [testEmail, setTestEmail] = useState(userEmail || "");
  const [sending, setSending] = useState(false);

  if (!template) return null;

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
          customData: template.preview_data || {},
        },
      });

      if (error) throw error;
      
      toast.success("Test email sent successfully!");
      onClose();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a test email for <span className="font-medium text-foreground">{template.display_name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendTest()}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={sending || !testEmail}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
