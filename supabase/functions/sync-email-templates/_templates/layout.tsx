import { Body } from 'https://esm.sh/@react-email/body@0.0.7';
import { Container } from 'https://esm.sh/@react-email/container@0.0.11';
import { Head } from 'https://esm.sh/@react-email/head@0.0.8';
import { Html } from 'https://esm.sh/@react-email/html@0.0.7';
import { Hr } from 'https://esm.sh/@react-email/hr@0.0.7';
import { Text } from 'https://esm.sh/@react-email/text@0.0.7';
import { Link } from 'https://esm.sh/@react-email/link@0.0.7';
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
        <div style={header}>
          <div style={{ textAlign: 'center' as const, marginBottom: '16px' }}>
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ margin: '0 auto', display: 'block' }}
            >
              <path 
                d="M12 2L4 6V11C4 16.55 7.84 21.74 13 23C18.16 21.74 22 16.55 22 11V6L12 2Z" 
                fill="#ffffff"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
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
  backgroundColor: '#1e3a8a',
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
