import { Heading } from 'https://esm.sh/@react-email/heading@0.0.11';
import { Text } from 'https://esm.sh/@react-email/text@0.0.7';
import { Section } from 'https://esm.sh/@react-email/section@0.0.12';
import * as React from 'https://esm.sh/react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface ContactAdminNotificationProps {
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  submittedAt: string;
}

export const ContactAdminNotification = ({
  userName,
  userEmail,
  subject,
  message,
  submittedAt
}: ContactAdminNotificationProps) => (
  <EmailLayout preview={`New contact form submission from ${userName}`}>
    <Section style={content}>
      <Heading style={h1}>New Contact Form Submission 📬</Heading>
      
      <Text style={text}>
        You have received a new message through the Redrow Exposed contact form.
      </Text>

      <div style={detailsBox}>
        <table style={detailsTable}>
          <tbody>
            <tr>
              <td style={labelCell}><strong>From:</strong></td>
              <td style={valueCell}>{userName}</td>
            </tr>
            <tr>
              <td style={labelCell}><strong>Email:</strong></td>
              <td style={valueCell}>
                <a href={`mailto:${userEmail}`} style={emailLink}>{userEmail}</a>
              </td>
            </tr>
            <tr>
              <td style={labelCell}><strong>Subject:</strong></td>
              <td style={valueCell}>{subject}</td>
            </tr>
            <tr>
              <td style={labelCell}><strong>Submitted:</strong></td>
              <td style={valueCell}>{submittedAt}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={messageBox}>
        <Heading style={h2}>Message:</Heading>
        <Text style={messageText}>{message}</Text>
      </div>

      <Text style={footerText}>
        Reply directly to {userEmail} to respond to this inquiry.
      </Text>
    </Section>
  </EmailLayout>
);

const content = { padding: '24px' };

const h1 = { 
  color: '#1f2937', 
  fontSize: '24px', 
  fontWeight: 'bold', 
  margin: '0 0 24px', 
  padding: '0' 
};

const h2 = { 
  color: '#1f2937', 
  fontSize: '18px', 
  fontWeight: 'bold', 
  margin: '0 0 12px', 
  padding: '0' 
};

const text = { 
  color: '#374151', 
  fontSize: '14px', 
  lineHeight: '24px', 
  margin: '16px 0' 
};

const detailsBox = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '16px',
  margin: '24px 0'
};

const detailsTable = { 
  width: '100%', 
  borderCollapse: 'collapse' as const 
};

const labelCell = { 
  padding: '8px 12px 8px 0', 
  verticalAlign: 'top', 
  color: '#6b7280', 
  fontSize: '14px', 
  width: '120px' 
};

const valueCell = { 
  padding: '8px 0', 
  color: '#1f2937', 
  fontSize: '14px' 
};

const emailLink = { 
  color: '#0f3f7a', 
  textDecoration: 'underline' 
};

const messageBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0'
};

const messageText = { 
  color: '#1f2937', 
  fontSize: '14px', 
  lineHeight: '22px', 
  whiteSpace: 'pre-wrap' as const,
  margin: '0'
};

const footerText = { 
  color: '#6b7280', 
  fontSize: '13px', 
  fontStyle: 'italic', 
  marginTop: '24px' 
};
