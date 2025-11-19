import { useState, useEffect } from 'react';
import { fetchOrders, deleteOrder, Order } from '../../api/orderApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import { OrderListingPageRender } from './OrderListingPage.render';
import { useI18n } from '../../i18n/I18nProvider';


interface OrderListingPageProps {
  onNavigateToOrderEntry?: () => void;
  onEditOrder?: (orderId: string) => void;
  onViewOrder?: (orderId: string) => void;
  onNavigateBack?: () => void;
}

export function OrderListingPage({ onNavigateToOrderEntry, onEditOrder, onViewOrder, onNavigateBack }: OrderListingPageProps = {} as OrderListingPageProps) {
  const { l10n } = useI18n();
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
      setError(err instanceof Error ? err.message : l10n('order.error.loadFailed'));
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
      onViewOrder(order.id);
    }
  };

  const handleEdit = (order: Order) => {
    if (onEditOrder && order.id) {
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
      alert(err instanceof Error ? err.message : l10n('order.error.deleteFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedOrder(null);
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
        return l10n('order.status.draft');
      case 'PENDING_APPROVAL':
        return l10n('order.status.pendingApproval');
      case 'APPROVED':
        return l10n('order.status.approved');
      case 'SHIPPING_INSTRUCTED':
        return l10n('order.status.shippingInstructed');
      case 'SHIPPED':
        return l10n('order.status.shipped');
      case 'INVOICED':
        return l10n('order.status.invoiced');
      case 'PAID':
        return l10n('order.status.paid');
      case 'CANCELLED':
        return l10n('order.status.cancelled');
      case 'PENDING':
        return l10n('order.status.pending');
      default:
        return status || 'N/A';
    }
  };

  return (
    <OrderListingPageRender
      orders={orders}
      loading={loading}
      error={error}
      statusFilter={statusFilter}
      filteredOrders={filteredOrders}
      deleteDialogOpen={deleteDialogOpen}
      submitting={submitting}
      selectedOrder={selectedOrder}
      onNavigateToOrderEntry={onNavigateToOrderEntry}
      onEditOrder={onEditOrder}
      onViewOrder={onViewOrder}
      onNavigateBack={onNavigateBack}
      onStatusFilterChange={setStatusFilter}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={handleDeleteCancel}
      getCustomerName={getCustomerName}
      formatDate={formatDate}
      getStatusColor={getStatusColor}
      getStatusBackgroundColor={getStatusBackgroundColor}
      getStatusLabel={getStatusLabel}
    />
  );
}

