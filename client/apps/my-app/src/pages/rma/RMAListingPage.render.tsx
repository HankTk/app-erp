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
import { debugProps } from '../../utils/emotionCache';
import { RMA } from '../../api/rmaApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './RMAListingPage.styles';

const COMPONENT_NAME = 'RMAListingPage';

interface RMAListingPageRenderProps {
  rmas: RMA[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredRMAs: RMA[];
  deleteDialogOpen: boolean;
  submitting: boolean;
  selectedRMA: RMA | null;
  onNavigateToRMAEntry?: () => void;
  onEditRMA?: (rmaId: string) => void;
  onViewRMA?: (rmaId: string) => void;
  onNavigateBack?: () => void;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onDeleteClick: (rma: RMA) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  getCustomerName: (rma: RMA) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
}

export function RMAListingPageRender(props: RMAListingPageRenderProps) {
  const {
    rmas,
    loading,
    error,
    statusFilter,
    filteredRMAs,
    deleteDialogOpen,
    submitting,
    selectedRMA,
    onNavigateToRMAEntry,
    onEditRMA,
    onViewRMA,
    onNavigateBack,
    onNavigateToShopFloorControl,
    onStatusFilterChange,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteCancel,
    getCustomerName,
    formatDate,
    getStatusColor,
    getStatusBackgroundColor,
    getStatusLabel,
  } = props;

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
                onChange={(value) => onStatusFilterChange(value)}
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
                        {onViewRMA && (
                          <AxButton 
                            variant="secondary" 
                            size="small"
                            onClick={() => onViewRMA(rma.id!)}
                            style={{ minWidth: '80px' }}
                          >
                            View
                          </AxButton>
                        )}
                        {onEditRMA && (
                          <AxButton 
                            variant="secondary" 
                            size="small"
                            onClick={() => onEditRMA(rma.id!)}
                            disabled={rma.status === 'PROCESSED' || rma.status === 'CANCELLED'}
                            style={{ minWidth: '80px' }}
                          >
                            Edit
                          </AxButton>
                        )}
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
                          onClick={() => onDeleteClick(rma)}
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
        onClose={onDeleteCancel}
        title="Delete RMA"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={onDeleteConfirm}
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

