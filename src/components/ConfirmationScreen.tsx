import { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, EnvelopeIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../context/OnboardingContext';
import { configService, type BankInfo } from '../services/configService';
import { useTheme } from '../context/ThemeContext';

interface ConfirmationScreenProps {
  applicationId?: string;
}

export function ConfirmationScreen({ applicationId }: ConfirmationScreenProps) {
  const { data, creditCheckResult } = useOnboarding();
  const { styles } = useTheme();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [finalApplicationId, setFinalApplicationId] = useState<string | null>(applicationId || null);
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  const mockSendConfirmationEmail = useCallback(async (appId: string, email?: string) => {
    // Mock email sending with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`📧 Mock Email Sent to: ${email || 'customer@example.com'}`);
    console.log(`Subject: ${t('confirmationScreen.email.subject', { appId })}`);
    console.log(`
${t('confirmationScreen.email.greeting', { firstName: data.customerInfo?.firstName || t('confirmationScreen.email.defaultGreeting') })}

${t('confirmationScreen.email.thankYou', { bankName: bankInfo?.bankName || t('bankInfo.defaultName') })}
${data.selectedProducts.map(product => `• ${product.charAt(0).toUpperCase() + product.slice(1)} ${t('confirmationScreen.email.account')}`).join('\n')}

${t('confirmationScreen.email.applicationDetails')}:
- ${t('confirmationScreen.email.applicationId')}: ${appId}
- ${t('confirmationScreen.email.submitted')}: ${new Date().toLocaleString()}
- ${t('confirmationScreen.email.status')}: ${t('confirmationScreen.email.underReview')}

${t('confirmationScreen.email.whatNext')}:
1. ${t('confirmationScreen.email.reviewTime')}
2. ${t('confirmationScreen.email.mayContact')}
3. ${t('confirmationScreen.email.onceApproved')}

${t('confirmationScreen.email.checkStatus')}

${t('confirmationScreen.email.bestRegards')},
${bankInfo?.bankName || t('bankInfo.defaultName')} ${t('confirmationScreen.email.team')}
    `);
  }, [data.customerInfo?.firstName, data.selectedProducts, bankInfo?.bankName, t]);

  const handleSubmitApplication = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Submit application to API
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/applications`, {
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
      setSubmissionError(t('confirmationScreen.errors.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, isSubmitted, data, mockSendConfirmationEmail, t]);

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
  }, [applicationId, isSubmitted, isSubmitting, handleSubmitApplication]);

  if (isSubmitting) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <BuildingOffice2Icon className={styles.bankIcon} />
          <h1 className={styles.bankName}>{bankInfo?.bankName || t('bankInfo.defaultName')}</h1>
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
            {t('confirmationScreen.submitting.title')}
          </h2>
          <p style={{ color: '#6b7280' }}>
            {t('confirmationScreen.submitting.message')}
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
          <h1 className={styles.bankName}>{bankInfo?.bankName || t('bankInfo.defaultName')}</h1>
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
            {t('confirmationScreen.error.title')}
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
            {t('confirmationScreen.error.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BuildingOffice2Icon className={styles.bankIcon} />
        <h1 className={styles.bankName}>{bankInfo?.bankName || t('bankInfo.defaultName')}</h1>
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
        
        <h1 className={styles.heading}>{t('confirmationScreen.success.title')}</h1>
        <p className={styles.subheading}>
          {t('confirmationScreen.success.message', { bankName: bankInfo?.bankName || t('bankInfo.defaultName') })}
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
              {t('confirmationScreen.success.applicationDetails')}
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>{t('confirmationScreen.success.applicationId')}:</span>
                <span style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{finalApplicationId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>{t('confirmationScreen.success.submitted')}:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500' }}>{t('confirmationScreen.success.selectedProducts')}:</span>
                <span>{data.selectedProducts.join(', ')}</span>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gap: '1.5rem', margin: '2rem 0' }}>
          {creditCheckResult?.requiresVerification && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '1rem',
              backgroundColor: '#fef3c7',
              border: '2px solid #f59e0b',
              borderRadius: '8px'
            }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: '#f59e0b',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>!</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: '#92400e' }}>
                  {t('confirmationScreen.success.verificationRequired')}
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#92400e', margin: 0 }}>
                  {t('confirmationScreen.success.verificationMessage')}
                </p>
              </div>
            </div>
          )}

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
                {t('confirmationScreen.success.emailSent')}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                {t('confirmationScreen.success.emailMessage', { email: data.customerInfo?.email })}
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
                {t('confirmationScreen.success.whatsNext')}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                {creditCheckResult?.requiresVerification ? 
                  t('confirmationScreen.success.nextStepsVerification') : 
                  t('confirmationScreen.success.nextStepsReview')
                }
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
            <strong>{t('confirmationScreen.success.needHelp')}</strong> {t('confirmationScreen.success.contactTeam')}:
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            📞 {t('confirmationScreen.success.phone')}: {bankInfo?.contact.phoneDisplay || '1-800-COOLBNK (1-800-XXX-XXXX)'}
          </p>
          <p style={{ margin: '0 0 0.5rem 0' }}>
            ✉️ {t('confirmationScreen.success.email')}: {bankInfo?.contact.email || 'support@coolbank.com'}
          </p>
          <p style={{ margin: 0 }}>
            🕒 {t('confirmationScreen.success.hours')}: {bankInfo?.contact.hours || 'Monday - Friday 8:00 AM - 8:00 PM EST'}
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