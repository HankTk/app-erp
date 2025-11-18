import { useState, useEffect } from 'react';
import { fetchOrders, Order } from '../../api/orderApi';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { AccountReceivableListingPageRender } from './AccountReceivableListingPage.render';

interface AccountReceivableListingPageProps {
  onViewInvoice?: (orderId: string) => void;
  onNavigateBack?: () => void;
}

export function AccountReceivableListingPage({ onViewInvoice, onNavigateBack }: AccountReceivableListingPageProps = {} as AccountReceivableListingPageProps) {
  const [invoices, setInvoices] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const allOrders = await fetchOrders();
      // Filter orders that have been invoiced (INVOICED or PAID status)
      const invoicedOrders = allOrders.filter(order => 
        order.status === 'INVOICED' || order.status === 'PAID'
      );
      setInvoices(invoicedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
      console.error('Error fetching invoices:', err);
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
    loadInvoices();
    loadCustomers();
  }, []);

  const filteredInvoices = statusFilter
    ? invoices.filter(invoice => invoice.status === statusFilter)
    : invoices;

  const getCustomerName = (customerId?: string) => {
    if (!customerId) return 'N/A';
    const customer = customers.find(c => c.id === customerId);
    return customer ? (customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email) : customerId;
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

  const calculateOutstandingAmount = (invoice: Order): number => {
    const total = invoice.total || 0;
    const paymentAmount = invoice.jsonData?.paymentAmount || 0;
    return total - paymentAmount;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'INVOICED':
        return '#8B5CF6'; // 紫 - 請求済み
      case 'PAID':
        return '#047857'; // 濃い緑 - 入金済み
      default:
        return '#6B7280'; // デフォルトはグレー
    }
  };

  const getStatusBackgroundColor = (status?: string) => {
    switch (status) {
      case 'INVOICED':
        return '#EDE9FE'; // 紫の背景
      case 'PAID':
        return '#D1FAE5'; // 緑の背景
      default:
        return '#F3F4F6'; // デフォルトはグレーの背景
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'INVOICED':
        return 'Invoiced';
      case 'PAID':
        return 'Paid';
      default:
        return status || 'N/A';
    }
  };

  return (
    <AccountReceivableListingPageRender
      invoices={invoices}
      loading={loading}
      error={error}
      statusFilter={statusFilter}
      filteredInvoices={filteredInvoices}
      onViewInvoice={onViewInvoice}
      onNavigateBack={onNavigateBack}
      onStatusFilterChange={setStatusFilter}
      getCustomerName={getCustomerName}
      formatDate={formatDate}
      calculateOutstandingAmount={calculateOutstandingAmount}
      getStatusColor={getStatusColor}
      getStatusBackgroundColor={getStatusBackgroundColor}
      getStatusLabel={getStatusLabel}
    />
  );
}

