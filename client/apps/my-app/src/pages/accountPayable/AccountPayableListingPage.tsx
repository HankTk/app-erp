import { useState, useEffect } from 'react';
import { fetchPurchaseOrders, PurchaseOrder } from '../../api/purchaseOrderApi';
import { fetchVendors, Vendor } from '../../api/vendorApi';
import { AccountPayableListingPageRender } from './AccountPayableListingPage.render';

interface AccountPayableListingPageProps {
  onViewInvoice?: (prId: string) => void;
  onNavigateBack?: () => void;
}

export function AccountPayableListingPage({ onViewInvoice, onNavigateBack }: AccountPayableListingPageProps = {} as AccountPayableListingPageProps) {
  const [invoices, setInvoices] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPOs = await fetchPurchaseOrders();
      // Filter POs that have been invoiced (INVOICED or PAID status)
      const invoicedPOs = allPOs.filter(po => 
        po.status === 'INVOICED' || po.status === 'PAID'
      );
      setInvoices(invoicedPOs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices';
      setError(errorMessage);
      console.error('Error fetching invoices:', err);
      // If it's a 404, suggest restarting the server
      if (errorMessage.includes('404')) {
        console.warn('404 error detected. Please make sure the backend server is running and has been restarted after adding Purchase Order endpoints.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSuppliers = async () => {
    try {
      const suppliersData = await fetchVendors();
      setSuppliers(suppliersData);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      // Don't set error state here as it's not critical for the main functionality
    }
  };

  useEffect(() => {
    loadInvoices();
    loadSuppliers();
  }, []);

  const filteredInvoices = statusFilter
    ? invoices.filter(invoice => invoice.status === statusFilter)
    : invoices;

  const getSupplierName = (supplierId?: string): string => {
    if (!supplierId) return 'N/A';
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? (supplier.companyName || `${supplier.lastName} ${supplier.firstName}` || supplier.email || 'N/A') : (supplierId || 'N/A');
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

  const calculateOutstandingAmount = (invoice: PurchaseOrder): number => {
    const total = invoice.total || 0;
    const paidAmount = invoice.jsonData?.paymentAmount || 0;
    return Math.max(0, total - paidAmount);
  };

  return (
    <AccountPayableListingPageRender
      invoices={invoices}
      loading={loading}
      error={error}
      statusFilter={statusFilter}
      filteredInvoices={filteredInvoices}
      onViewInvoice={onViewInvoice}
      onNavigateBack={onNavigateBack}
      onStatusFilterChange={setStatusFilter}
      getSupplierName={getSupplierName}
      formatDate={formatDate}
      calculateOutstandingAmount={calculateOutstandingAmount}
    />
  );
}

