import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Hr,
  Text,
  Link,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

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
        <div style={header}>
          <Text style={headerTitle}>Redrow Exposed</Text>
        </div>
        {children}
        <Hr style={hr} />
        <div style={footer}>
          <Text style={footerText}>
            You're receiving this email because you're registered with Redrow Exposed.
          </Text>
          <Text style={footerText}>
            <Link href="https://www.redrowexposed.co.uk/email-preferences" style={footerLink}>
              Manage email preferences
            </Link>
            {' | '}
            <Link href="https://www.redrowexposed.co.uk" style={footerLink}>
              Visit website
            </Link>
          </Text>
          <Text style={copyright}>© 2025 Redrow Exposed. All rights reserved.</Text>
        </div>
      </Container>
    </Body>
  </Html>
);

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
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
  backgroundColor: 'hsl(222.2 47.4% 11.2%)',
  borderRadius: '8px 8px 0 0',
};

const headerTitle = {
  margin: '0',
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '8px 0',
};

const footerLink = {
  color: '#0891b2',
  textDecoration: 'none',
};

const copyright = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  marginTop: '12px',
};
