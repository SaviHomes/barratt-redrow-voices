import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface QuickTestDialogProps {
  open: boolean;
  template: {
    id: string;
    display_name: string;
    preview_data?: any;
  } | null;
  onClose: () => void;
  userEmail?: string;
}

export function QuickTestDialog({ open, template, onClose, userEmail }: QuickTestDialogProps) {
  const [email, setEmail] = useState(userEmail || "");
  const [sending, setSending] = useState(false);

  const handleSendTest = async () => {
    if (!email || !template) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast.error("You must be logged in to send test emails");
        setSending(false);
        return;
      }

      const { error } = await supabase.functions.invoke('send-admin-email', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          templateId: template.id,
          recipients: [email],
          customData: template.preview_data || {},
        },
      });

      if (error) throw error;

      toast.success(`Test email sent to ${email}!`);
      onClose();
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Test Email Template</DialogTitle>
          <DialogDescription>
            Send a test email using the <strong>{template?.display_name}</strong> template with preview data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendTest();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSendTest} disabled={sending || !email}>
            <Send className="h-4 w-4 mr-2" />
            {sending ? "Sending..." : "Send Test"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
