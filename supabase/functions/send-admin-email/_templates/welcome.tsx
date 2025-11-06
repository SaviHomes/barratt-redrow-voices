import { Heading, Text } from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export const WelcomeEmail = ({ userName, dashboardUrl }: WelcomeEmailProps) => (
  <EmailLayout preview="Welcome to Redrow Exposed">
    <div style={content}>
      <Heading style={h1}>Welcome to Redrow Exposed! 👋</Heading>
      <Text style={text}>Hi {userName},</Text>
      <Text style={text}>
        Thank you for joining our community. We're here to support homeowners affected by 
        construction defects and help build a stronger case for justice.
      </Text>
      <Text style={text}>
        Here's what you can do on our platform:
      </Text>
      <ul style={list}>
        <li style={listItem}>Submit and manage your claims</li>
        <li style={listItem}>Upload evidence with photos</li>
        <li style={listItem}>View the public evidence gallery</li>
        <li style={listItem}>Register interest in Group Litigation</li>
        <li style={listItem}>Rate your development</li>
      </ul>
      <div style={buttonContainer}>
        <a href={dashboardUrl} style={button}>
          Go to Your Dashboard
        </a>
      </div>
      <Text style={text}>
        If you have any questions, please don't hesitate to reach out through our contact page.
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

const list = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '16px 0',
  paddingLeft: '20px',
};

const listItem = {
  margin: '8px 0',
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
