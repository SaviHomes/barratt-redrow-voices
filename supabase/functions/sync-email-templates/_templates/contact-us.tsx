import { Heading } from 'https://esm.sh/@react-email/heading@0.0.11';
import { Text } from 'https://esm.sh/@react-email/text@0.0.7';
import * as React from 'https://esm.sh/react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface ContactUsEmailProps {
  userName?: string;
}

export const ContactUsEmail = ({ userName }: ContactUsEmailProps) => (
  <EmailLayout preview="Thank you for contacting Redrow Exposed">
    <div style={content}>
      <Heading style={h1}>Thank You for Your Email 📧</Heading>
      {userName && <Text style={text}>Hi {userName},</Text>}
      <Text style={text}>
        Thank you for reaching out to us. We have received your message and appreciate you taking the time to contact us.
      </Text>
      <Text style={text}>
        Our team will review your message and respond as soon as possible. We typically respond within 1-2 business days.
      </Text>
      <Text style={text}>
        In the meantime, feel free to explore our platform and resources:
      </Text>
      <ul style={list}>
        <li style={listItem}>View the public evidence gallery</li>
        <li style={listItem}>Read about Group Litigation opportunities</li>
        <li style={listItem}>Browse our FAQ section</li>
      </ul>
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

const signature = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '32px',
};
