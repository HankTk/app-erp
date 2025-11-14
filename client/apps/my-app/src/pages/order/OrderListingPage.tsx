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
  AxInput,
  AxLabel,
  AxFormGroup,
  AxListbox,
} from '@ui/components';
import { fetchOrders, updateOrder, deleteOrder, Order } from '../../api/orderApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import styled from 'styled-components';

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

type DialogMode = 'view' | 'edit' | null;

interface OrderListingPageProps {
  onNavigateToOrderEntry?: () => void;
  onEditOrder?: (orderId: string) => void;
  onNavigateBack?: () => void;
}

export function OrderListingPage({ onNavigateToOrderEntry, onEditOrder, onNavigateBack }: OrderListingPageProps = {} as OrderListingPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<Partial<Order>>({});
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
    setFormData(order);
    setSelectedOrder(order);
    setDialogMode('view');
  };

  const handleEdit = (order: Order) => {
    if (onEditOrder && order.id) {
      // Navigate to order entry page for editing
      onEditOrder(order.id);
    } else {
      // Fallback to dialog edit if no navigation handler
      setFormData(order);
      setSelectedOrder(order);
      setDialogMode('edit');
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

  const handleSave = async () => {
    if (!selectedOrder?.id) return;

    try {
      setSubmitting(true);
      await updateOrder(selectedOrder.id, formData);
      await loadOrders();
      setDialogMode(null);
      setFormData({});
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error saving order:', err);
      alert(err instanceof Error ? err.message : 'Failed to update order');
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
      <PageContainer>
        <HeaderCard padding="large">
          <HeaderSection>
            <HeaderLeft>
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
            <HeaderRight>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading orders...</AxParagraph>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <HeaderCard padding="large">
          <HeaderSection>
            <HeaderLeft>
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
            <HeaderRight>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large">
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
    <PageContainer>
      <HeaderCard padding="large">
        <HeaderSection>
          <HeaderLeft>
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
          <HeaderRight>
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

      <TableCard padding="large">
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No orders found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth>
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

      {/* View/Edit Order Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setFormData({});
          setSelectedOrder(null);
        }}
        title={dialogMode === 'view' ? 'View Order' : 'Edit Order'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDialogMode(null);
                setFormData({});
                setSelectedOrder(null);
              }}
              disabled={submitting}
            >
              {dialogMode === 'view' ? 'Close' : 'Cancel'}
            </AxButton>
            {dialogMode === 'edit' && (
              <AxButton 
                variant="primary" 
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Save'}
              </AxButton>
            )}
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)', maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <AxFormGroup>
              <AxLabel>Order Number</AxLabel>
              <AxInput
                type="text"
                value={formData.orderNumber || ''}
                onChange={(e) => {
                  setFormData({ ...formData, orderNumber: e.target.value });
                }}
                style={{ marginTop: 'var(--spacing-xs)' }}
                disabled={submitting || dialogMode === 'view'}
                fullWidth
              />
            </AxFormGroup>
            <AxFormGroup>
              <AxLabel>Status</AxLabel>
              <AxListbox
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'SHIPPING_INSTRUCTED', label: 'Shipping Instructed' },
                  { value: 'SHIPPED', label: 'Shipped' },
                  { value: 'INVOICED', label: 'Invoiced' },
                  { value: 'PAID', label: 'Paid' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
                value={formData.status || null}
                onChange={(value) => {
                  setFormData({ ...formData, status: value as Order['status'] });
                }}
                placeholder="Select status"
                fullWidth
                disabled={submitting || dialogMode === 'view'}
              />
            </AxFormGroup>
          </div>

          <AxFormGroup>
            <AxLabel>Customer</AxLabel>
            <AxInput
              type="text"
              value={getCustomerName(formData.customerId)}
              disabled
              style={{ marginTop: 'var(--spacing-xs)' }}
              fullWidth
            />
          </AxFormGroup>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <AxFormGroup>
              <AxLabel>Shipping Address</AxLabel>
              <AxInput
                type="text"
                value={formatAddress(formData.shippingAddressId)}
                disabled
                style={{ marginTop: 'var(--spacing-xs)' }}
                fullWidth
              />
            </AxFormGroup>
            <AxFormGroup>
              <AxLabel>Billing Address</AxLabel>
              <AxInput
                type="text"
                value={formatAddress(formData.billingAddressId)}
                disabled
                style={{ marginTop: 'var(--spacing-xs)' }}
                fullWidth
              />
            </AxFormGroup>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <AxFormGroup>
              <AxLabel>Order Date</AxLabel>
              <AxInput
                type="text"
                value={formatDate(formData.orderDate)}
                disabled
                style={{ marginTop: 'var(--spacing-xs)' }}
                fullWidth
              />
            </AxFormGroup>
            <AxFormGroup>
              <AxLabel>Ship Date</AxLabel>
              <AxInput
                type="date"
                value={formData.shipDate ? new Date(formData.shipDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  setFormData({ ...formData, shipDate: e.target.value ? new Date(e.target.value).toISOString() : undefined });
                }}
                style={{ marginTop: 'var(--spacing-xs)' }}
                disabled={submitting || dialogMode === 'view'}
                fullWidth
              />
            </AxFormGroup>
          </div>

          <div>
            <AxLabel style={{ marginBottom: 'var(--spacing-sm)' }}>Order Items</AxLabel>
            <div style={{ overflowX: 'auto' }}>
              <AxTable fullWidth>
                <AxTableHead>
                  <AxTableRow>
                    <AxTableHeader>Product</AxTableHeader>
                    <AxTableHeader align="right">Quantity</AxTableHeader>
                    <AxTableHeader align="right">Unit Price</AxTableHeader>
                    <AxTableHeader align="right">Line Total</AxTableHeader>
                  </AxTableRow>
                </AxTableHead>
                <AxTableBody>
                  {formData.items && formData.items.length > 0 ? (
                    formData.items.map((item) => (
                      <AxTableRow key={item.id}>
                        <AxTableCell>{item.productName || item.productCode || 'N/A'}</AxTableCell>
                        <AxTableCell align="right">{item.quantity || 0}</AxTableCell>
                        <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                        <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                      </AxTableRow>
                    ))
                  ) : (
                    <AxTableRow>
                      <AxTableCell colSpan={4} align="center">
                        <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                          No items
                        </AxParagraph>
                      </AxTableCell>
                    </AxTableRow>
                  )}
                </AxTableBody>
              </AxTable>
            </div>
          </div>

          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>Subtotal:</AxParagraph>
              <AxParagraph>${formData.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>Tax:</AxParagraph>
              <AxParagraph>${formData.tax?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>Shipping:</AxParagraph>
              <AxParagraph>${formData.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--spacing-sm)', borderTop: '2px solid var(--color-border-default)' }}>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>Total:</AxParagraph>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>${formData.total?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
          </div>

          <AxFormGroup>
            <AxLabel>Notes</AxLabel>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
              }}
              disabled={submitting || dialogMode === 'view'}
              placeholder="Order notes"
              style={{
                fontFamily: 'var(--font-family-base)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-normal)',
                lineHeight: 'var(--line-height-normal)',
                padding: 'var(--spacing-sm) calc(var(--spacing-sm) + 6px)',
                border: '2px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
                width: '100%',
                minHeight: '100px',
                resize: 'vertical',
                color: 'var(--color-text-primary)',
                backgroundColor: 'var(--color-background-default)',
                marginTop: 'var(--spacing-xs)',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--color-border-focus)';
                e.target.style.boxShadow = 'var(--shadow-focus-sm)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--color-border-default)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </AxFormGroup>
        </div>
      </AxDialog>

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

