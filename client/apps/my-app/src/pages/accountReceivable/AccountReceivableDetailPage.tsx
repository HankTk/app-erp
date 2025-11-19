import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchAddressesByCustomerId, Address } from '../../api/addressApi';
import { fetchOrderById, updateOrder, Order } from '../../api/orderApi';
import { AccountReceivableDetailPageRender } from './AccountReceivableDetailPage.render';

type AccountReceivableStep = 'invoice' | 'payment' | 'history';

interface AccountReceivableDetailPageProps {
  invoiceId?: string | null;
  onNavigateBack?: () => void;
}

interface HistoryRecord {
  step: string;
  status: string;
  timestamp: string;
  note?: string;
  data?: Record<string, any>;
}

export function AccountReceivableDetailPage(props: AccountReceivableDetailPageProps = {}) {
  const { invoiceId, onNavigateBack } = props;
  const { l10n } = useI18n();
  const [currentStep, setCurrentStep] = useState<AccountReceivableStep>('invoice');
  const [order, setOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  useEffect(() => {
    const loadData = async () => {
      if (!invoiceId) return;
      try {
        setLoading(true);
        const orderData = await fetchOrderById(invoiceId);
        setOrder(orderData);
        
        // Load customers
        const customersData = await fetchCustomers();
        setCustomers(customersData);
        
        // Load addresses if customer exists
        if (orderData.customerId) {
          const addressesData = await fetchAddressesByCustomerId(orderData.customerId);
          setAddresses(addressesData);
        }
        
        // Load payment data from jsonData
        if (orderData.jsonData) {
          setPaymentAmount(orderData.jsonData.paymentAmount || 0);
          setPaymentDate(orderData.jsonData.paymentDate || '');
          setPaymentMethod(orderData.jsonData.paymentMethod || '');
        }
        
        // Set initial tab based on order status
        if (orderData.status === 'PAID' || (orderData.jsonData?.paymentAmount && orderData.jsonData.paymentAmount > 0)) {
          // If order is paid or has payment recorded, show history tab
          setCurrentStep('history');
        } else if (orderData.status === 'INVOICED') {
          // If order is invoiced but not paid, show payment tab
          setCurrentStep('payment');
        } else {
          // Default to invoice tab
          setCurrentStep('invoice');
        }
      } catch (err) {
        // Set order to null so the "not found" UI is shown
        setOrder(null);
        // Only log non-404 errors to console (404 is expected when order doesn't exist)
        if (err instanceof Error) {
          const is404 = err.message.includes('404') || err.message.includes('HTTP 404');
          if (!is404) {
            console.error('Error loading invoice:', err);
            alert('Failed to load invoice: ' + err.message);
          }
        } else {
          console.error('Error loading invoice:', err);
          alert('Failed to load invoice');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [invoiceId]);

  const handlePayment = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      const jsonData = order.jsonData || {};
      jsonData.paymentAmount = paymentAmount;
      jsonData.paymentDate = paymentDate;
      jsonData.paymentMethod = paymentMethod;
      const updated = await updateOrder(order.id!, {
        ...order,
        status: paymentAmount >= (order.total || 0) ? 'PAID' : 'INVOICED',
        jsonData,
      });
      setOrder(updated);
      
      // Add history record for Account Receivable
      const history = jsonData.history || [];
      const newRecord: HistoryRecord = {
        step: 'payment',
        status: paymentAmount >= (order.total || 0) ? 'PAID' : 'INVOICED',
        timestamp: new Date().toISOString(),
        note: `Payment recorded: $${paymentAmount.toFixed(2)}`,
        data: {
          paymentAmount,
          paymentDate,
          paymentMethod,
        },
      };
      jsonData.history = [...history, newRecord];
      await updateOrder(order.id!, {
        ...updated,
        jsonData,
      });
      
      alert('Payment recorded successfully!');
      setCurrentStep('history');
    } catch (err) {
      console.error('Error recording payment:', err);
      alert('Failed to record payment');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === order?.customerId);
  const outstandingAmount = (order?.total || 0) - paymentAmount;

  const getHistoryRecords = (): HistoryRecord[] => {
    if (!order?.jsonData?.history) {
      return [];
    }
    const allHistory = order.jsonData.history as HistoryRecord[];
    // Filter to only show Account Receivable relevant history:
    // - invoicing: invoice creation
    // - payment: payment records
    // - status_change: only if related to INVOICED or PAID status
    return allHistory.filter(record => {
      if (record.step === 'invoicing' || record.step === 'payment') {
        return true;
      }
      if (record.step === 'status_change' && record.data) {
        const newStatus = record.data.newStatus;
        return newStatus === 'INVOICED' || newStatus === 'PAID';
      }
      return false;
    });
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

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const isStepCompleted = (step: AccountReceivableStep): boolean => {
    if (!order) return false;
    switch (step) {
      case 'invoice':
        return !!order.invoiceNumber;
      case 'payment':
        return order.status === 'PAID' || paymentAmount > 0;
      case 'history':
        return getHistoryRecords().length > 0;
      default:
        return false;
    }
  };

  const getStepLabel = (step: string): string => {
    const stepLabels: Record<string, string> = {
      'invoicing': l10n('accountsReceivable.history.step.invoicing'),
      'payment': l10n('accountsReceivable.history.step.payment'),
      'status_change': l10n('accountsReceivable.history.step.statusChange'),
    };
    return stepLabels[step] || step;
  };

  const getStatusLabel = (status?: string): string => {
    if (!status) return 'N/A';
    const statusMap: Record<string, string> = {
      'INVOICED': l10n('accountsReceivable.history.status.invoiced'),
      'PAID': l10n('accountsReceivable.history.status.paid'),
    };
    return statusMap[status] || status;
  };

  const getDataKeyLabel = (key: string): string => {
    const keyMap: Record<string, string> = {
      'invoiceNumber': l10n('accountsReceivable.history.data.invoiceNumber'),
      'invoiceDate': l10n('accountsReceivable.history.data.invoiceDate'),
      'paymentAmount': l10n('accountsReceivable.history.data.paymentAmount'),
      'paymentDate': l10n('accountsReceivable.history.data.paymentDate'),
      'paymentMethod': l10n('accountsReceivable.history.data.paymentMethod'),
      'oldStatus': l10n('accountsReceivable.history.data.oldStatus'),
      'newStatus': l10n('accountsReceivable.history.data.newStatus'),
    };
    return keyMap[key] || key;
  };

  const formatDataValue = (key: string, value: any): string => {
    if (key === 'oldStatus' || key === 'newStatus') {
      return getStatusLabel(String(value));
    }
    if (key === 'paymentMethod') {
      const methodMap: Record<string, string> = {
        'BANK_TRANSFER': l10n('accountsReceivable.payment.method.bankTransfer'),
        'CREDIT_CARD': l10n('accountsReceivable.payment.method.creditCard'),
        'CASH': l10n('accountsReceivable.payment.method.cash'),
        'CHECK': l10n('accountsReceivable.payment.method.check'),
        'OTHER': l10n('accountsReceivable.payment.method.other'),
      };
      return methodMap[String(value)] || String(value);
    }
    if (key === 'paymentAmount' && typeof value === 'number') {
      return `$${value.toFixed(2)}`;
    }
    if ((key === 'invoiceDate' || key === 'paymentDate') && value) {
      return formatDate(String(value));
    }
    return String(value);
  };

  const selectedCustomerName = selectedCustomer 
    ? (selectedCustomer.companyName || `${selectedCustomer.lastName} ${selectedCustomer.firstName}` || selectedCustomer.email)
    : 'N/A';

  return (
    <AccountReceivableDetailPageRender
      currentStep={currentStep}
      order={order}
      loading={loading}
      submitting={submitting}
      paymentAmount={paymentAmount}
      paymentDate={paymentDate}
      paymentMethod={paymentMethod}
      selectedCustomer={selectedCustomer}
      selectedCustomerName={selectedCustomerName || 'N/A'}
      outstandingAmount={outstandingAmount}
      historyRecords={getHistoryRecords()}
      onNavigateBack={onNavigateBack}
      onStepChange={setCurrentStep}
      onPaymentAmountChange={setPaymentAmount}
      onPaymentDateChange={setPaymentDate}
      onPaymentMethodChange={(value) => setPaymentMethod(Array.isArray(value) ? value[0] || '' : value)}
      onPaymentSubmit={handlePayment}
      formatDate={formatDate}
      formatDateTime={formatDateTime}
      isStepCompleted={isStepCompleted}
      getStepLabel={getStepLabel}
      getStatusLabel={getStatusLabel}
      getDataKeyLabel={getDataKeyLabel}
      formatDataValue={formatDataValue}
    />
  );
}

