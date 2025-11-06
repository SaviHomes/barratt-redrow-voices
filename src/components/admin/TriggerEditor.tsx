import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

interface EmailTemplate {
  id: string;
  display_name: string;
  is_active: boolean;
}

interface EmailTrigger {
  id?: string;
  template_id: string;
  event_type: string;
  is_enabled: boolean;
  recipient_config: any;
  delay_minutes: number;
}

interface TriggerEditorProps {
  open: boolean;
  trigger?: EmailTrigger;
  templates: EmailTemplate[];
  onSave: (trigger: Omit<EmailTrigger, 'id'>) => Promise<void>;
  onCancel: () => void;
}

const eventTypes = [
  { value: 'user_registered', label: 'User Registered' },
  { value: 'evidence_approved', label: 'Evidence Approved' },
  { value: 'evidence_rejected', label: 'Evidence Rejected' },
  { value: 'evidence_submitted', label: 'Evidence Submitted' },
  { value: 'claim_submitted', label: 'Claim Submitted' },
  { value: 'glo_registered', label: 'GLO Registered' },
];

const recipientTypes = [
  { value: 'submitter', label: 'Event Submitter' },
  { value: 'all_admins', label: 'All Admins' },
  { value: 'all_users', label: 'All Users' },
];

export function TriggerEditor({ open, trigger, templates, onSave, onCancel }: TriggerEditorProps) {
  const [formData, setFormData] = useState<Omit<EmailTrigger, 'id'>>({
    template_id: "",
    event_type: "evidence_approved",
    is_enabled: true,
    recipient_config: { type: "submitter" },
    delay_minutes: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (trigger) {
      setFormData({
        template_id: trigger.template_id,
        event_type: trigger.event_type,
        is_enabled: trigger.is_enabled,
        recipient_config: trigger.recipient_config || { type: "submitter" },
        delay_minutes: trigger.delay_minutes || 0,
      });
    } else {
      setFormData({
        template_id: "",
        event_type: "evidence_approved",
        is_enabled: true,
        recipient_config: { type: "submitter" },
        delay_minutes: 0,
      });
    }
  }, [trigger, open]);

  const activeTemplates = templates.filter(t => t.is_active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{trigger ? 'Edit Trigger' : 'Create Automated Trigger'}</DialogTitle>
          <DialogDescription>
            Configure when and how this email template should be sent automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="event_type">Event Type *</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="template_id">Email Template *</Label>
            <Select
              value={formData.template_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, template_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {activeTemplates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.display_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient_type">Recipients *</Label>
            <Select
              value={formData.recipient_config?.type || 'submitter'}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                recipient_config: { type: value } 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recipientTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="delay">Delay Before Sending (minutes)</Label>
            <Input
              id="delay"
              type="number"
              min="0"
              value={formData.delay_minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, delay_minutes: parseInt(e.target.value) || 0 }))}
              placeholder="0 for immediate"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="is_enabled">Enable Trigger</Label>
              <div className="text-sm text-muted-foreground">
                Trigger will {formData.is_enabled ? 'automatically send' : 'not send'} emails when this event occurs
              </div>
            </div>
            <Switch
              id="is_enabled"
              checked={formData.is_enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.template_id}>
              {loading ? 'Saving...' : trigger ? 'Update Trigger' : 'Create Trigger'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
