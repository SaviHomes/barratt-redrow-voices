import { Heading } from 'https://esm.sh/@react-email/heading@0.0.11';
import { Text } from 'https://esm.sh/@react-email/text@0.0.7';
import { Section } from 'https://esm.sh/@react-email/section@0.0.12';
import { Link } from 'https://esm.sh/@react-email/link@0.0.7';
import * as React from 'https://esm.sh/react@18.3.1';
import { EmailLayout } from './layout.tsx';

interface CommentAdminNotificationProps {
  commenterName: string;
  commenterEmail: string;
  commentText: string;
  commentType: 'evidence' | 'photo';
  evidenceTitle: string;
  photoLabel?: string;
  photoUrl?: string;
  submittedAt: string;
  approveUrl: string;
  declineUrl: string;
  viewUrl: string;
}

export const CommentAdminNotification = ({
  commenterName,
  commenterEmail,
  commentText,
  commentType,
  evidenceTitle,
  photoLabel,
  photoUrl,
  submittedAt,
  approveUrl,
  declineUrl,
  viewUrl
}: CommentAdminNotificationProps) => {
  const isVideo = photoUrl ? /\.(mp4|mov|avi|webm|mkv|m4v)$/i.test(photoUrl) : false;

  return (
    <EmailLayout preview={`New comment awaiting moderation from ${commenterName}`}>
      <Section style={content}>
        <Heading style={h1}>New Comment Awaiting Moderation 💬</Heading>
        
        <Text style={text}>
          You have received a new {commentType === 'evidence' ? 'evidence post' : 'photo/video'} comment that requires your approval before appearing publicly.
        </Text>

        <div style={detailsBox}>
          <table style={detailsTable}>
            <tbody>
              <tr>
                <td style={labelCell}><strong>From:</strong></td>
                <td style={valueCell}>{commenterName}</td>
              </tr>
              <tr>
                <td style={labelCell}><strong>Email:</strong></td>
                <td style={valueCell}>
                  <Link href={`mailto:${commenterEmail}`} style={emailLink}>{commenterEmail}</Link>
                </td>
              </tr>
              <tr>
                <td style={labelCell}><strong>Type:</strong></td>
                <td style={valueCell}>
                  {commentType === 'evidence' ? 'Evidence Post Comment' : 'Photo/Video Comment'}
                </td>
              </tr>
              <tr>
                <td style={labelCell}><strong>Submitted:</strong></td>
                <td style={valueCell}>{submittedAt}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={evidenceSection}>
          <Heading style={h2}>Evidence Post:</Heading>
          <Text style={evidenceTitle}>{evidenceTitle}</Text>
          
          {commentType === 'photo' && photoLabel && (
            <Text style={photoLabelText}>
              <strong>Photo/Video:</strong> {photoLabel}
            </Text>
          )}

          {commentType === 'photo' && photoUrl && (
            <div style={mediaContainer}>
              {isVideo ? (
                <div style={videoPlaceholder}>
                  <Text style={videoIcon}>▶️</Text>
                  <Text style={videoText}>Video</Text>
                </div>
              ) : (
                <img 
                  src={photoUrl} 
                  alt={photoLabel || 'Comment photo'} 
                  style={photoImage}
                />
              )}
            </div>
          )}

          <Link href={viewUrl} style={viewLink}>
            {commentType === 'evidence' ? 'View Full Evidence Post →' : 'View Photo in Context →'}
          </Link>
        </div>

        <div style={commentBox}>
          <Heading style={h2}>Comment:</Heading>
          <Text style={commentText}>{commentText}</Text>
        </div>

        <div style={actionSection}>
          <table style={buttonTable}>
            <tbody>
              <tr>
                <td style={buttonCell}>
                  <Link href={approveUrl} style={approveButton}>
                    ✓ Approve Comment
                  </Link>
                </td>
                <td style={buttonCell}>
                  <Link href={declineUrl} style={declineButton}>
                    ✗ Decline Comment
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <Text style={footerText}>
          You can also moderate comments from the{' '}
          <Link href="https://www.redrowexposed.co.uk/admin/comments" style={emailLink}>
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

const evidenceSection = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0'
};

const evidenceTitle = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px'
};

const photoLabelText = {
  color: '#374151',
  fontSize: '14px',
  margin: '8px 0'
};

const mediaContainer = {
  margin: '16px 0',
  textAlign: 'center' as const
};

const photoImage = {
  maxWidth: '400px',
  width: '100%',
  height: 'auto',
  borderRadius: '6px',
  border: '1px solid #e5e7eb'
};

const videoPlaceholder = {
  backgroundColor: '#f3f4f6',
  border: '2px solid #e5e7eb',
  borderRadius: '6px',
  padding: '40px',
  textAlign: 'center' as const,
  maxWidth: '400px',
  margin: '0 auto'
};

const videoIcon = {
  fontSize: '48px',
  margin: '0 0 8px'
};

const videoText = {
  color: '#6b7280',
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0'
};

const viewLink = {
  color: '#0f3f7a',
  textDecoration: 'underline',
  fontSize: '14px',
  display: 'inline-block',
  marginTop: '12px'
};

const commentBox = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '20px',
  margin: '24px 0'
};

const commentText = { 
  color: '#1f2937', 
  fontSize: '14px', 
  lineHeight: '22px', 
  whiteSpace: 'pre-wrap' as const,
  margin: '0'
};

const actionSection = {
  margin: '32px 0 24px'
};

const buttonTable = {
  width: '100%',
  borderCollapse: 'collapse' as const
};

const buttonCell = {
  padding: '0 8px',
  textAlign: 'center' as const
};

const approveButton = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#10b981',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold',
  textDecoration: 'none',
  borderRadius: '6px',
  textAlign: 'center' as const
};

const declineButton = {
  display: 'inline-block',
  padding: '12px 24px',
  backgroundColor: '#ef4444',
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
