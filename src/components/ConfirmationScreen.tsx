import { useState, useEffect, useCallback } from 'react';
import { CheckCircleIcon, EnvelopeIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import { useOnboarding } from '../context/OnboardingContext';
import { configService, type BankInfo } from '../services/configService';
import { useTheme } from '../context/ThemeContext';
import { getApiUrl } from '../utils/apiUrl';

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
      const response = await fetch(`${getApiUrl()}/applications`, {
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
            border: `4px solid ${styles.vars.color.border}`, 
            borderTop: `4px solid ${styles.vars.color.primary}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 2rem'
          }} />
          <h2 className={styles.heading} style={{ marginBottom: '1rem' }}>
            {t('confirmationScreen.submitting.title')}
          </h2>
          <p className={styles.subheading}>
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
            backgroundColor: styles.vars.color.surface,
            border: `2px solid ${styles.vars.color.error}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem'
          }}>
            <span style={{ fontSize: '2rem', color: styles.vars.color.error }}>✕</span>
          </div>
          
          <h2 className={styles.heading} style={{ marginBottom: '1rem', color: styles.vars.color.error }}>
            {t('confirmationScreen.error.title')}
          </h2>
          <p className={styles.subheading} style={{ marginBottom: '2rem' }}>
            {submissionError}
          </p>
          
          <button
            type="button"
            onClick={handleSubmitApplication}
            className={styles.primaryButton}
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
          backgroundColor: styles.vars.color.surface,
          border: `2px solid ${styles.vars.color.success}`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          <CheckCircleIcon style={{ width: '40px', height: '40px', color: styles.vars.color.success }} />
        </div>
        
        <h1 className={styles.heading}>{t('confirmationScreen.success.title')}</h1>
        <p className={styles.subheading}>
          {t('confirmationScreen.success.message', { bankName: bankInfo?.bankName || t('bankInfo.defaultName') })}
        </p>

        {finalApplicationId && (
          <div style={{ 
            backgroundColor: styles.vars.color.surface, 
            border: `1px solid ${styles.vars.color.border}`, 
            borderRadius: '8px', 
            padding: '1.5rem', 
            margin: '2rem 0',
            textAlign: 'left'
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: styles.vars.color.textPrimary }}>
              {t('confirmationScreen.success.applicationDetails')}
            </h3>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: styles.vars.color.textSecondary }}>{t('confirmationScreen.success.applicationId')}:</span>
                <span style={{ fontFamily: 'monospace', color: styles.vars.color.primary }}>{finalApplicationId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: styles.vars.color.textSecondary }}>{t('confirmationScreen.success.submitted')}:</span>
                <span style={{ color: styles.vars.color.textPrimary }}>{new Date().toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: styles.vars.color.textSecondary }}>{t('confirmationScreen.success.selectedProducts')}:</span>
                <span style={{ color: styles.vars.color.textPrimary }}>{data.selectedProducts.join(', ')}</span>
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
              backgroundColor: styles.vars.color.surface,
              border: `2px solid ${styles.vars.color.warning}`,
              borderRadius: '8px'
            }}>
              <div style={{ 
                width: '24px', 
                height: '24px', 
                backgroundColor: styles.vars.color.warning,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span style={{ color: styles.vars.color.white, fontWeight: 'bold', fontSize: '14px' }}>!</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: styles.vars.color.textPrimary }}>
                  {t('confirmationScreen.success.verificationRequired')}
                </h4>
                <p style={{ fontSize: '0.875rem', color: styles.vars.color.textSecondary, margin: 0 }}>
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
            backgroundColor: styles.vars.color.surface,
            border: `1px solid ${styles.vars.color.border}`,
            borderRadius: '8px'
          }}>
            <EnvelopeIcon style={{ width: '24px', height: '24px', color: styles.vars.color.icon, flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: styles.vars.color.textPrimary }}>
                {t('confirmationScreen.success.emailSent')}
              </h4>
              <p style={{ fontSize: '0.875rem', color: styles.vars.color.textSecondary, margin: 0 }}>
                {t('confirmationScreen.success.emailMessage', { email: data.customerInfo?.email })}
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            padding: '1rem',
            backgroundColor: styles.vars.color.surface,
            border: `1px solid ${styles.vars.color.border}`,
            borderRadius: '8px'
          }}>
            <DocumentCheckIcon style={{ width: '24px', height: '24px', color: styles.vars.color.icon, flexShrink: 0 }} />
            <div style={{ textAlign: 'left' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 0.25rem 0', color: styles.vars.color.textPrimary }}>
                {t('confirmationScreen.success.whatsNext')}
              </h4>
              <p style={{ fontSize: '0.875rem', color: styles.vars.color.textSecondary, margin: 0 }}>
                {creditCheckResult?.requiresVerification ? 
                  t('confirmationScreen.success.nextStepsVerification') : 
                  t('confirmationScreen.success.nextStepsReview')
                }
              </p>
            </div>
          </div>
        </div>

        <div style={{ 
          backgroundColor: styles.vars.color.surface, 
          border: `1px solid ${styles.vars.color.border}`, 
          borderRadius: '8px', 
          padding: '1.5rem', 
          margin: '2rem 0',
          fontSize: '0.875rem',
          color: styles.vars.color.textSecondary
        }}>
          <p style={{ margin: '0 0 0.5rem 0', color: styles.vars.color.textPrimary }}>
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