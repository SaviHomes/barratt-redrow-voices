import { Heading, Text, Button } from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface CustomEmailProps {
  title: string;
  body: string;
  ctaText?: string;
  ctaUrl?: string;
}

export const CustomEmail = ({ title, body, ctaText, ctaUrl }: CustomEmailProps) => (
  <EmailLayout preview={title}>
    <div style={content}>
      <Heading style={h1}>{title}</Heading>
      <div 
        style={bodyContent}
        dangerouslySetInnerHTML={{ __html: body }}
      />
      {ctaText && ctaUrl && (
        <div style={buttonContainer}>
          <Button href={ctaUrl} style={button}>
            {ctaText}
          </Button>
        </div>
      )}
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
