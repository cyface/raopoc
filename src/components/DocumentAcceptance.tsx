import { useState, useEffect } from 'react';
import { DocumentTextIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { Document, DocumentAcceptanceState, DocumentConfig } from '../types/documents';
import { configService, type BankInfo } from '../services/configService';
import * as styles from '../styles/theme.css';

interface DocumentAcceptanceProps {
  selectedProducts: string[];
  hasNoSSN: boolean;
  onAcceptanceChange: (state: DocumentAcceptanceState) => void;
  onNext?: () => void;
}

export function DocumentAcceptance({ 
  selectedProducts, 
  hasNoSSN, 
  onAcceptanceChange,
  onNext
}: DocumentAcceptanceProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [acceptances, setAcceptances] = useState<Record<string, boolean>>({});
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);
  const [documentConfig, setDocumentConfig] = useState<DocumentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadApplicableDocuments();
    loadBankInfo();
  }, [selectedProducts, hasNoSSN]);

  const loadBankInfo = async () => {
    try {
      const bankInfoData = await configService.getBankInfo();
      setBankInfo(bankInfoData);
    } catch (error) {
      console.error('Failed to load bank info:', error);
    }
  };

  useEffect(() => {
    const allAccepted = documents.length > 0 && documents.every(doc => acceptances[doc.id]);
    onAcceptanceChange({
      acceptances: Object.entries(acceptances).reduce((acc, [docId, accepted]) => {
        acc[docId] = {
          documentId: docId,
          accepted,
          acceptedAt: accepted ? new Date().toISOString() : undefined,
        };
        return acc;
      }, {} as Record<string, any>),
      allAccepted,
    });
  }, [acceptances, documents, onAcceptanceChange]);

  const loadApplicableDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = await configService.getDocuments();
      setDocumentConfig(config);
      
      const applicableDocumentIds = new Set<string>();

      config.rules.forEach(rule => {
        const matchesProducts = !rule.productTypes || 
          rule.productTypes.some(product => selectedProducts.includes(product));
        const matchesSSN = rule.hasSSN === undefined && rule.noSSN === undefined ||
          (rule.hasSSN !== undefined && rule.hasSSN === !hasNoSSN) ||
          (rule.noSSN !== undefined && rule.noSSN === hasNoSSN);

        if (matchesProducts && matchesSSN) {
          rule.documentIds.forEach(id => applicableDocumentIds.add(id));
        }
      });

      const applicableDocuments = config.documents.filter(doc => 
        applicableDocumentIds.has(doc.id)
      );

      setDocuments(applicableDocuments);
      
      const initialAcceptances: Record<string, boolean> = {};
      applicableDocuments.forEach(doc => {
        initialAcceptances[doc.id] = false;
      });
      setAcceptances(initialAcceptances);

    } catch (err) {
      setError('Failed to load document requirements');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentAcceptance = (documentId: string, accepted: boolean) => {
    setAcceptances(prev => ({
      ...prev,
      [documentId]: accepted,
    }));
  };

  const handleAcceptAll = () => {
    const newAcceptances: Record<string, boolean> = {};
    documents.forEach(doc => {
      newAcceptances[doc.id] = true;
    });
    setAcceptances(newAcceptances);
  };

  const handleViewDocument = async (document: Document) => {
    try {
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'}/documents/${document.id}`);
      if (!response.ok) throw new Error('Failed to fetch document');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Error viewing document:', err);
      alert('Unable to open document. Please try again.');
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api'}/documents/${document.id}/download`);
      if (!response.ok) throw new Error('Failed to download document');
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `${document.name}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Unable to download document. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div>Loading document requirements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  const allAccepted = documents.every(doc => acceptances[doc.id]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BuildingOffice2Icon className={styles.bankIcon} />
        <h1 className={styles.bankName}>{bankInfo?.bankName || 'Cool Bank'}</h1>
      </div>
      
      <h1 className={styles.heading}>Review Required Documents</h1>
      <p className={styles.subheading}>
        Please review and accept the following documents to continue with your account opening.
      </p>

      {documents.length === 0 ? (
        <div style={{ padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', marginBottom: '2rem' }}>
          No additional documents are required for your selected products.
        </div>
      ) : (
        <>
          {documentConfig?.showAcceptAllButton && (
            <div style={{ marginBottom: '2rem' }}>
              <button
                type="button"
                onClick={handleAcceptAll}
                className={styles.button}
                disabled={allAccepted}
                style={{ opacity: allAccepted ? 0.6 : 1 }}
              >
                {allAccepted ? 'All Documents Accepted' : 'Accept All Documents'}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {documents.map((document) => (
              <div key={document.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', fontWeight: '600' }}>{document.name}</h3>
                    {document.description && (
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{document.description}</p>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => handleViewDocument(document)}
                      className={styles.button}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
                      title="View Document"
                    >
                      <DocumentTextIcon style={{ width: '1rem', height: '1rem' }} />
                      View
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => handleDownloadDocument(document)}
                      className={styles.button}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}
                      title="Download Document"
                    >
                      <ArrowDownTrayIcon style={{ width: '1rem', height: '1rem' }} />
                      Download
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={acceptances[document.id] || false}
                      onChange={(e) => handleDocumentAcceptance(document.id, e.target.checked)}
                      style={{ width: '1rem', height: '1rem' }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>
                      I have read and accept the {document.name}
                      {document.required && <span style={{ color: 'red' }}> *</span>}
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {onNext && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button
            type="button"
            onClick={onNext}
            className={styles.button}
            disabled={documents.length > 0 && !allAccepted}
            style={{ 
              backgroundColor: documents.length > 0 && !allAccepted ? '#d1d5db' : '#3b82f6',
              color: 'white',
              opacity: documents.length > 0 && !allAccepted ? 0.6 : 1,
              cursor: documents.length > 0 && !allAccepted ? 'not-allowed' : 'pointer'
            }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}