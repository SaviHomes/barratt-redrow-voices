import { Heading, Text } from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface EvidenceApprovedEmailProps {
  userName: string;
  evidenceTitle: string;
  viewUrl: string;
}

export const EvidenceApprovedEmail = ({ userName, evidenceTitle, viewUrl }: EvidenceApprovedEmailProps) => (
  <EmailLayout preview="Your evidence has been approved!">
    <div style={content}>
      <div style={successBadge}>✓ APPROVED</div>
      <Heading style={h1}>Evidence Approved! 🎉</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        Great news! Your evidence submission <strong>"{evidenceTitle}"</strong> has been reviewed 
        and approved by our moderation team.
      </Text>
      <div style={infoBox}>
        <Text style={infoText}>
          <strong>What this means:</strong> Your evidence is now publicly visible in our evidence 
          gallery and will help strengthen the collective case against poor construction practices.
        </Text>
      </div>
      <Text style={text}>
        Your contribution is invaluable in building awareness and supporting other homeowners 
        who may be experiencing similar issues.
      </Text>
      <div style={buttonContainer}>
        <a href={viewUrl} style={button}>
          View Your Evidence
        </a>
      </div>
      <Text style={signature}>
        Thank you for your contribution,<br />
        The Redrow Exposed Team
      </Text>
    </div>
  </EmailLayout>
);

const content = {
  padding: '24px',
};

const successBadge = {
  display: 'inline-block',
  backgroundColor: '#10b981',
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

const infoBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #86efac',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#166534',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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

const signature = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
};
