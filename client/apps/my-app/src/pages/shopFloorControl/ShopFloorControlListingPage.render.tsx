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
                              onClick={() => onProcess(sfc)}
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
                              onClick={() => onCreateSFC(rma)}
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

