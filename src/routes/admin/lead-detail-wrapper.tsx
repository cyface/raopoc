import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';

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

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem',
    overflow: 'hidden'
  }}>
    <div style={{
      padding: '1rem',
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd',
      fontWeight: 'bold',
      fontSize: '1.1rem'
    }}>
      {title}
    </div>
    <div style={{ padding: '1.5rem' }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, value }: { label: string; value: any }) => (
  <div style={{ marginBottom: '1rem' }}>
    <strong style={{ color: '#555', marginRight: '0.5rem' }}>{label}:</strong>
    <span>{value || '-'}</span>
  </div>
);

export default function AdminLeadDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLead = async () => {
      if (!id) {
        navigate('/admin/leads');
        return;
      }

      try {
        const response = await fetch(`${getApiUrl()}/admin/leads/${id}`, {
          credentials: 'include',
        });

        if (response.status === 401) {
          navigate('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch lead details');
        }

        const leadData = await response.json();
        setLead(leadData);
      } catch {
        setError('Failed to load lead details');
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [id, navigate]);

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

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        fontSize: '1.2rem' 
      }}>
        Loading lead details...
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#f44336',
        fontSize: '1.2rem' 
      }}>
        {error || 'Lead not found'}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        marginBottom: '2rem',
        gap: '1rem'
      }}>
        <Link
          to="/admin/leads"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}
        >
          ← Back to Leads
        </Link>
        <h1 style={{ margin: 0, color: '#333' }}>
          Lead Details - {lead.id.substring(0, 8)}...
        </h1>
        <StatusBadge status={lead.status} />
      </div>

      <Section title="Basic Information">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <Field label="ID" value={lead.id} />
            <Field label="Status" value={lead.status} />
            <Field label="Current Step" value={`${lead.currentStep}/5`} />
            <Field label="Completed Steps" value={lead.completedSteps.join(', ') || 'None'} />
          </div>
          <div>
            <Field label="Financial Institution" value={lead.financialInstitution} />
            <Field label="Language" value={lead.language} />
            <Field label="Theme" value={lead.theme} />
            <Field label="Selected Products" value={lead.selectedProducts.join(', ')} />
          </div>
        </div>
      </Section>

      {lead.customerInfo && (
        <Section title="Customer Information">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div>
              <Field label="First Name" value={lead.customerInfo.firstName} />
              <Field label="Last Name" value={lead.customerInfo.lastName} />
              <Field label="Email" value={lead.customerInfo.email} />
              <Field label="Phone" value={lead.customerInfo.phone} />
              <Field label="Date of Birth" value={lead.customerInfo.dateOfBirth} />
            </div>
            <div>
              <Field label="Address" value={lead.customerInfo.address} />
              <Field label="City" value={lead.customerInfo.city} />
              <Field label="State" value={lead.customerInfo.state} />
              <Field label="Postal Code" value={lead.customerInfo.postalCode} />
              <Field label="Country" value={lead.customerInfo.country} />
            </div>
          </div>
        </Section>
      )}

      {lead.identificationInfo && (
        <Section title="Identification Information">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div>
              <Field label="SSN" value={lead.identificationInfo.ssn ? '***-**-****' : 'Not provided'} />
              <Field label="ID Type" value={lead.identificationInfo.idType} />
              <Field label="ID Number" value={lead.identificationInfo.idNumber ? '****' + lead.identificationInfo.idNumber.slice(-4) : 'Not provided'} />
            </div>
            <div>
              <Field label="ID State" value={lead.identificationInfo.idState} />
              <Field label="ID Expiration" value={lead.identificationInfo.idExpiration} />
            </div>
          </div>
        </Section>
      )}

      <Section title="Credit Check & Verification">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <Field label="Credit Check Status" value={lead.creditCheckStatus} />
            <Field label="Requires Verification" value={lead.requiresVerification ? 'Yes' : 'No'} />
            <Field label="Credit Check Message" value={lead.creditCheckMessage} />
          </div>
          <div>
            <Field label="Credit Check At" value={lead.creditCheckAt ? formatDate(lead.creditCheckAt) : 'Not performed'} />
            <Field label="All Documents Accepted" value={lead.allDocumentsAccepted ? 'Yes' : 'No'} />
          </div>
        </div>
      </Section>

      <Section title="Session & Tracking">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <Field label="Session ID" value={lead.sessionId} />
            <Field label="User Agent" value={lead.userAgent} />
            <Field label="IP Address" value={lead.ipAddress} />
            <Field label="Submission Source" value={lead.submissionSource} />
          </div>
          <div>
            <Field label="Browser Fingerprint" value={lead.browserFingerprint} />
            <Field label="Last Activity" value={formatDate(lead.lastActivity)} />
            <Field label="Dev Step" value={lead.devStep} />
            <Field label="Mock Scenario" value={lead.mockScenario} />
          </div>
        </div>
      </Section>

      <Section title="Timestamps">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <Field label="Created At" value={formatDate(lead.createdAt)} />
            <Field label="Updated At" value={formatDate(lead.updatedAt)} />
          </div>
          <div>
            <Field label="Submitted At" value={lead.submittedAt ? formatDate(lead.submittedAt) : 'Not submitted'} />
          </div>
        </div>
      </Section>
    </div>
  );
}