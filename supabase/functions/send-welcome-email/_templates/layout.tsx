import { Html } from 'https://esm.sh/@react-email/html@0.0.7';
import { Head } from 'https://esm.sh/@react-email/head@0.0.7';
import { Body } from 'https://esm.sh/@react-email/body@0.0.7';
import { Container } from 'https://esm.sh/@react-email/container@0.0.11';
import { Img } from 'https://esm.sh/@react-email/img@0.0.7';
import { Section } from 'https://esm.sh/@react-email/section@0.0.11';
import { Hr } from 'https://esm.sh/@react-email/hr@0.0.7';
import { Text } from 'https://esm.sh/@react-email/text@0.0.7';
import { Preview } from 'https://esm.sh/@react-email/preview@0.0.8';
import * as React from 'https://esm.sh/react@18.3.1';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export const EmailLayout = ({ children, preview }: EmailLayoutProps) => (
  <Html>
    <Head />
    {preview && <Preview>{preview}</Preview>}
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://fypibednjongfztfjvbp.supabase.co/storage/v1/object/public/evidence-photos/redrow-exposed-logo.png"
            width="150"
            height="50"
            alt="Redrow Exposed"
            style={logo}
          />
        </Section>
        <Section style={contentSection}>
          {children}
        </Section>
        <Hr style={hr} />
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} Redrow Exposed. All rights reserved.
          </Text>
          <Text style={footerText}>
            This email was sent to you as part of your Redrow Exposed account.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#0f3f7a',
  padding: '20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const contentSection = {
  padding: '0 48px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 48px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
  textAlign: 'center' as const,
};
