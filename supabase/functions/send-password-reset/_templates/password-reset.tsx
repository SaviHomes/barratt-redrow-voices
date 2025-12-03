import {
  Button,
  Heading,
  Text,
  Section,
  Hr,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'
import { EmailLayout } from './layout.tsx'

interface PasswordResetEmailProps {
  resetUrl: string
}

export const PasswordResetEmail = ({ resetUrl }: PasswordResetEmailProps) => (
  <EmailLayout preview="Reset your Redrow Exposed password">
    <Heading style={heading}>Reset Your Password</Heading>
    
    <Text style={paragraph}>
      We received a request to reset the password for your Redrow Exposed account.
    </Text>
    
    <Text style={paragraph}>
      Click the button below to create a new password:
    </Text>

    <Section style={buttonContainer}>
      <Button style={button} href={resetUrl}>
        Reset My Password
      </Button>
    </Section>

    <Section style={warningBox}>
      <Text style={warningText}>
        ⏰ This link will expire in 1 hour for security reasons.
      </Text>
    </Section>

    <Hr style={hr} />

    <Text style={secondaryText}>
      If you didn't request a password reset, you can safely ignore this email. 
      Your password will remain unchanged.
    </Text>

    <Text style={secondaryText}>
      For security, please do not share this link with anyone.
    </Text>

    <Text style={signature}>
      Best regards,<br />
      The Redrow Exposed Team
    </Text>
  </EmailLayout>
)

const heading = {
  color: '#1e40af',
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '24px',
}

const paragraph = {
  color: '#525f7f',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#1e40af',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '14px 28px',
  display: 'inline-block',
}

const warningBox = {
  backgroundColor: '#fef3c7',
  borderRadius: '6px',
  padding: '16px',
  marginBottom: '24px',
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  margin: '0',
  textAlign: 'center' as const,
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
}

const secondaryText = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '20px',
  marginBottom: '12px',
}

const signature = {
  color: '#525f7f',
  fontSize: '14px',
  lineHeight: '20px',
  marginTop: '24px',
}

export default PasswordResetEmail
