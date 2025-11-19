import { useState, useEffect } from 'react';
import { fetchOrders } from '../../api/orderApi';
import { fetchPurchaseOrders } from '../../api/purchaseOrderApi';
import { fetchCustomers } from '../../api/customerApi';
import { fetchVendors } from '../../api/vendorApi';
import { fetchProducts } from '../../api/productApi';
import { useI18n } from '../../i18n/I18nProvider';
import { GeneralLedgerListingPageRender } from './GeneralLedgerListingPage.render';

interface GLEntry {
  id: string;
  date: string;
  type: 'REVENUE' | 'COST' | 'PAYMENT' | 'EXPENSE' | 'ACCOUNTS_PAYABLE';
  orderId?: string;
  orderNumber?: string;
  poId?: string;
  poNumber?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  description: string;
  quantity: number;
  amount: number;
  cost?: number;
  status: string;
}

interface GeneralLedgerListingPageProps {
  onViewEntry?: (orderId: string) => void;
  onNavigateBack?: () => void;
}

export function GeneralLedgerListingPage({ onViewEntry, onNavigateBack }: GeneralLedgerListingPageProps = {} as GeneralLedgerListingPageProps) {
  const [glEntries, setGlEntries] = useState<GLEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ordersData, purchaseOrdersData, customersData, vendorsData, productsData] = await Promise.all([
        fetchOrders(),
        fetchPurchaseOrders(),
        fetchCustomers(),
        fetchVendors(),
        fetchProducts(),
      ]);
      
      // Generate GL entries from orders
      const entries: GLEntry[] = [];
      
      // Process orders that have been shipped or invoiced
      const processedOrders = ordersData.filter(order => 
        order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID'
      );
      
      processedOrders.forEach(order => {
        const customer = customersData.find(c => c.id === order.customerId);
        const customerName = customer 
          ? (customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email)
          : l10n('generalLedger.unknown');
        
        const shipDate = order.shipDate || order.invoiceDate || order.orderDate;
        const invoiceDate = order.invoiceDate || order.orderDate;
        
        // Calculate total quantity
        const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        
        // Calculate product cost using actual product cost from products data
        const productCost = order.items?.reduce((sum, item) => {
          const product = productsData.find(p => p.id === item.productId);
          const itemCost = product?.cost || (item.unitPrice || 0) * 0.7; // Use product cost, fallback to 70% of unit price
          return sum + (itemCost * (item.quantity || 0));
        }, 0) || 0;
        
        // REVENUE entry - when order is shipped/invoiced
        if (order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID') {
          entries.push({
            id: `${order.id}-revenue`,
            date: shipDate || invoiceDate || order.orderDate || '',
            type: 'REVENUE',
            orderId: order.id || '',
            orderNumber: order.orderNumber || '',
            invoiceNumber: order.invoiceNumber,
            customerId: order.customerId || '',
            customerName,
            description: order.invoiceNumber 
              ? l10n('generalLedger.description.revenueWithInvoice', { orderNumber: order.orderNumber || '', invoiceNumber: order.invoiceNumber })
              : l10n('generalLedger.description.revenue', { orderNumber: order.orderNumber || '' }),
            quantity: totalQuantity,
            amount: order.total || 0,
            status: order.status,
          });
        }
        
        // COST entry - product cost and shipping cost
        if (order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID') {
          const shippingCost = order.shippingCost || 0;
          const totalCost = productCost + shippingCost;
          
          if (totalCost > 0) {
            entries.push({
              id: `${order.id}-cost`,
              date: shipDate || invoiceDate || order.orderDate || '',
              type: 'COST',
              orderId: order.id || '',
              orderNumber: order.orderNumber || '',
              invoiceNumber: order.invoiceNumber,
              customerId: order.customerId || '',
              customerName,
              description: (order.invoiceNumber 
                ? l10n('generalLedger.description.costWithInvoice', { orderNumber: order.orderNumber || '', invoiceNumber: order.invoiceNumber })
                : l10n('generalLedger.description.cost', { orderNumber: order.orderNumber || '' })) 
                + l10n('generalLedger.description.costDetails', { productCost: productCost.toFixed(2), shippingCost: shippingCost.toFixed(2) }),
              quantity: totalQuantity,
              amount: totalCost,
              cost: totalCost,
              status: order.status,
            });
          }
        }
        
        // PAYMENT entry - when payment is received
        if (order.status === 'PAID' && order.jsonData?.paymentAmount) {
          const paymentAmount = order.jsonData.paymentAmount || 0;
          const paymentDate = order.jsonData.paymentDate || order.orderDate || '';
          
          if (paymentAmount > 0) {
            entries.push({
              id: `${order.id}-payment`,
              date: paymentDate,
              type: 'PAYMENT',
              orderId: order.id || '',
              orderNumber: order.orderNumber || '',
              invoiceNumber: order.invoiceNumber,
              customerId: order.customerId || '',
              customerName,
              description: order.invoiceNumber 
                ? l10n('generalLedger.description.paymentWithInvoice', { orderNumber: order.orderNumber || '', invoiceNumber: order.invoiceNumber })
                : l10n('generalLedger.description.payment', { orderNumber: order.orderNumber || '' }),
              quantity: 0,
              amount: paymentAmount,
              status: 'PAID',
            });
          }
        }
      });
      
      // Process Purchase Orders that have been received, invoiced, or paid
      const processedPOs = purchaseOrdersData.filter(po => 
        po.status === 'RECEIVED' || po.status === 'INVOICED' || po.status === 'PAID'
      );
      
      processedPOs.forEach(po => {
        const vendor = vendorsData.find(v => v.id === po.supplierId);
        const supplierName = vendor 
          ? (vendor.companyName || `${vendor.lastName} ${vendor.firstName}` || vendor.email)
          : l10n('generalLedger.unknown');
        
        // Handle receivedDate - it might be stored as a string in jsonData
        let receivedDate: string | null = null;
        if (po.jsonData?.receivedDate) {
          try {
            const receivedDateValue = po.jsonData.receivedDate;
            if (typeof receivedDateValue === 'string') {
              // If it's already a date string (YYYY-MM-DD), use it directly
              if (receivedDateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                receivedDate = receivedDateValue;
              } else {
                // Otherwise, try to parse it
                receivedDate = new Date(receivedDateValue).toISOString().split('T')[0];
              }
            }
          } catch (e) {
            console.warn('Error parsing receivedDate:', e);
          }
        }
        
        // Convert invoiceDate and orderDate to string format if they're LocalDateTime objects
        const invoiceDateStr = po.invoiceDate 
          ? (typeof po.invoiceDate === 'string' ? po.invoiceDate : new Date(po.invoiceDate).toISOString().split('T')[0])
          : null;
        const orderDateStr = po.orderDate 
          ? (typeof po.orderDate === 'string' ? po.orderDate : new Date(po.orderDate).toISOString().split('T')[0])
          : '';
        
        const transactionDate = receivedDate || invoiceDateStr || orderDateStr;
        
        // Calculate total quantity
        const totalQuantity = po.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        
        // Calculate product cost using actual product cost from products data
        const productCost = po.items?.reduce((sum, item) => {
          const product = productsData.find(p => p.id === item.productId);
          const itemCost = product?.cost || (item.unitPrice || 0) * 0.7; // Use product cost, fallback to 70% of unit price
          return sum + (itemCost * (item.quantity || 0));
        }, 0) || 0;
        
        // EXPENSE entry - when PO is received/invoiced/paid (inventory increase, accounts payable)
        if (po.status === 'RECEIVED' || po.status === 'INVOICED' || po.status === 'PAID') {
          const shippingCost = po.shippingCost || 0;
          const totalCost = productCost + shippingCost;
          
          if (totalCost > 0) {
            entries.push({
              id: `${po.id}-expense`,
              date: transactionDate || '',
              type: 'EXPENSE',
              poId: po.id || '',
              poNumber: po.orderNumber || '',
              invoiceNumber: po.invoiceNumber,
              supplierId: po.supplierId || '',
              supplierName,
              description: (po.invoiceNumber 
                ? l10n('generalLedger.description.expenseWithInvoice', { poNumber: po.orderNumber || '', invoiceNumber: po.invoiceNumber })
                : l10n('generalLedger.description.expense', { poNumber: po.orderNumber || '' })) 
                + l10n('generalLedger.description.expenseDetails', { productCost: productCost.toFixed(2), shippingCost: shippingCost.toFixed(2) }),
              quantity: totalQuantity,
              amount: totalCost,
              cost: totalCost,
              status: po.status,
            });
          }
        }
        
        // ACCOUNTS_PAYABLE entry - when invoice is received
        if (po.status === 'INVOICED' || po.status === 'PAID') {
          entries.push({
            id: `${po.id}-ap`,
            date: invoiceDateStr || orderDateStr || '',
            type: 'ACCOUNTS_PAYABLE',
            poId: po.id || '',
            poNumber: po.orderNumber || '',
            invoiceNumber: po.invoiceNumber,
            supplierId: po.supplierId || '',
            supplierName,
            description: po.invoiceNumber 
              ? l10n('generalLedger.description.apWithInvoice', { poNumber: po.orderNumber || '', invoiceNumber: po.invoiceNumber })
              : l10n('generalLedger.description.ap', { poNumber: po.orderNumber || '' }),
            quantity: totalQuantity,
            amount: po.total || 0,
            status: po.status,
          });
        }
        
        // PAYMENT entry - when payment is made
        if (po.status === 'PAID' && po.jsonData?.paymentAmount) {
          const paymentAmount = po.jsonData.paymentAmount || 0;
          let paymentDate: string = '';
          if (po.jsonData.paymentDate) {
            const paymentDateValue = po.jsonData.paymentDate;
            if (typeof paymentDateValue === 'string') {
              if (paymentDateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
                paymentDate = paymentDateValue;
              } else {
                paymentDate = new Date(paymentDateValue).toISOString().split('T')[0];
              }
            }
          }
          if (!paymentDate) {
            paymentDate = orderDateStr;
          }
          
          if (paymentAmount > 0) {
            entries.push({
              id: `${po.id}-payment`,
              date: paymentDate,
              type: 'PAYMENT',
              poId: po.id || '',
              poNumber: po.orderNumber || '',
              invoiceNumber: po.invoiceNumber,
              supplierId: po.supplierId || '',
              supplierName,
              description: po.invoiceNumber 
                ? l10n('generalLedger.description.poPaymentWithInvoice', { poNumber: po.orderNumber || '', invoiceNumber: po.invoiceNumber })
                : l10n('generalLedger.description.poPayment', { poNumber: po.orderNumber || '' }),
              quantity: 0,
              amount: paymentAmount,
              status: 'PAID',
            });
          }
        }
      });
      
      // Sort by date (newest first)
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setGlEntries(entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : l10n('generalLedger.errorLoadFailed'));
      console.error('Error fetching GL entries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEntries = glEntries.filter(entry => {
    if (typeFilter && entry.type !== typeFilter) return false;
    if (dateFrom && entry.date < dateFrom) return false;
    if (dateTo && entry.date > dateTo) return false;
    return true;
  });

  const { l10n } = useI18n();

  const formatDate = (dateString: string) => {
    if (!dateString) return l10n('generalLedger.notAvailable');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'REVENUE':
        return '#047857'; // Green
      case 'COST':
        return '#DC2626'; // Red
      case 'PAYMENT':
        return '#2563EB'; // Blue
      case 'EXPENSE':
        return '#DC2626'; // Red (same as COST)
      case 'ACCOUNTS_PAYABLE':
        return '#F59E0B'; // Orange
      default:
        return '#6B7280';
    }
  };

  const getTypeBackgroundColor = (type: string) => {
    switch (type) {
      case 'REVENUE':
        return '#D1FAE5';
      case 'COST':
        return '#FEE2E2';
      case 'PAYMENT':
        return '#DBEAFE';
      case 'EXPENSE':
        return '#FEE2E2'; // Same as COST
      case 'ACCOUNTS_PAYABLE':
        return '#FEF3C7'; // Light orange
      default:
        return '#F3F4F6';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'REVENUE':
        return l10n('generalLedger.type.revenue');
      case 'COST':
        return l10n('generalLedger.type.cost');
      case 'PAYMENT':
        return l10n('generalLedger.type.payment');
      case 'EXPENSE':
        return l10n('generalLedger.type.expense');
      case 'ACCOUNTS_PAYABLE':
        return l10n('generalLedger.type.ap');
      default:
        return type;
    }
  };

  // Calculate totals
  const totalDebit = filteredEntries
    .filter(e => e.type === 'COST' || e.type === 'EXPENSE' || e.type === 'ACCOUNTS_PAYABLE')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCredit = filteredEntries
    .filter(e => e.type === 'REVENUE' || e.type === 'PAYMENT')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalRevenue = filteredEntries
    .filter(e => e.type === 'REVENUE')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCost = filteredEntries
    .filter(e => e.type === 'COST')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = filteredEntries
    .filter(e => e.type === 'EXPENSE')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalAccountsPayable = filteredEntries
    .filter(e => e.type === 'ACCOUNTS_PAYABLE')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalPayment = filteredEntries
    .filter(e => e.type === 'PAYMENT')
    .reduce((sum, e) => sum + e.amount, 0);
  const netIncome = totalRevenue - totalCost - totalExpense;

  return (
    <GeneralLedgerListingPageRender
      glEntries={glEntries}
      loading={loading}
      error={error}
      typeFilter={typeFilter}
      dateFrom={dateFrom}
      dateTo={dateTo}
      filteredEntries={filteredEntries}
      onViewEntry={onViewEntry}
      onNavigateBack={onNavigateBack}
      onTypeFilterChange={setTypeFilter}
      onDateFromChange={setDateFrom}
      onDateToChange={setDateTo}
      formatDate={formatDate}
      getTypeColor={getTypeColor}
      getTypeBackgroundColor={getTypeBackgroundColor}
      getTypeLabel={getTypeLabel}
      totalDebit={totalDebit}
      totalCredit={totalCredit}
      totalRevenue={totalRevenue}
      totalCost={totalCost}
      totalExpense={totalExpense}
      totalAccountsPayable={totalAccountsPayable}
      totalPayment={totalPayment}
      netIncome={netIncome}
    />
  );
}

