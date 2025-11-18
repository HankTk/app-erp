import { useState, useEffect } from 'react';
import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
  AxListbox,
  AxFormGroup,
  AxLabel,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchRMAs, RMA } from '../../api/rmaApi';
import { fetchSFCs, fetchSFCsByStatus, createSFCFromRMA, SFC } from '../../api/sfcApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'ShopFloorControlListingPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1;
`;

const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: var(--spacing-md);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const TableCard = styled(AxCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(100vh - 280px);
  overflow: hidden;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background-color: ${props => {
    switch (props.status) {
      case 'IN_PROGRESS': return 'var(--color-info-light)';
      case 'COMPLETED': return 'var(--color-success-light)';
      case 'PENDING': return 'var(--color-warning-light)';
      case 'CANCELLED': return 'var(--color-danger-light)';
      default: return 'var(--color-background-secondary)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'IN_PROGRESS': return 'var(--color-info-dark)';
      case 'COMPLETED': return 'var(--color-success-dark)';
      case 'PENDING': return 'var(--color-warning-dark)';
      case 'CANCELLED': return 'var(--color-danger-dark)';
      default: return 'var(--color-text-primary)';
    }
  }};
`;

interface ShopFloorControlListingPageProps {
  onProcessRMA?: (rmaId: string) => void;
  onNavigateBack?: () => void;
}

export function ShopFloorControlListingPage({ onProcessRMA, onNavigateBack }: ShopFloorControlListingPageProps = {} as ShopFloorControlListingPageProps) {
  const { l10n } = useI18n();
  const [sfcs, setSfcs] = useState<SFC[]>([]);
  const [rmas, setRmas] = useState<RMA[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [customersData, sfcsData, rmasData] = await Promise.all([
        fetchCustomers(),
        statusFilter ? fetchSFCsByStatus(statusFilter) : fetchSFCs(),
        fetchRMAs(), // Fetch RMAs to find ones that need SFC creation
      ]);
      setCustomers(customersData);
      setRmas(rmasData);
      
      // Filter SFCs if status filter is set
      let filteredSFCs = sfcsData;
      if (statusFilter) {
        filteredSFCs = filteredSFCs.filter(sfc => sfc.status === statusFilter);
      }
      setSfcs(filteredSFCs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SFC data');
      console.error('Error loading shop floor control data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'N/A';
    const customer = customers.find(c => c.id === customerId);
    return customer?.companyName || `${customer?.lastName || ''} ${customer?.firstName || ''}`.trim() || customer?.email || 'Unknown Customer';
  };

  const handleProcess = async (sfc: SFC) => {
    if (sfc.id && onProcessRMA && sfc.rmaId) {
      onProcessRMA(sfc.rmaId);
    }
  };

  const handleCreateSFC = async (rma: RMA) => {
    if (!rma.id) return;
    
    try {
      setProcessing(rma.id);
      setError(null);
      const sfc = await createSFCFromRMA(rma.id);
      // Reload data to show the new SFC
      await loadData();
      // Navigate to process the SFC
      if (sfc.id && onProcessRMA && sfc.rmaId) {
        onProcessRMA(sfc.rmaId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create SFC');
      console.error('Error creating SFC:', err);
    } finally {
      setProcessing(null);
    }
  };

  // Find RMAs that need SFC creation (APPROVED or RECEIVED status, and no SFC exists)
  const rmasNeedingSFC = rmas.filter(rma => {
    if (rma.status !== 'APPROVED' && rma.status !== 'RECEIVED') return false;
    if (!rma.id) return false;
    // Check if SFC already exists for this RMA
    return !sfcs.some(sfc => sfc.rmaId === rma.id);
  });

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={onNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                ← Back
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                Shop Floor Control
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Manage shop floor control work orders
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup>
              <AxLabel>Status Filter</AxLabel>
              <AxListbox
                options={[
                  { value: null, label: 'All' },
                  { value: 'PENDING', label: 'Pending' },
                  { value: 'IN_PROGRESS', label: 'In Progress' },
                  { value: 'COMPLETED', label: 'Completed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                fullWidth
                style={{ minWidth: '150px' }}
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        {loading ? (
          <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <AxParagraph>Loading SFC records...</AxParagraph>
          </div>
        ) : error ? (
          <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <AxParagraph style={{ color: 'var(--color-danger)' }}>{error}</AxParagraph>
            <AxButton variant="secondary" onClick={loadData} style={{ marginTop: 'var(--spacing-md)' }}>
              Retry
            </AxButton>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {sfcs.length > 0 && (
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)' }}>
                  Active SFC Records
                </AxHeading3>
                <AxTable fullWidth>
                  <AxTableHead>
                    <AxTableRow>
                      <AxTableHeader>SFC Number</AxTableHeader>
                      <AxTableHeader>RMA Number</AxTableHeader>
                      <AxTableHeader>Customer</AxTableHeader>
                      <AxTableHeader>Order Number</AxTableHeader>
                      <AxTableHeader>Created Date</AxTableHeader>
                      <AxTableHeader>Status</AxTableHeader>
                      <AxTableHeader align="center">Actions</AxTableHeader>
                    </AxTableRow>
                  </AxTableHead>
                  <AxTableBody>
                    {sfcs.map((sfc) => (
                      <AxTableRow key={sfc.id}>
                        <AxTableCell>
                          <strong>{sfc.sfcNumber || sfc.id}</strong>
                        </AxTableCell>
                        <AxTableCell>{sfc.rmaNumber || 'N/A'}</AxTableCell>
                        <AxTableCell>{sfc.customerName || getCustomerName(sfc.customerId)}</AxTableCell>
                        <AxTableCell>{sfc.orderNumber || 'N/A'}</AxTableCell>
                        <AxTableCell>
                          {sfc.createdDate ? new Date(sfc.createdDate).toLocaleDateString() : 'N/A'}
                        </AxTableCell>
                        <AxTableCell>
                          <StatusBadge status={sfc.status || 'PENDING'}>
                            {sfc.status || 'PENDING'}
                          </StatusBadge>
                        </AxTableCell>
                        <AxTableCell align="center">
                          {sfc.id && onProcessRMA && sfc.rmaId && (
                            <AxButton 
                              variant="primary" 
                              size="small"
                              onClick={() => handleProcess(sfc)}
                              style={{ minWidth: 'auto' }}
                            >
                              Process
                            </AxButton>
                          )}
                        </AxTableCell>
                      </AxTableRow>
                    ))}
                  </AxTableBody>
                </AxTable>
              </div>
            )}
            
            {rmasNeedingSFC.length > 0 && (
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)' }}>
                  RMAs Ready for SFC Creation
                </AxHeading3>
                <AxTable fullWidth>
                  <AxTableHead>
                    <AxTableRow>
                      <AxTableHeader>RMA Number</AxTableHeader>
                      <AxTableHeader>Customer</AxTableHeader>
                      <AxTableHeader>Order Number</AxTableHeader>
                      <AxTableHeader>RMA Date</AxTableHeader>
                      <AxTableHeader>Status</AxTableHeader>
                      <AxTableHeader align="center">Actions</AxTableHeader>
                    </AxTableRow>
                  </AxTableHead>
                  <AxTableBody>
                    {rmasNeedingSFC.map((rma) => (
                      <AxTableRow key={rma.id}>
                        <AxTableCell>
                          <strong>{rma.rmaNumber || rma.id}</strong>
                        </AxTableCell>
                        <AxTableCell>{getCustomerName(rma.customerId)}</AxTableCell>
                        <AxTableCell>{rma.orderNumber || 'N/A'}</AxTableCell>
                        <AxTableCell>
                          {rma.rmaDate ? new Date(rma.rmaDate).toLocaleDateString() : 'N/A'}
                        </AxTableCell>
                        <AxTableCell>
                          <StatusBadge status={rma.status || 'DRAFT'}>
                            {rma.status || 'DRAFT'}
                          </StatusBadge>
                        </AxTableCell>
                        <AxTableCell align="center">
                          {rma.id && (
                            <AxButton 
                              variant="primary" 
                              size="small"
                              onClick={() => handleCreateSFC(rma)}
                              disabled={processing === rma.id}
                              style={{ minWidth: 'auto' }}
                            >
                              {processing === rma.id ? 'Creating...' : 'Create SFC'}
                            </AxButton>
                          )}
                        </AxTableCell>
                      </AxTableRow>
                    ))}
                  </AxTableBody>
                </AxTable>
              </div>
            )}
            
            {sfcs.length === 0 && rmasNeedingSFC.length === 0 && (
              <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  No SFC records found. RMAs must be in APPROVED or RECEIVED status to create SFC records.
                </AxParagraph>
              </div>
            )}
          </div>
        )}
      </TableCard>
    </PageContainer>
  );
}

