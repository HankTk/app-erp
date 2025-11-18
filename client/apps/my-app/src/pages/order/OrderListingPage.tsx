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
import { fetchOrders, deleteOrder, Order } from '../../api/orderApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'OrderListingPage';

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


interface OrderListingPageProps {
  onNavigateToOrderEntry?: () => void;
  onEditOrder?: (orderId: string) => void;
  onViewOrder?: (orderId: string) => void;
  onNavigateBack?: () => void;
}

export function OrderListingPage({ onNavigateToOrderEntry, onEditOrder, onViewOrder, onNavigateBack }: OrderListingPageProps = {} as OrderListingPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const ordersData = await fetchOrders();
      setOrders(ordersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
      console.error('Error fetching orders:', err);
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

  const loadAddresses = async () => {
    try {
      const addressesData = await fetchAddresses();
      setAddresses(addressesData);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadAddresses();
  }, []);

  const filteredOrders = statusFilter
    ? orders.filter(order => order.status === statusFilter)
    : orders;

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'N/A';
    const customer = customers.find(c => c.id === customerId);
    return customer ? (customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email) : customerId;
  };

  const formatAddress = (addressId?: string) => {
    if (!addressId) return 'N/A';
    const address = addresses.find(a => a.id === addressId);
    if (!address) return addressId;
    const parts = [
      address.streetAddress1,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);
    return parts.join(', ') || addressId;
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

  const handleView = (order: Order) => {
    if (onViewOrder && order.id) {
      // Navigate to order entry page in read-only mode
      onViewOrder(order.id);
    }
  };

  const handleEdit = (order: Order) => {
    if (onEditOrder && order.id) {
      // Navigate to order entry page for editing
      onEditOrder(order.id);
    }
  };

  const handleDeleteClick = (order: Order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrder?.id) return;

    try {
      setSubmitting(true);
      await deleteOrder(selectedOrder.id);
      await loadOrders();
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error deleting order:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setSubmitting(false);
    }
  };



  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return '#6B7280'; // グレー - 下書き
      case 'PENDING_APPROVAL':
        return '#F59E0B'; // オレンジ - 承認待ち
      case 'APPROVED':
        return '#3B82F6'; // 青 - 承認済み
      case 'SHIPPING_INSTRUCTED':
        return '#10B981'; // 緑 - 出荷指示済み
      case 'SHIPPED':
        return '#059669'; // 濃い緑 - 出荷済み
      case 'INVOICED':
        return '#8B5CF6'; // 紫 - 請求済み
      case 'PAID':
        return '#047857'; // 濃い緑 - 入金済み
      case 'CANCELLED':
        return '#EF4444'; // 赤 - キャンセル
      case 'PENDING': // 後方互換性のため
        return '#F59E0B';
      default:
        return '#6B7280'; // デフォルトはグレー
    }
  };

  const getStatusBackgroundColor = (status?: string) => {
    switch (status) {
      case 'DRAFT':
        return '#F3F4F6'; // グレーの背景
      case 'PENDING_APPROVAL':
        return '#FEF3C7'; // オレンジの背景
      case 'APPROVED':
        return '#DBEAFE'; // 青の背景
      case 'SHIPPING_INSTRUCTED':
        return '#D1FAE5'; // 緑の背景
      case 'SHIPPED':
        return '#D1FAE5'; // 緑の背景
      case 'INVOICED':
        return '#EDE9FE'; // 紫の背景
      case 'PAID':
        return '#D1FAE5'; // 緑の背景
      case 'CANCELLED':
        return '#FEE2E2'; // 赤の背景
      case 'PENDING':
        return '#FEF3C7'; // オレンジの背景
      default:
        return '#F3F4F6'; // デフォルトはグレーの背景
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
      case 'SHIPPING_INSTRUCTED':
        return 'Shipping Instructed';
      case 'SHIPPED':
        return 'Shipped';
      case 'INVOICED':
        return 'Invoiced';
      case 'PAID':
        return 'Paid';
      case 'CANCELLED':
        return 'Cancelled';
      case 'PENDING':
        return 'Pending';
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
                onChange={(value) => setStatusFilter(value)}
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
                        <AxButton 
                          variant="secondary" 
                          size="small"
                          onClick={() => handleView(order)}
                          style={{ minWidth: '80px' }}
                        >
                          View
                        </AxButton>
                        <AxButton 
                          variant="secondary" 
                          size="small"
                          onClick={() => handleEdit(order)}
                          disabled={order.status === 'PAID' || order.status === 'CANCELLED'}
                          style={{ minWidth: '80px' }}
                        >
                          Edit
                        </AxButton>
                        <AxButton 
                          variant="danger" 
                          size="small"
                          onClick={() => handleDeleteClick(order)}
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
          setSelectedOrder(null);
        }}
        title="Delete Order"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedOrder(null);
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
          Are you sure you want to delete this order?
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          This action cannot be undone.
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

