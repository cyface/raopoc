import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';

interface Lead {
  id: string;
  status: string;
  currentStep: number;
  financialInstitution?: string;
  language: string;
  selectedProducts: string[];
  customerInfo?: any;
  creditCheckStatus?: string;
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

export default function AdminLeadsWrapper() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/admin/leads`, {
          credentials: 'include',
        });

        if (response.status === 401) {
          navigate('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch leads');
        }

        const leadsData = await response.json();
        setLeads(leadsData);
      } catch {
        setError('Failed to load leads');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLogout = async () => {
    await fetch(`${getApiUrl()}/admin/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        fontSize: '1.2rem' 
      }}>
        Loading leads...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#f44336',
        fontSize: '1.2rem' 
      }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>Admin - Leads Management</h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #ddd',
          fontWeight: 'bold'
        }}>
          Total Leads: {leads.length}
        </div>

        {leads.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            No leads found
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9f9f9' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Step</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>FI</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Products</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Created</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {lead.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {lead.currentStep}/5
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {lead.financialInstitution || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {lead.selectedProducts.length > 0 ? lead.selectedProducts.join(', ') : '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {lead.customerInfo?.firstName && lead.customerInfo?.lastName 
                        ? `${lead.customerInfo.firstName} ${lead.customerInfo.lastName}`
                        : '-'
                      }
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {formatDate(lead.createdAt)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link
                        to={`/admin/leads/${lead.id}`}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#1976d2',
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '0.875rem'
                        }}
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}