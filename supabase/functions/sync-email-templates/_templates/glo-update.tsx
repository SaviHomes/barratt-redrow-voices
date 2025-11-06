import { Heading, Text } from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface GloUpdateEmailProps {
  updateTitle: string;
  updateBody: string;
  ctaText?: string;
  ctaUrl?: string;
}

export const GloUpdateEmail = ({ updateTitle, updateBody, ctaText, ctaUrl }: GloUpdateEmailProps) => (
  <EmailLayout preview={`GLO Update: ${updateTitle}`}>
    <div style={content}>
      <div style={badge}>⚖️ GROUP LITIGATION UPDATE</div>
      <Heading style={h1}>{updateTitle}</Heading>
      <div 
        style={bodyContent}
        dangerouslySetInnerHTML={{ __html: updateBody }}
      />
      {ctaText && ctaUrl && (
        <div style={buttonContainer}>
          <a href={ctaUrl} style={button}>
            {ctaText}
          </a>
        </div>
      )}
      <div style={infoBox}>
        <Text style={infoText}>
          This update is being sent to all registered Group Litigation participants. 
          Stay tuned for further developments.
        </Text>
      </div>
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

const badge = {
  display: 'inline-block',
  backgroundColor: '#7c3aed',
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
  margin: '0 0 24px',
  padding: '0',
};

const bodyContent = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#7c3aed',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const infoBox = {
  backgroundColor: '#f5f3ff',
  border: '1px solid #c4b5fd',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#5b21b6',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0',
};

const signature = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
};
