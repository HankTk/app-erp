import { useState, useEffect } from 'react';
import {
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxFormGroup,
  AxListbox,
} from '@ui/components';
import { fetchRMAs, deleteRMA, RMA } from '../../api/rmaApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'RMAListingPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  width: 100%;
  padding: var(--spacing-lg);
  box-sizing: border-box;
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

interface RMAListingPageProps {
  onNavigateToRMAEntry?: () => void;
  onEditRMA?: (rmaId: string) => void;
  onViewRMA?: (rmaId: string) => void;
  onNavigateBack?: () => void;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
}

export function RMAListingPage({ onNavigateToRMAEntry, onEditRMA, onViewRMA, onNavigateBack, onNavigateToShopFloorControl }: RMAListingPageProps = {} as RMAListingPageProps) {
  const [rmas, setRmas] = useState<RMA[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRMA, setSelectedRMA] = useState<RMA | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const loadRMAs = async () => {
    try {
      setLoading(true);
      setError(null);
      const rmasData = await fetchRMAs();
      setRmas(rmasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RMAs');
      console.error('Error fetching RMAs:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await fetchCustomers();
      setCustomers(customersData);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  useEffect(() => {
    loadRMAs();
    loadCustomers();
  }, []);

  const filteredRMAs = statusFilter
    ? rmas.filter(rma => rma.status === statusFilter)
    : rmas;

  const getCustomerName = (rma: RMA) => {
    if (rma.customerName) return rma.customerName;
    if (!rma.customerId) return 'N/A';
    const customer = customers.find(c => c.id === rma.customerId);
    return customer ? (customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email) : rma.customerId;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const handleView = (rma: RMA) => {
    if (onViewRMA && rma.id) {
      onViewRMA(rma.id);
    }
  };

  const handleEdit = (rma: RMA) => {
    if (onEditRMA && rma.id) {
      onEditRMA(rma.id);
    }
  };

  const handleDeleteClick = (rma: RMA) => {
    setSelectedRMA(rma);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRMA?.id) return;

    try {
      setSubmitting(true);
      await deleteRMA(selectedRMA.id);
      await loadRMAs();
      setDeleteDialogOpen(false);
      setSelectedRMA(null);
    } catch (err) {
      console.error('Error deleting RMA:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete RMA');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return '#6B7280';
      case 'PENDING_APPROVAL':
        return '#F59E0B';
      case 'APPROVED':
        return '#3B82F6';
      case 'RECEIVED':
        return '#10B981';
      case 'PROCESSED':
        return '#059669';
      case 'CANCELLED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusBackgroundColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return '#F3F4F6';
      case 'PENDING_APPROVAL':
        return '#FEF3C7';
      case 'APPROVED':
        return '#DBEAFE';
      case 'RECEIVED':
        return '#D1FAE5';
      case 'PROCESSED':
        return '#D1FAE5';
      case 'CANCELLED':
        return '#FEE2E2';
      default:
        return '#F3F4F6';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'PENDING_APPROVAL':
        return 'Pending Approval';
      case 'APPROVED':
        return 'Approved';
      case 'RECEIVED':
        return 'Received';
      case 'PROCESSED':
        return 'Processed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status || 'N/A';
    }
  };

  if (loading) {
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
                  RMAs
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  View and manage all return merchandise authorizations
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading RMAs...</AxParagraph>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  if (error) {
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
                  RMAs
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  View and manage all return merchandise authorizations
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </AxButton>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

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
                RMAs
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                View and manage all return merchandise authorizations
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={[
                  { value: null, label: 'All Statuses' },
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'RECEIVED', label: 'Received' },
                  { value: 'PROCESSED', label: 'Processed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                placeholder="Filter by status"
              />
            </AxFormGroup>
            {onNavigateToRMAEntry && (
              <AxButton variant="primary" onClick={onNavigateToRMAEntry}>
                Create RMA
              </AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredRMAs.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No RMAs found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth stickyHeader>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>RMA Number</AxTableHeader>
                  <AxTableHeader>Order Number</AxTableHeader>
                  <AxTableHeader>Customer</AxTableHeader>
                  <AxTableHeader>Status</AxTableHeader>
                  <AxTableHeader>RMA Date</AxTableHeader>
                  <AxTableHeader>Received Date</AxTableHeader>
                  <AxTableHeader align="right">Total</AxTableHeader>
                  <AxTableHeader align="center">Items</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {filteredRMAs.map((rma) => (
                  <AxTableRow key={rma.id}>
                    <AxTableCell>{rma.rmaNumber || rma.id?.substring(0, 8) || 'N/A'}</AxTableCell>
                    <AxTableCell>{rma.orderNumber || 'N/A'}</AxTableCell>
                    <AxTableCell>{getCustomerName(rma)}</AxTableCell>
                    <AxTableCell>
                      <span 
                        style={{ 
                          color: getStatusColor(rma.status), 
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: getStatusBackgroundColor(rma.status),
                          display: 'inline-block',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        {getStatusLabel(rma.status)}
                      </span>
                    </AxTableCell>
                    <AxTableCell>{formatDate(rma.rmaDate)}</AxTableCell>
                    <AxTableCell>{formatDate(rma.receivedDate)}</AxTableCell>
                    <AxTableCell align="right">
                      ${rma.total?.toFixed(2) || '0.00'}
                    </AxTableCell>
                    <AxTableCell align="center">
                      {rma.items?.length || 0}
                    </AxTableCell>
                    <AxTableCell align="center">
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <AxButton 
                          variant="secondary" 
                          size="small"
                          onClick={() => handleView(rma)}
                          style={{ minWidth: '80px' }}
                        >
                          View
                        </AxButton>
                        <AxButton 
                          variant="secondary" 
                          size="small"
                          onClick={() => handleEdit(rma)}
                          disabled={rma.status === 'PROCESSED' || rma.status === 'CANCELLED'}
                          style={{ minWidth: '80px' }}
                        >
                          Edit
                        </AxButton>
                        {rma.id && onNavigateToShopFloorControl && (
                          <AxButton 
                            variant="primary" 
                            size="small"
                            onClick={() => onNavigateToShopFloorControl(rma.id!)}
                            style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                          >
                            Shop Floor
                          </AxButton>
                        )}
                        <AxButton 
                          variant="danger" 
                          size="small"
                          onClick={() => handleDeleteClick(rma)}
                          style={{ minWidth: '80px' }}
                        >
                          Delete
                        </AxButton>
                      </div>
                    </AxTableCell>
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          )}
        </div>
      </TableCard>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedRMA(null);
        }}
        title="Delete RMA"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedRMA(null);
              }}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </AxButton>
          </div>
        }
      >
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          Are you sure you want to delete this RMA?
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          This action cannot be undone.
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

