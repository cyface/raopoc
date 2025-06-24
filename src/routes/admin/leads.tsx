import { useLoaderData, Link, redirect } from 'react-router-dom';
import type { LoaderFunction } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { getApiUrl } from '../../utils/apiUrl';
import { useTheme } from '../../context/ThemeContext';
import { vars } from '../../styles/theme.css';
import { Sun, Moon } from 'lucide-react';

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

export const adminLeadsLoader: LoaderFunction = async () => {
  try {
    const response = await fetch(`${getApiUrl()}/admin/leads`, {
      credentials: 'include',
    });

    if (response.status === 401) {
      return redirect('/admin/login');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch leads');
    }

    const leads = await response.json();
    return { leads };
  } catch {
    return redirect('/admin/login');
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

const ProductTags = ({ products }: { products: string[] }) => {
  const formatProductName = (product: string) => {
    return product
      .toLowerCase()
      .replace(/_/g, '-')
      .replace('-', ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (!products || products.length === 0) {
    return <span style={{ color: vars.color.textSecondary }}>-</span>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
      {products.map((product, index) => (
        <span
          key={index}
          style={{
            padding: '0.25rem 0.75rem',
            backgroundColor: vars.color.primary,
            color: vars.color.white,
            borderRadius: '1rem',
            fontSize: '0.75rem',
            textTransform: 'capitalize',
            whiteSpace: 'nowrap'
          }}
        >
          {formatProductName(product)}
        </span>
      ))}
    </div>
  );
};

export default function AdminLeads() {
  const { leads } = useLoaderData() as { leads: Lead[] };
  const { styles, theme, toggleTheme } = useTheme();
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showRightShadow, setShowRightShadow] = useState(false);
  const [showLeftShadow, setShowLeftShadow] = useState(false);

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
    window.location.href = '/admin/login';
  };

  const checkScrollShadow = () => {
    const container = tableContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isScrolledToEnd = scrollLeft + clientWidth >= scrollWidth - 1; // -1 for rounding
      const isScrolledFromStart = scrollLeft > 1; // More than 1px scrolled
      
      setShowRightShadow(!isScrolledToEnd && scrollWidth > clientWidth);
      setShowLeftShadow(isScrolledFromStart && scrollWidth > clientWidth);
    }
  };

  useEffect(() => {
    // Check initial state and on resize
    checkScrollShadow();
    
    const handleResize = () => checkScrollShadow();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [leads]);

  const handleScroll = () => {
    checkScrollShadow();
  };

  return (
    <div className={styles.container} style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem',
        width: '100%'
      }}>
        <h1 style={{ margin: 0, color: vars.color.textPrimary }}>Admin - Leads Management</h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: vars.color.error,
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              height: 'auto'
            }}
          >
            Logout
          </button>
          
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme}
            style={{
              position: 'static',
              top: 'auto',
              right: 'auto'
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
        </div>
      </div>

      <div style={{
        backgroundColor: vars.color.surface,
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: `1px solid ${vars.color.border}`
      }}>
        <div style={{
          padding: '1rem',
          backgroundColor: vars.color.surfaceHover,
          borderBottom: `1px solid ${vars.color.border}`,
          fontWeight: 'bold',
          color: vars.color.textPrimary
        }}>
          Total Leads: {leads.length}
        </div>

        {leads.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: vars.color.textSecondary }}>
            No leads found
          </div>
        ) : (
          <div 
            ref={tableContainerRef}
            onScroll={handleScroll}
            style={{ 
              overflowX: 'auto',
              position: 'relative',
              boxShadow: [
                showLeftShadow ? `inset 10px 0 10px -10px ${vars.color.scrollShadow}` : '',
                showRightShadow ? `inset -10px 0 10px -10px ${vars.color.scrollShadow}` : ''
              ].filter(Boolean).join(', ') || 'none'
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: vars.color.surfaceHover }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textPrimary }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textPrimary }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textPrimary }}>Step</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textPrimary }}>FI</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textPrimary }}>Products</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textPrimary }}>Customer</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textPrimary }}>Created</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: `1px solid ${vars.color.border}`, color: vars.color.textPrimary }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} style={{ borderBottom: `1px solid ${vars.color.border}` }}>
                    <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.875rem', color: vars.color.textPrimary }}>
                      {lead.id.substring(0, 8)}...
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={lead.status} />
                    </td>
                    <td style={{ padding: '1rem', color: vars.color.textPrimary }}>
                      {lead.currentStep}/5
                    </td>
                    <td style={{ padding: '1rem', color: vars.color.textPrimary }}>
                      {lead.financialInstitution || '-'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <ProductTags products={lead.selectedProducts} />
                    </td>
                    <td style={{ padding: '1rem', color: vars.color.textPrimary }}>
                      {lead.customerInfo?.firstName && lead.customerInfo?.lastName 
                        ? `${lead.customerInfo.firstName} ${lead.customerInfo.lastName}`
                        : '-'
                      }
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: vars.color.textPrimary }}>
                      {formatDate(lead.createdAt)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <Link
                        to={`/admin/leads/${lead.id}`}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: vars.color.primary,
                          color: 'white',
                          textDecoration: 'none',
                          borderRadius: '4px',
                          fontSize: '0.875rem',
                          whiteSpace: 'nowrap',
                          display: 'inline-block',
                          minWidth: 'max-content'
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