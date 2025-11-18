import { useState, useEffect } from 'react';
import { fetchVendors, Vendor } from '../../api/vendorApi';
import { fetchPurchaseOrderById, updatePurchaseOrder, PurchaseOrder } from '../../api/purchaseOrderApi';
import { AccountPayableDetailPageRender } from './AccountPayableDetailPage.render';

type AccountPayableStep = 'invoice' | 'payment' | 'history';

interface HistoryRecord {
  step: string;
  status: string;
  timestamp: string;
  note?: string;
  data?: Record<string, any>;
}

interface AccountPayableDetailPageProps {
  invoiceId?: string | null;
  onNavigateBack?: () => void;
}

export function AccountPayableDetailPage(props: AccountPayableDetailPageProps = {}) {
  const { invoiceId, onNavigateBack } = props;
  
  // State
  const [currentStep, setCurrentStep] = useState<AccountPayableStep>('invoice');
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [suppliers, setSuppliers] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!invoiceId) return;
      try {
        setLoading(true);
        const poData = await fetchPurchaseOrderById(invoiceId);
        setPO(poData);
        
        // Load suppliers (vendors)
        const suppliersData = await fetchVendors();
        setSuppliers(suppliersData);
        
        // Load payment data from jsonData
        if (poData.jsonData) {
          setPaymentAmount(poData.jsonData.paymentAmount || 0);
          setPaymentDate(poData.jsonData.paymentDate || '');
          setPaymentMethod(poData.jsonData.paymentMethod || '');
        }
        
        // Set initial tab based on purchase order status
        if (poData.status === 'PAID' || (poData.jsonData?.paymentAmount && poData.jsonData.paymentAmount > 0)) {
          // If PO is paid or has payment recorded, show history tab
          setCurrentStep('history');
        } else if (poData.status === 'INVOICED') {
          // If PO is invoiced but not paid, show payment tab
          setCurrentStep('payment');
        } else {
          // Default to invoice tab
          setCurrentStep('invoice');
        }
      } catch (err) {
        console.error('Error loading invoice:', err);
        alert('Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [invoiceId]);

  // Handlers
  const handlePayment = async () => {
    if (!po) return;
    try {
      setSubmitting(true);
      const jsonData = po.jsonData || {};
      jsonData.paymentAmount = paymentAmount;
      jsonData.paymentDate = paymentDate;
      jsonData.paymentMethod = paymentMethod;
      const updated = await updatePurchaseOrder(po.id!, {
        ...po,
        status: paymentAmount >= (po.total || 0) ? 'PAID' : 'INVOICED',
        jsonData,
      });
      setPO(updated);
      
      // Add history record for Account Payable
      const history = jsonData.history || [];
      const newRecord: HistoryRecord = {
        step: 'payment',
        status: paymentAmount >= (po.total || 0) ? 'PAID' : 'INVOICED',
        timestamp: new Date().toISOString(),
        note: `Payment recorded: $${paymentAmount.toFixed(2)}`,
        data: {
          paymentAmount,
          paymentDate,
          paymentMethod,
        },
      };
      jsonData.history = [...history, newRecord];
      await updatePurchaseOrder(po.id!, {
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

  // Computed values
  const selectedSupplier = suppliers.find(s => s.id === po?.supplierId);
  const outstandingAmount = (po?.total || 0) - paymentAmount;

  // Helper functions
  const getHistoryRecords = (): HistoryRecord[] => {
    if (!po?.jsonData?.history) {
      return [];
    }
    const allHistory = po.jsonData.history as HistoryRecord[];
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

  const isStepCompleted = (step: AccountPayableStep): boolean => {
    if (!po) return false;
    switch (step) {
      case 'invoice':
        return !!po.invoiceNumber;
      case 'payment':
        return po.status === 'PAID' || paymentAmount > 0;
      case 'history':
        return getHistoryRecords().length > 0;
      default:
        return false;
    }
  };

  // Render component with all props
  return (
    <AccountPayableDetailPageRender
      currentStep={currentStep}
      po={po}
      loading={loading}
      submitting={submitting}
      paymentAmount={paymentAmount}
      paymentDate={paymentDate}
      paymentMethod={paymentMethod}
      selectedSupplier={selectedSupplier}
      outstandingAmount={outstandingAmount}
      historyRecords={getHistoryRecords()}
      onNavigateBack={onNavigateBack}
      onStepChange={setCurrentStep}
      onPaymentAmountChange={setPaymentAmount}
      onPaymentDateChange={setPaymentDate}
      onPaymentMethodChange={setPaymentMethod}
      onPaymentSubmit={handlePayment}
      formatDate={formatDate}
      formatDateTime={formatDateTime}
      isStepCompleted={isStepCompleted}
    />
  );
}
