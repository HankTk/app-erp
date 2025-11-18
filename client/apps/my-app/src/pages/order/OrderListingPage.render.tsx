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
import { Order } from '../../api/orderApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './OrderListingPage.styles';

const COMPONENT_NAME = 'OrderListingPage';

interface OrderListingPageRenderProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredOrders: Order[];
  deleteDialogOpen: boolean;
  submitting: boolean;
  selectedOrder: Order | null;
  onNavigateToOrderEntry?: () => void;
  onEditOrder?: (orderId: string) => void;
  onViewOrder?: (orderId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  onDeleteClick: (order: Order) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  getCustomerName: (customerId?: string) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
}

export function OrderListingPageRender(props: OrderListingPageRenderProps) {
  const {
    orders,
    loading,
    error,
    statusFilter,
    filteredOrders,
    deleteDialogOpen,
    submitting,
    selectedOrder,
    onNavigateToOrderEntry,
    onEditOrder,
    onViewOrder,
    onNavigateBack,
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
                  Orders
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  View and manage all orders
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading orders...</AxParagraph>
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
                  Orders
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  View and manage all orders
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
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
                Orders
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                View and manage all orders
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
                  { value: 'SHIPPING_INSTRUCTED', label: 'Shipping Instructed' },
                  { value: 'SHIPPED', label: 'Shipped' },
                  { value: 'INVOICED', label: 'Invoiced' },
                  { value: 'PAID', label: 'Paid' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
                value={statusFilter}
                onChange={(value) => onStatusFilterChange(value)}
                placeholder="Filter by status"
              />
            </AxFormGroup>
            {onNavigateToOrderEntry && (
              <AxButton variant="primary" onClick={onNavigateToOrderEntry}>
                Create Order
              </AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No orders found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth stickyHeader>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Order Number</AxTableHeader>
                  <AxTableHeader>Customer</AxTableHeader>
                  <AxTableHeader>Status</AxTableHeader>
                  <AxTableHeader>Order Date</AxTableHeader>
                  <AxTableHeader>Ship Date</AxTableHeader>
                  <AxTableHeader align="right">Total</AxTableHeader>
                  <AxTableHeader align="center">Items</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {filteredOrders.map((order) => (
                  <AxTableRow key={order.id}>
                    <AxTableCell>{order.orderNumber || order.id?.substring(0, 8) || 'N/A'}</AxTableCell>
                    <AxTableCell>{getCustomerName(order.customerId)}</AxTableCell>
                    <AxTableCell>
                      <span 
                        style={{ 
                          color: getStatusColor(order.status), 
                          fontWeight: 600,
                          padding: '4px 12px',
                          borderRadius: '12px',
                          backgroundColor: getStatusBackgroundColor(order.status),
                          display: 'inline-block',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </AxTableCell>
                    <AxTableCell>{formatDate(order.orderDate)}</AxTableCell>
                    <AxTableCell>{formatDate(order.shipDate)}</AxTableCell>
                    <AxTableCell align="right">
                      ${order.total?.toFixed(2) || '0.00'}
                    </AxTableCell>
                    <AxTableCell align="center">
                      {order.items?.length || 0}
                    </AxTableCell>
                    <AxTableCell align="center">
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                        {onViewOrder && (
                          <AxButton 
                            variant="secondary" 
                            size="small"
                            onClick={() => onViewOrder(order.id!)}
                            style={{ minWidth: '80px' }}
                          >
                            View
                          </AxButton>
                        )}
                        {onEditOrder && (
                          <AxButton 
                            variant="secondary" 
                            size="small"
                            onClick={() => onEditOrder(order.id!)}
                            disabled={order.status === 'PAID' || order.status === 'CANCELLED'}
                            style={{ minWidth: '80px' }}
                          >
                            Edit
                          </AxButton>
                        )}
                        <AxButton 
                          variant="danger" 
                          size="small"
                          onClick={() => onDeleteClick(order)}
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
        title="Delete Order"
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
          Are you sure you want to delete this order?
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          This action cannot be undone.
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

