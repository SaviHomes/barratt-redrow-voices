import { Heading, Text, Button } from 'npm:@react-email/components@0.0.25';
import * as React from 'npm:react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface EvidenceRejectedEmailProps {
  userName: string;
  evidenceTitle: string;
  rejectionReason: string;
  resubmitUrl: string;
}

export const EvidenceRejectedEmail = ({ userName, evidenceTitle, rejectionReason, resubmitUrl }: EvidenceRejectedEmailProps) => (
  <EmailLayout preview="Update on your evidence submission">
    <div style={content}>
      <div style={warningBadge}>NEEDS REVISION</div>
      <Heading style={h1}>Evidence Requires Revision</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        Thank you for submitting evidence titled <strong>"{evidenceTitle}"</strong>. 
        After review, we need you to make some revisions before we can approve it.
      </Text>
      <div style={reasonBox}>
        <Text style={reasonTitle}>Reason for revision request:</Text>
        <Text style={reasonText}>{rejectionReason}</Text>
      </div>
      <Text style={text}>
        Please review the feedback above and feel free to resubmit your evidence once you've 
        made the necessary adjustments. We're here to help build the strongest case possible.
      </Text>
      <div style={buttonContainer}>
        <Button href={resubmitUrl} style={button}>
          Submit New Evidence
        </Button>
      </div>
      <Text style={helpText}>
        If you have any questions about the revision request, please contact us through the 
        website's contact form.
      </Text>
      <Text style={signature}>
        Best regards,<br />
        The Redrow Exposed Team
      </Text>
    </div>
  </EmailLayout>
);

const content = {
  padding: '24px',
};

const warningBadge = {
  display: 'inline-block',
  backgroundColor: '#f59e0b',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '6px 12px',
  borderRadius: '4px',
  marginBottom: '16px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  padding: '0',
};

const text = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const reasonBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #fcd34d',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const reasonTitle = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: 'bold',
  lineHeight: '20px',
  margin: '0 0 8px 0',
};

const reasonText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  fontStyle: 'italic',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0891b2',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const helpText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '24px 0',
  fontStyle: 'italic',
};

const signature = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
};
