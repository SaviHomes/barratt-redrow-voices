import { Heading } from 'https://esm.sh/@react-email/heading@0.0.11';
import { Text } from 'https://esm.sh/@react-email/text@0.0.7';
import { Section } from 'https://esm.sh/@react-email/section@0.0.12';
import { Link } from 'https://esm.sh/@react-email/link@0.0.7';
import * as React from 'https://esm.sh/react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface UserRegistrationNotificationProps {
  userName: string;
  userEmail: string;
  propertyAddress: string;
  developmentName?: string;
  registeredAt: string;
  phone?: string;
  whatsappConsent: boolean;
  gloConsent: boolean;
  buildStyle?: string;
  viewProfileUrl: string;
}

export const UserRegistrationNotification = ({
  userName,
  userEmail,
  propertyAddress,
  developmentName,
  registeredAt,
  phone,
  whatsappConsent,
  gloConsent,
  buildStyle,
  viewProfileUrl
}: UserRegistrationNotificationProps) => {
  return (
    <EmailLayout preview={`New user registration: ${userName}`}>
      <Section style={content}>
        <Heading style={h1}>New User Registration 🎉</Heading>
        
        <Text style={text}>
          A new user has successfully registered on the Redrow Exposed platform. Here are their details:
        </Text>

        <div style={detailsBox}>
          <table style={detailsTable}>
            <tbody>
              <tr>
                <td style={labelCell}><strong>Full Name:</strong></td>
                <td style={valueCell}>{userName}</td>
              </tr>
              <tr>
                <td style={labelCell}><strong>Email Address:</strong></td>
                <td style={valueCell}>
                  <Link href={`mailto:${userEmail}`} style={emailLink}>{userEmail}</Link>
                </td>
              </tr>
              {phone && (
                <tr>
                  <td style={labelCell}><strong>Phone Number:</strong></td>
                  <td style={valueCell}>{phone}</td>
                </tr>
              )}
              <tr>
                <td style={labelCell}><strong>Property Address:</strong></td>
                <td style={valueCell}>{propertyAddress}</td>
              </tr>
              {developmentName && (
                <tr>
                  <td style={labelCell}><strong>Development:</strong></td>
                  <td style={valueCell}>{developmentName}</td>
                </tr>
              )}
              <tr>
                <td style={labelCell}><strong>Registration Date:</strong></td>
                <td style={valueCell}>{registeredAt}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={preferencesSection}>
          <Heading style={h2}>User Preferences:</Heading>
          <table style={preferencesTable}>
            <tbody>
              <tr>
                <td style={preferenceLabelCell}>WhatsApp Group:</td>
                <td style={preferenceValueCell}>
                  <span style={whatsappConsent ? badgeYes : badgeNo}>
                    {whatsappConsent ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style={preferenceLabelCell}>GLO Updates:</td>
                <td style={preferenceValueCell}>
                  <span style={gloConsent ? badgeYes : badgeNo}>
                    {gloConsent ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
              {buildStyle && (
                <tr>
                  <td style={preferenceLabelCell}>Build Style:</td>
                  <td style={preferenceValueCell}>{buildStyle}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={actionSection}>
          <Link href={viewProfileUrl} style={primaryButton}>
            View User Profile
          </Link>
        </div>

        <Text style={footerText}>
          You can manage users from the{' '}
          <Link href="https://www.redrowexposed.co.uk/admin/user-management" style={emailLink}>
            admin dashboard
          </Link>
          .
        </Text>
      </Section>
    </EmailLayout>
  );
};

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
  width: '140px' 
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

const preferencesSection = {
  backgroundColor: '#eff6ff',
  border: '1px solid #dbeafe',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0'
};

const preferencesTable = {
  width: '100%',
  borderCollapse: 'collapse' as const
};

const preferenceLabelCell = {
  padding: '8px 12px 8px 0',
  color: '#374151',
  fontSize: '14px',
  fontWeight: '500',
  width: '140px'
};

const preferenceValueCell = {
  padding: '8px 0',
  fontSize: '14px'
};

const badgeYes = {
  display: 'inline-block',
  padding: '4px 12px',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 'bold',
  borderRadius: '4px'
};

const badgeNo = {
  display: 'inline-block',
  padding: '4px 12px',
  backgroundColor: '#9ca3af',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 'bold',
  borderRadius: '4px'
};

const actionSection = {
  margin: '32px 0 24px',
  textAlign: 'center' as const
};

const primaryButton = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#0f3f7a',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  borderRadius: '6px',
  textAlign: 'center' as const
};

const footerText = { 
  color: '#6b7280', 
  fontSize: '13px', 
  fontStyle: 'italic', 
  marginTop: '24px',
  textAlign: 'center' as const
};
