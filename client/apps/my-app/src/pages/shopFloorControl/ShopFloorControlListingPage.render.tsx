import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxTable,
  AxListbox,
  AxFormGroup,
  AxLabel,
  ColumnDefinition,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { SFC } from '../../api/sfcApi';
import { RMA } from '../../api/rmaApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
  StatusBadge,
} from './ShopFloorControlListingPage.styles';

const COMPONENT_NAME = 'ShopFloorControlListingPage';

type SFCListingRenderContext = {
  getCustomerName: (customerId?: string) => string;
  onProcessRMA?: (rmaId: string) => void;
  onProcess: (sfc: SFC) => void;
};

type RMAListingRenderContext = {
  getCustomerName: (customerId?: string) => string;
  processing: string | null;
  onCreateSFC: (rma: RMA) => void;
};

const createSFCColumns = (): ColumnDefinition<SFC, SFCListingRenderContext>[] => [
  { 
    key: 'sfc.sfcNumber',
    header: 'SFC Number',
    align: undefined,
    render: (sfc: SFC) => <strong>{sfc.sfcNumber || sfc.id}</strong>
  },
  { 
    key: 'sfc.rmaNumber',
    header: 'RMA Number',
    align: undefined,
    render: (sfc: SFC) => sfc.rmaNumber || 'N/A'
  },
  { 
    key: 'sfc.customer',
    header: 'Customer',
    align: undefined,
    render: (sfc: SFC, context) => sfc.customerName || context?.getCustomerName(sfc.customerId) || 'N/A'
  },
  { 
    key: 'sfc.orderNumber',
    header: 'Order Number',
    align: undefined,
    render: (sfc: SFC) => sfc.orderNumber || 'N/A'
  },
  { 
    key: 'sfc.createdDate',
    header: 'Created Date',
    align: undefined,
    render: (sfc: SFC) => sfc.createdDate ? new Date(sfc.createdDate).toLocaleDateString() : 'N/A'
  },
  { 
    key: 'sfc.status',
    header: 'Status',
    align: undefined,
    render: (sfc: SFC) => (
      <StatusBadge status={sfc.status || 'PENDING'}>
        {sfc.status || 'PENDING'}
      </StatusBadge>
    )
  },
  { 
    key: 'sfc.actions',
    header: 'Actions',
    align: 'center',
    render: (sfc: SFC, context) => {
      if (sfc.id && context?.onProcessRMA && sfc.rmaId) {
        return (
          <AxButton 
            variant="primary" 
            size="small"
            onClick={() => context.onProcess!(sfc)}
            style={{ minWidth: 'auto' }}
          >
            Process
          </AxButton>
        );
      }
      return null;
    }
  },
];

const createRMAColumns = (): ColumnDefinition<RMA, RMAListingRenderContext>[] => [
  { 
    key: 'rma.rmaNumber',
    header: 'RMA Number',
    align: undefined,
    render: (rma: RMA) => <strong>{rma.rmaNumber || rma.id}</strong>
  },
  { 
    key: 'rma.customer',
    header: 'Customer',
    align: undefined,
    render: (rma: RMA, context) => context?.getCustomerName(rma.customerId) || 'N/A'
  },
  { 
    key: 'rma.orderNumber',
    header: 'Order Number',
    align: undefined,
    render: (rma: RMA) => rma.orderNumber || 'N/A'
  },
  { 
    key: 'rma.rmaDate',
    header: 'RMA Date',
    align: undefined,
    render: (rma: RMA) => rma.rmaDate ? new Date(rma.rmaDate).toLocaleDateString() : 'N/A'
  },
  { 
    key: 'rma.status',
    header: 'Status',
    align: undefined,
    render: (rma: RMA) => (
      <StatusBadge status={rma.status || 'DRAFT'}>
        {rma.status || 'DRAFT'}
      </StatusBadge>
    )
  },
  { 
    key: 'rma.actions',
    header: 'Actions',
    align: 'center',
    render: (rma: RMA, context) => {
      if (rma.id) {
        return (
          <AxButton 
            variant="primary" 
            size="small"
            onClick={() => context?.onCreateSFC(rma)}
            disabled={context?.processing === rma.id}
            style={{ minWidth: 'auto' }}
          >
            {context?.processing === rma.id ? 'Creating...' : 'Create SFC'}
          </AxButton>
        );
      }
      return null;
    }
  },
];

interface ShopFloorControlListingPageRenderProps {
  sfcs: SFC[];
  rmasNeedingSFC: RMA[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  processing: string | null;
  onProcessRMA?: (rmaId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  onProcess: (sfc: SFC) => void;
  onCreateSFC: (rma: RMA) => void;
  onRetry: () => void;
  getCustomerName: (customerId?: string) => string;
}

export function ShopFloorControlListingPageRender(props: ShopFloorControlListingPageRenderProps) {
  const {
    sfcs,
    rmasNeedingSFC,
    loading,
    error,
    statusFilter,
    processing,
    onProcessRMA,
    onNavigateBack,
    onStatusFilterChange,
    onProcess,
    onCreateSFC,
    onRetry,
    getCustomerName,
  } = props;

  const sfcColumns = createSFCColumns();
  const rmaColumns = createRMAColumns();
  const sfcTableContext: SFCListingRenderContext = {
    getCustomerName,
    onProcessRMA,
    onProcess,
  };
  const rmaTableContext: RMAListingRenderContext = {
    getCustomerName,
    processing,
    onCreateSFC,
  };

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
                onChange={(value) => onStatusFilterChange(value)}
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
            <AxButton variant="secondary" onClick={onRetry} style={{ marginTop: 'var(--spacing-md)' }}>
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
                <AxTable
                  fullWidth
                  stickyHeader
                  data={sfcs}
                  columns={sfcColumns}
                  context={sfcTableContext}
                  getRowKey={(sfc) => sfc.id || ''}
                />
              </div>
            )}
            
            {rmasNeedingSFC.length > 0 && (
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)' }}>
                  RMAs Ready for SFC Creation
                </AxHeading3>
                <AxTable
                  fullWidth
                  stickyHeader
                  data={rmasNeedingSFC}
                  columns={rmaColumns}
                  context={rmaTableContext}
                  getRowKey={(rma) => rma.id || ''}
                />
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

