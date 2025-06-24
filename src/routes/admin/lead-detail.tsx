import { useLoaderData, Link, redirect } from 'react-router-dom';
import type { LoaderFunction } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';
import { useTheme } from '../../context/ThemeContext';
import { vars } from '../../styles/theme.css';
import { Sun, Moon } from 'lucide-react';

interface LeadDetail {
  id: string;
  status: string;
  currentStep: number;
  completedSteps: number[];
  financialInstitution?: string;
  language: string;
  theme?: string;
  selectedProducts: string[];
  customerInfo?: any;
  identificationInfo?: any;
  creditCheckStatus?: string;
  requiresVerification: boolean;
  creditCheckMessage?: string;
  creditCheckAt?: string;
  allDocumentsAccepted: boolean;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  submissionSource: string;
  browserFingerprint?: string;
  lastActivity: string;
  devStep?: number;
  mockScenario?: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export const adminLeadDetailLoader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  
  try {
    const response = await fetch(`${getApiUrl()}/admin/leads/${id}`, {
      credentials: 'include',
    });

    if (response.status === 401) {
      return redirect('/admin/login');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch lead details');
    }

    const lead = await response.json();
    return { lead };
  } catch {
    return redirect('/admin/leads');
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return '#4caf50';
      case 'IN_PROGRESS': return '#ff9800';
      case 'DRAFT': return '#9e9e9e';
      case 'APPROVED': return '#2196f3';
      case 'REJECTED': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <span style={{
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: 'bold',
      color: 'white',
      backgroundColor: getStatusColor(status)
    }}>
      {status}
    </span>
  );
};

const Section = ({ title, children, vars }: { title: string; children: React.ReactNode; vars: any }) => (
  <div style={{
    backgroundColor: vars.color.surface,
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
    overflow: 'hidden',
    border: `1px solid ${vars.color.border}`
  }}>
    <div style={{
      padding: '1rem',
      backgroundColor: vars.color.surfaceHover,
      borderBottom: `1px solid ${vars.color.border}`,
      fontWeight: 'bold',
      fontSize: '1.1rem',
      color: vars.color.textPrimary
    }}>
      {title}
    </div>
    <div style={{ padding: '1.5rem' }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, vars }: { label: string; value: any; vars: any }) => (
  <div style={{ marginBottom: '1rem' }}>
    <strong style={{ color: vars.color.textSecondary, marginRight: '0.5rem' }}>{label}:</strong>
    <span style={{ color: vars.color.textPrimary }}>{value || '-'}</span>
  </div>
);

export default function AdminLeadDetail() {
  const { lead } = useLoaderData() as { lead: LeadDetail };
  const { styles, theme, toggleTheme } = useTheme();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={styles.container} style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      <button 
        className={styles.themeToggle} 
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem'
        }}
      >
        {(theme.endsWith('Light') || theme === 'light') ? 
          <Moon size={16} className={styles.themeToggleIcon} /> : 
          <Sun size={16} className={styles.themeToggleIcon} />
        }
        <span className={styles.themeToggleLabel}>
          {(theme.endsWith('Light') || theme === 'light') ? 'Dark Mode' : 'Light Mode'}
        </span>
      </button>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '2rem',
        marginTop: '-1rem',
        gap: '1rem'
      }}>
        <Link
          to="/admin/leads"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: vars.color.secondary,
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          ← Back to Leads
        </Link>
        <h1 style={{ margin: 0, color: vars.color.textPrimary }}>
          Lead Details - {lead.id.substring(0, 8)}...
        </h1>
        <StatusBadge status={lead.status} />
      </div>

      <Section title="Basic Information" vars={vars}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <Field label="ID" value={lead.id} vars={vars} />
            <Field label="Status" value={lead.status} vars={vars} />
            <Field label="Current Step" value={`${lead.currentStep}/5`} vars={vars} />
            <Field label="Completed Steps" value={lead.completedSteps.join(', ') || 'None'} vars={vars} />
          </div>
          <div>
            <Field label="Financial Institution" value={lead.financialInstitution} vars={vars} />
            <Field label="Language" value={lead.language} vars={vars} />
            <Field label="Theme" value={lead.theme} vars={vars} />
            <Field label="Selected Products" value={lead.selectedProducts.join(', ')} vars={vars} />
          </div>
        </div>
      </Section>

      {lead.customerInfo && (
        <Section title="Customer Information" vars={vars}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div>
              <Field label="First Name" value={lead.customerInfo.firstName} vars={vars} />
              <Field label="Last Name" value={lead.customerInfo.lastName} vars={vars} />
              <Field label="Email" value={lead.customerInfo.email} vars={vars} />
              <Field label="Phone" value={lead.customerInfo.phone} vars={vars} />
              <Field label="Date of Birth" value={lead.customerInfo.dateOfBirth} vars={vars} />
            </div>
            <div>
              <Field label="Address" value={lead.customerInfo.address} vars={vars} />
              <Field label="City" value={lead.customerInfo.city} vars={vars} />
              <Field label="State" value={lead.customerInfo.state} vars={vars} />
              <Field label="Postal Code" value={lead.customerInfo.postalCode} vars={vars} />
              <Field label="Country" value={lead.customerInfo.country} vars={vars} />
            </div>
          </div>
        </Section>
      )}

      {lead.identificationInfo && (
        <Section title="Identification Information" vars={vars}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div>
              <Field label="SSN" value={lead.identificationInfo.ssn ? '***-**-****' : 'Not provided'} vars={vars} />
              <Field label="ID Type" value={lead.identificationInfo.idType} vars={vars} />
              <Field label="ID Number" value={lead.identificationInfo.idNumber ? '****' + lead.identificationInfo.idNumber.slice(-4) : 'Not provided'} vars={vars} />
            </div>
            <div>
              <Field label="ID State" value={lead.identificationInfo.idState} vars={vars} />
              <Field label="ID Expiration" value={lead.identificationInfo.idExpiration} vars={vars} />
            </div>
          </div>
        </Section>
      )}

      <Section title="Credit Check & Verification" vars={vars}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <Field label="Credit Check Status" value={lead.creditCheckStatus} vars={vars} />
            <Field label="Requires Verification" value={lead.requiresVerification ? 'Yes' : 'No'} vars={vars} />
            <Field label="Credit Check Message" value={lead.creditCheckMessage} vars={vars} />
          </div>
          <div>
            <Field label="Credit Check At" value={lead.creditCheckAt ? formatDate(lead.creditCheckAt) : 'Not performed'} vars={vars} />
            <Field label="All Documents Accepted" value={lead.allDocumentsAccepted ? 'Yes' : 'No'} vars={vars} />
          </div>
        </div>
      </Section>

      <Section title="Session & Tracking" vars={vars}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <Field label="Session ID" value={lead.sessionId} vars={vars} />
            <Field label="User Agent" value={lead.userAgent} vars={vars} />
            <Field label="IP Address" value={lead.ipAddress} vars={vars} />
            <Field label="Submission Source" value={lead.submissionSource} vars={vars} />
          </div>
          <div>
            <Field label="Browser Fingerprint" value={lead.browserFingerprint} vars={vars} />
            <Field label="Last Activity" value={formatDate(lead.lastActivity)} vars={vars} />
            <Field label="Dev Step" value={lead.devStep} vars={vars} />
            <Field label="Mock Scenario" value={lead.mockScenario} vars={vars} />
          </div>
        </div>
      </Section>

      <Section title="Timestamps" vars={vars}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <Field label="Created At" value={formatDate(lead.createdAt)} vars={vars} />
            <Field label="Updated At" value={formatDate(lead.updatedAt)} vars={vars} />
          </div>
          <div>
            <Field label="Submitted At" value={lead.submittedAt ? formatDate(lead.submittedAt) : 'Not submitted'} vars={vars} />
          </div>
        </div>
      </Section>
    </div>
  );
}