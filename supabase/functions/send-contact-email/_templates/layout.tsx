import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Section,
  Text,
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export const EmailLayout = ({ children, preview }: EmailLayoutProps) => (
  <Html>
    <Head />
    {preview && <Text style={{ display: 'none' }}>{preview}</Text>}
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://fypibednjongfztfjvbp.supabase.co/storage/v1/object/public/evidence-photos/redrow-logo.png"
            width="120"
            height="40"
            alt="Redrow Exposed"
          />
          <Heading style={headerTitle}>Redrow Exposed</Heading>
        </Section>

        {children}

        <Section style={footer}>
          <Text style={footerText}>
            <Link href="https://redrowexposed.co.uk" style={footerLink}>
              Visit Website
            </Link>
            {' | '}
            <Link href="https://redrowexposed.co.uk/contact" style={footerLink}>
              Contact Us
            </Link>
          </Text>
          <Text style={copyright}>
            © {new Date().getFullYear()} Redrow Exposed. All rights reserved.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 24px',
  borderBottom: '1px solid #e6ebf1',
  textAlign: 'center' as const,
};

const headerTitle = {
  color: '#0f3f7a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '8px 0 0',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '24px',
  borderTop: '1px solid #e6ebf1',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0 0 8px',
};

const footerLink = {
  color: '#0f3f7a',
  textDecoration: 'underline',
};

const copyright = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
};
