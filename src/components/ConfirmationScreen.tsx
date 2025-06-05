import { useState, useEffect } from 'react';
import { CheckCircleIcon, EnvelopeIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useOnboarding } from '../context/OnboardingContext';
import { configService, type BankInfo } from '../services/configService';
import * as styles from '../styles/theme.css';

interface ConfirmationScreenProps {
  applicationId?: string;
}

export function ConfirmationScreen({ applicationId }: ConfirmationScreenProps) {
  const { data } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [finalApplicationId, setFinalApplicationId] = useState<string | null>(applicationId || null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  useEffect(() => {
    const loadBankInfo = async () => {
      try {
        const bankInfoData = await configService.getBankInfo();
        setBankInfo(bankInfoData);
      } catch (error) {
        console.error('Failed to load bank info:', error);
      }
    };
    loadBankInfo();

    if (!applicationId && !isSubmitted && !isSubmitting) {
      handleSubmitApplication();
    }
  }, [applicationId, isSubmitted, isSubmitting]);

  const handleSubmitApplication = async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Submit application to API
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'}/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit application: ${response.status}`);
      }

      const result = await response.json();
      setFinalApplicationId(result.applicationId);

      // Mock sending confirmation email
      await mockSendConfirmationEmail(result.applicationId, data.customerInfo?.email);

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
      setSubmissionError('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockSendConfirmationEmail = async (appId: string, email?: string) => {
    // Mock email sending with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📧 Mock Email Sent to: ${email || 'customer@example.com'}`);
    console.log(`Subject: Your Bank Account Application Confirmation - ${appId}`);
    console.log(`
Dear ${data.customerInfo?.firstName || 'Valued Customer'},

Thank you for choosing ${bankInfo?.bankName || 'Cool Bank'}! We have received your application for the following accounts:
${data.selectedProducts.map(product => `• ${product.charAt(0).toUpperCase() + product.slice(1)} Account`).join('\n')}

Application Details:
- Application ID: ${appId}
- Submitted: ${new Date().toLocaleString()}
- Status: Under Review

What happens next?
1. We will review your application within 1-2 business days
2. You may be contacted for additional information if needed
3. Once approved, you will receive your account details and materials

You can check your application status at any time by visiting our website or calling customer service.

Best regards,
${bankInfo?.bankName || 'Cool Bank'} Team
    `);
  };

  if (isSubmitting) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BuildingOffice2Icon className={styles.bankIcon} />
          <h1 className={styles.bankName}>{bankInfo?.bankName || 'Cool Bank'}</h1>
        </div>
        
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            border: '4px solid #f3f4f6', 
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 2rem'
          }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            Submitting Your Application
          </h2>
          <p style={{ color: '#6b7280' }}>
            Please wait while we process your information...
          </p>
        </div>
      </div>
    );
  }

  if (submissionError) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BuildingOffice2Icon className={styles.bankIcon} />
          <h1 className={styles.bankName}>{bankInfo?.bankName || 'Cool Bank'}</h1>
        </div>
        
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#fef2f2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <span style={{ fontSize: '2rem', color: '#dc2626' }}>✕</span>
          </div>
          
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#dc2626' }}>
            Submission Failed
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            {submissionError}
          </p>
          
          <button
            type="button"
            onClick={handleSubmitApplication}
            className={styles.button}
            style={{ backgroundColor: '#3b82f6', color: 'white' }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BuildingOffice2Icon className={styles.bankIcon} />
        <h1 className={styles.bankName}>Cool Bank</h1>
      </div>
      
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ 
          width: '64px', 
          height: '64px', 
          backgroundColor: '#ecfdf5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <CheckCircleIcon style={{ width: '40px', height: '40px', color: '#059669' }} />
        </div>
        
        <h1 className={styles.heading}>Application Submitted Successfully!</h1>
        <p className={styles.subheading}>
          Thank you for choosing {bankInfo?.bankName || 'Cool Bank'}. Your application has been received and is being processed.
        </p>

        {finalApplicationId && (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '1.5rem', 
            margin: '2rem 0',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
              Application Details
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>Application ID:</span>
                <span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{finalApplicationId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>Submitted:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>Selected Products:</span>
                <span>{data.selectedProducts.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem', margin: '2rem 0' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#fefce8',
            border: '1px solid #fde047',
            borderRadius: '8px'
          }}>
            <EnvelopeIcon style={{ width: '24px', height: '24px', color: '#ca8a04', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                Confirmation Email Sent
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                A confirmation email has been sent to <strong>{data.customerInfo?.email}</strong> with your application details.
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            border: '1px solid #7dd3fc',
            borderRadius: '8px'
          }}>
            <DocumentCheckIcon style={{ width: '24px', height: '24px', color: '#0284c7', flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0' }}>
                What&apos;s Next?
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                We&apos;ll review your application within 1-2 business days. You may be contacted for additional information if needed.
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          margin: '2rem 0',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            <strong>Need help?</strong> Contact our customer service team:
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            📞 Phone: {bankInfo?.contact.phoneDisplay || '1-800-COOLBNK (1-800-XXX-XXXX)'}
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            ✉️ Email: {bankInfo?.contact.email || 'support@coolbank.com'}
          </p>
          <p style={{ margin: 0 }}>
            🕒 Hours: {bankInfo?.contact.hours || 'Monday - Friday 8:00 AM - 8:00 PM EST'}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}