import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface TriggerTestDialogProps {
  open: boolean;
  trigger: {
    id: string;
    event_type: string;
    template_id?: string;
    email_templates?: {
      id: string;
      display_name: string;
      preview_data?: any;
    };
  } | null;
  onClose: () => void;
}

const mockEventData: Record<string, Record<string, any>> = {
  comment_submitted: {
    commenterName: "John Doe",
    commenterEmail: "john@example.com",
    commentText: "This is a test comment to verify the email template is working correctly.",
    commentType: "evidence",
    evidenceTitle: "Test Evidence Submission",
    photoLabel: "Front View",
    photoUrl: "https://via.placeholder.com/600x400",
    submittedAt: new Date().toISOString(),
    viewUrl: "https://example.com/evidence/test-123",
  },
  evidence_approved: {
    userName: "Jane Smith",
    evidenceTitle: "Building Defect - Cracked Wall",
    approvalDate: new Date().toISOString(),
    viewUrl: "https://example.com/my-evidence",
  },
  evidence_rejected: {
    userName: "Jane Smith",
    evidenceTitle: "Building Defect - Cracked Wall",
    rejectionReason: "Please provide clearer photos showing the full extent of the damage.",
    rejectionDate: new Date().toISOString(),
  },
  user_registered: {
    userName: "John Doe",
    registrationDate: new Date().toISOString(),
    dashboardUrl: "https://example.com/user-dashboard",
  },
  claim_submitted: {
    userName: "John Doe",
    claimTitle: "Property Damage Claim",
    claimId: "CLM-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    submittedAt: new Date().toISOString(),
  },
  glo_registered: {
    userName: "John Doe",
    registrationDate: new Date().toISOString(),
    gloName: "Redrow Group Litigation Order",
  },
};

export function TriggerTestDialog({ open, trigger, onClose }: TriggerTestDialogProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendTest = async () => {
    if (!email || !trigger) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      // Get mock data for the event type
      const eventData = mockEventData[trigger.event_type] || {
        testData: "This is a test email",
        sentAt: new Date().toISOString(),
      };

      // Trigger the event email
      const { error } = await supabase.functions.invoke('trigger-event-email', {
        body: {
          eventType: trigger.event_type,
          eventData: {
            ...eventData,
            // Override the email to send to the test address
            commenterEmail: email,
            userEmail: email,
          },
        },
      });

      if (error) throw error;

      toast.success(`Test email sent to ${email}!`);
      setEmail("");
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
          <DialogTitle>Test Email Trigger</DialogTitle>
          <DialogDescription>
            Send a test email for the <strong>{trigger?.event_type}</strong> trigger using mock data.
            The email will be sent to the address you specify below.
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
            <p className="text-xs text-muted-foreground">
              This will use the configured template: <strong>{trigger?.email_templates?.display_name || "Unknown"}</strong>
            </p>
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
