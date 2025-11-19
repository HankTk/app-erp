import {
  AxTable,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxFormGroup,
  AxListbox,
  ColumnDefinition,
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

type ListingRenderContext = {
  getCustomerName: (rma: RMA) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
  onViewRMA?: (rmaId: string) => void;
  onEditRMA?: (rmaId: string) => void;
  onDeleteClick: (rma: RMA) => void;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
};

const createColumns = (): ColumnDefinition<RMA, ListingRenderContext>[] => [
  { 
    key: 'rma.rmaNumber',
    header: 'RMA Number',
    align: undefined,
    render: (rma: RMA) => rma.rmaNumber || rma.id?.substring(0, 8) || 'N/A'
  },
  { 
    key: 'rma.orderNumber',
    header: 'Order Number',
    align: undefined,
    render: (rma: RMA) => rma.orderNumber || 'N/A'
  },
  { 
    key: 'rma.customer',
    header: 'Customer',
    align: undefined,
    render: (rma: RMA, context) => context?.getCustomerName(rma) || 'N/A'
  },
  { 
    key: 'rma.status',
    header: 'Status',
    align: undefined,
    render: (rma: RMA, context) => (
      <span 
        style={{ 
          color: context?.getStatusColor(rma.status) || 'var(--color-text-primary)', 
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: context?.getStatusBackgroundColor(rma.status) || 'transparent',
          display: 'inline-block',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {context?.getStatusLabel(rma.status) || rma.status || 'N/A'}
      </span>
    )
  },
  { 
    key: 'rma.rmaDate',
    header: 'RMA Date',
    align: undefined,
    render: (rma: RMA, context) => context?.formatDate(rma.rmaDate) || 'N/A'
  },
  { 
    key: 'rma.receivedDate',
    header: 'Received Date',
    align: undefined,
    render: (rma: RMA, context) => context?.formatDate(rma.receivedDate) || 'N/A'
  },
  { 
    key: 'rma.total',
    header: 'Total',
    align: 'right',
    render: (rma: RMA) => `$${(rma.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'rma.items',
    header: 'Items',
    align: 'center',
    render: (rma: RMA) => rma.items?.length || 0
  },
  { 
    key: 'rma.actions',
    header: 'Actions',
    align: 'center',
    render: (rma: RMA, context) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
        {context?.onViewRMA && (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onViewRMA!(rma.id!)}
            style={{ minWidth: '80px' }}
          >
            View
          </AxButton>
        )}
        {context?.onEditRMA && (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onEditRMA!(rma.id!)}
            disabled={rma.status === 'PROCESSED' || rma.status === 'CANCELLED'}
            style={{ minWidth: '80px' }}
          >
            Edit
          </AxButton>
        )}
        {rma.id && context?.onNavigateToShopFloorControl && (
          <AxButton 
            variant="primary" 
            size="small"
            onClick={() => context.onNavigateToShopFloorControl!(rma.id!)}
            style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            Shop Floor
          </AxButton>
        )}
        <AxButton 
          variant="danger" 
          size="small"
          onClick={() => context?.onDeleteClick(rma)}
          style={{ minWidth: '80px' }}
        >
          Delete
        </AxButton>
      </div>
    )
  },
];

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

  const columns = createColumns();
  const tableContext: ListingRenderContext = {
    getCustomerName,
    formatDate,
    getStatusColor,
    getStatusBackgroundColor,
    getStatusLabel,
    onViewRMA,
    onEditRMA,
    onDeleteClick,
    onNavigateToShopFloorControl,
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
            <AxTable
              fullWidth
              stickyHeader
              data={filteredRMAs}
              columns={columns}
              context={tableContext}
              getRowKey={(rma) => rma.id || ''}
            />
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

