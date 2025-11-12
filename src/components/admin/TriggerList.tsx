import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Power, PowerOff, Send } from "lucide-react";
import { TriggerTestDialog } from "./TriggerTestDialog";

interface EmailTrigger {
  id: string;
  event_type: string;
  is_enabled: boolean;
  recipient_config: any;
  conditions: any;
  delay_minutes: number;
  template_id?: string;
  email_templates?: {
    id: string;
    display_name: string;
    category: string;
    preview_data?: any;
  };
}

interface TriggerListProps {
  triggers: EmailTrigger[];
  onEdit: (trigger: EmailTrigger) => void;
  onToggleEnabled: (id: string, enabled: boolean) => void;
}

const eventTypeLabels: Record<string, string> = {
  user_registered: 'User Registered',
  evidence_approved: 'Evidence Approved',
  evidence_rejected: 'Evidence Rejected',
  evidence_submitted: 'Evidence Submitted',
  claim_submitted: 'Claim Submitted',
  glo_registered: 'GLO Registered',
  manual: 'Manual',
};

const getRecipientLabel = (config: any): string => {
  if (!config || !config.type) return 'Unknown';
  
  switch (config.type) {
    case 'submitter':
      return 'Event Submitter';
    case 'all_admins':
      return 'All Admins';
    case 'all_users':
      return 'All Users';
    default:
      return 'Custom';
  }
};

export function TriggerList({ triggers, onEdit, onToggleEnabled }: TriggerListProps) {
  const [testTrigger, setTestTrigger] = useState<EmailTrigger | null>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event Type</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Delay</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {triggers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No automated triggers configured yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              triggers.map((trigger) => (
                <TableRow key={trigger.id}>
                  <TableCell>
                    <Badge variant="outline">
                      {eventTypeLabels[trigger.event_type] || trigger.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {trigger.email_templates?.display_name || 'Unknown Template'}
                  </TableCell>
                  <TableCell>
                    {getRecipientLabel(trigger.recipient_config)}
                  </TableCell>
                  <TableCell>
                    {trigger.delay_minutes === 0 ? 'Immediate' : `${trigger.delay_minutes} min`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={trigger.is_enabled ? "default" : "secondary"}>
                      {trigger.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTestTrigger(trigger)}
                        title="Send Test Email"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(trigger)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleEnabled(trigger.id, !trigger.is_enabled)}
                        title={trigger.is_enabled ? "Disable" : "Enable"}
                      >
                        {trigger.is_enabled ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TriggerTestDialog
        open={!!testTrigger}
        trigger={testTrigger ? {
          id: testTrigger.id,
          event_type: testTrigger.event_type,
          template_id: testTrigger.template_id,
          email_templates: testTrigger.email_templates ? {
            id: testTrigger.email_templates.id || testTrigger.template_id || '',
            display_name: testTrigger.email_templates.display_name,
            preview_data: testTrigger.email_templates.preview_data,
          } : undefined,
        } : null}
        onClose={() => setTestTrigger(null)}
      />
    </>
  );
}
