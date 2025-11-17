import { useState, useEffect } from 'react';
import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxListbox,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchAddressesByCustomerId, Address } from '../../api/addressApi';
import { fetchOrderById, updateOrder, Order } from '../../api/orderApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'AccountReceivableDetailPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1;
`;

const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const ContentCard = styled(AxCard)`
  display: flex;
  flex-direction: column;
  overflow: visible;
  flex-shrink: 0;
`;

const StepIndicator = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border-default);
  flex-shrink: 0;
  align-items: center;
  width: 100%;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  flex: none;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  border-radius: var(--radius-md);
  white-space: nowrap;
  font-size: var(--font-size-sm);
  background-color: ${props => 
    props.$active ? 'var(--color-primary)' : 
    props.$completed ? 'var(--color-success)' : 
    'var(--color-background-secondary)'};
  color: ${props => 
    props.$active || props.$completed ? 'var(--color-text-inverse)' : 
    'var(--color-text-secondary)'};
  font-weight: ${props => props.$active ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)'};
  cursor: pointer;
  transition: all var(--transition-base);
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  overflow: visible;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemsTable = styled(AxTable)`
  margin-top: var(--spacing-md);
`;

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
  const { t } = useI18n();
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
        console.error('Error loading invoice:', err);
        alert('Failed to load invoice');
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
  const shippingAddress = addresses.find(a => a.id === order?.shippingAddressId);
  const billingAddress = addresses.find(a => a.id === order?.billingAddressId);
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

  const renderInvoiceStep = () => {
    if (!order) return null;
    
    return (
      <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>
          {t('accountsReceivable.invoice.title')}
        </AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('accountsReceivable.invoice.description')}
        </AxParagraph>

        <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {t('accountsReceivable.invoice.invoiceNumber')}
            </AxParagraph>
            <AxParagraph>{order.invoiceNumber || 'N/A'}</AxParagraph>
          </InfoRow>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {t('accountsReceivable.invoice.invoiceDate')}
            </AxParagraph>
            <AxParagraph>{formatDate(order.invoiceDate)}</AxParagraph>
          </InfoRow>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {t('accountsReceivable.invoice.orderNumber')}
            </AxParagraph>
            <AxParagraph>{order.orderNumber || 'N/A'}</AxParagraph>
          </InfoRow>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {t('accountsReceivable.invoice.customer')}
            </AxParagraph>
            <AxParagraph>
              {selectedCustomer ? (selectedCustomer.companyName || `${selectedCustomer.lastName} ${selectedCustomer.firstName}` || selectedCustomer.email) : 'N/A'}
            </AxParagraph>
          </InfoRow>
        </InfoSection>

        {order.items && order.items.length > 0 && (
          <ItemsTable fullWidth>
            <AxTableHead>
              <AxTableRow>
                <AxTableHeader>Product</AxTableHeader>
                <AxTableHeader align="right">Quantity</AxTableHeader>
                <AxTableHeader align="right">Unit Price</AxTableHeader>
                <AxTableHeader align="right">Total</AxTableHeader>
              </AxTableRow>
            </AxTableHead>
            <AxTableBody>
              {order.items.map((item, index) => (
                <AxTableRow key={index}>
                  <AxTableCell>{item.productName || item.productCode || 'N/A'}</AxTableCell>
                  <AxTableCell align="right">{item.quantity || 0}</AxTableCell>
                  <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                  <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                </AxTableRow>
              ))}
            </AxTableBody>
          </ItemsTable>
        )}

        <InfoSection>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {t('accountsReceivable.invoice.subtotal')}
            </AxParagraph>
            <AxParagraph>${order.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
          </InfoRow>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {t('accountsReceivable.invoice.tax')}
            </AxParagraph>
            <AxParagraph>${order.tax?.toFixed(2) || '0.00'}</AxParagraph>
          </InfoRow>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {t('accountsReceivable.invoice.shipping')}
            </AxParagraph>
            <AxParagraph>${order.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
          </InfoRow>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
              {t('accountsReceivable.invoice.total')}
            </AxParagraph>
            <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
              ${order.total?.toFixed(2) || '0.00'}
            </AxParagraph>
          </InfoRow>
        </InfoSection>
      </StepContent>
    );
  };

  const renderPaymentStep = () => {
    if (!order) return null;
    
    return (
      <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>
          {t('accountsReceivable.payment.title')}
        </AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('accountsReceivable.payment.description')}
        </AxParagraph>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xsm)' }}>
          <AxFormGroup>
            <AxLabel>{t('accountsReceivable.payment.paymentAmount')}</AxLabel>
            <AxInput
              type="number"
              value={paymentAmount || ''}
              onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              fullWidth
            />
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('accountsReceivable.payment.paymentDate')}</AxLabel>
            <AxInput
              type="date"
              value={paymentDate}
              onChange={e => setPaymentDate(e.target.value)}
              fullWidth
            />
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('accountsReceivable.payment.paymentMethod')}</AxLabel>
            <AxListbox
              options={[
                { value: 'BANK_TRANSFER', label: t('accountsReceivable.payment.method.bankTransfer') },
                { value: 'CREDIT_CARD', label: t('accountsReceivable.payment.method.creditCard') },
                { value: 'CASH', label: t('accountsReceivable.payment.method.cash') },
                { value: 'CHECK', label: t('accountsReceivable.payment.method.check') },
                { value: 'OTHER', label: t('accountsReceivable.payment.method.other') },
              ]}
              value={paymentMethod}
              onChange={setPaymentMethod}
              placeholder={t('accountsReceivable.payment.paymentMethodPlaceholder')}
              fullWidth
            />
          </AxFormGroup>

          <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
            <InfoRow>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {t('accountsReceivable.payment.invoiceAmount')}
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
                ${order.total?.toFixed(2) || '0.00'}
              </AxParagraph>
            </InfoRow>
            {paymentAmount > 0 && (
              <InfoRow>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {t('accountsReceivable.payment.paidAmount')}
                </AxParagraph>
                <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
                  ${paymentAmount.toFixed(2)}
                </AxParagraph>
              </InfoRow>
            )}
            <InfoRow>
              <AxParagraph style={{ 
                fontWeight: 'var(--font-weight-bold)',
                color: outstandingAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)'
              }}>
                {t('accountsReceivable.payment.outstanding')}
              </AxParagraph>
              <AxParagraph style={{ 
                fontSize: 'var(--font-size-lg)',
                fontWeight: 'var(--font-weight-bold)',
                color: outstandingAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)'
              }}>
                ${outstandingAmount.toFixed(2)}
              </AxParagraph>
            </InfoRow>
          </InfoSection>
        </div>

        <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
          <AxButton
            variant="secondary"
            onClick={() => setCurrentStep('invoice')}
          >
            {t('accountsReceivable.previous')}
          </AxButton>
          <AxButton
            variant="primary"
            onClick={handlePayment}
            disabled={submitting || !paymentAmount || !paymentDate || !paymentMethod}
          >
            {submitting ? t('accountsReceivable.payment.processing') : t('accountsReceivable.payment.record')}
          </AxButton>
        </ButtonGroup>
      </StepContent>
    );
  };

  const getStepLabel = (step: string): string => {
    const stepLabels: Record<string, string> = {
      'invoicing': t('accountsReceivable.history.step.invoicing'),
      'payment': t('accountsReceivable.history.step.payment'),
      'status_change': t('accountsReceivable.history.step.statusChange'),
    };
    return stepLabels[step] || step;
  };

  const getStatusLabel = (status?: string): string => {
    if (!status) return 'N/A';
    const statusMap: Record<string, string> = {
      'INVOICED': t('accountsReceivable.history.status.invoiced'),
      'PAID': t('accountsReceivable.history.status.paid'),
    };
    return statusMap[status] || status;
  };

  const getDataKeyLabel = (key: string): string => {
    const keyMap: Record<string, string> = {
      'invoiceNumber': t('accountsReceivable.history.data.invoiceNumber'),
      'invoiceDate': t('accountsReceivable.history.data.invoiceDate'),
      'paymentAmount': t('accountsReceivable.history.data.paymentAmount'),
      'paymentDate': t('accountsReceivable.history.data.paymentDate'),
      'paymentMethod': t('accountsReceivable.history.data.paymentMethod'),
      'oldStatus': t('accountsReceivable.history.data.oldStatus'),
      'newStatus': t('accountsReceivable.history.data.newStatus'),
    };
    return keyMap[key] || key;
  };

  const formatDataValue = (key: string, value: any): string => {
    if (key === 'oldStatus' || key === 'newStatus') {
      return getStatusLabel(String(value));
    }
    if (key === 'paymentMethod') {
      const methodMap: Record<string, string> = {
        'BANK_TRANSFER': t('accountsReceivable.payment.method.bankTransfer'),
        'CREDIT_CARD': t('accountsReceivable.payment.method.creditCard'),
        'CASH': t('accountsReceivable.payment.method.cash'),
        'CHECK': t('accountsReceivable.payment.method.check'),
        'OTHER': t('accountsReceivable.payment.method.other'),
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

  const renderHistoryStep = () => {
    const historyRecords = getHistoryRecords();
    
    return (
      <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>
          {t('accountsReceivable.history.title')}
        </AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('accountsReceivable.history.description')}
        </AxParagraph>

        {historyRecords.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{t('accountsReceivable.history.empty')}</AxParagraph>
          </div>
        ) : (
          <div style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto', overflowX: 'hidden' }}>
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Date / Time</AxTableHeader>
                  <AxTableHeader>Step</AxTableHeader>
                  <AxTableHeader>Status</AxTableHeader>
                  <AxTableHeader>Notes</AxTableHeader>
                  <AxTableHeader>Data</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {historyRecords.map((record, index) => (
                  <AxTableRow key={index}>
                    <AxTableCell>{formatDateTime(record.timestamp)}</AxTableCell>
                    <AxTableCell>{getStepLabel(record.step)}</AxTableCell>
                    <AxTableCell>{getStatusLabel(record.status)}</AxTableCell>
                    <AxTableCell>{record.note || 'N/A'}</AxTableCell>
                    <AxTableCell>
                      {record.data && Object.keys(record.data).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                          {Object.entries(record.data).map(([key, value]) => (
                            <div key={key} style={{ fontSize: 'var(--font-size-sm)' }}>
                              <strong>{getDataKeyLabel(key)}:</strong> {formatDataValue(key, value)}
                            </div>
                          ))}
                        </div>
                      ) : 'N/A'}
                    </AxTableCell>
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          </div>
        )}

        <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
          <AxButton
            variant="secondary"
            onClick={() => setCurrentStep('payment')}
          >
            {t('accountsReceivable.previous')}
          </AxButton>
        </ButtonGroup>
      </StepContent>
    );
  };

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 'var(--spacing-md)' }}>
            <AxParagraph>Loading invoice...</AxParagraph>
          </div>
        </ContentCard>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 'var(--spacing-md)' }}>
            <AxParagraph>Invoice not found</AxParagraph>
            {onNavigateBack && (
              <AxButton variant="secondary" onClick={onNavigateBack}>
                {t('accountsReceivable.back')}
              </AxButton>
            )}
          </div>
        </ContentCard>
      </PageContainer>
    );
  }

  const selectedCustomerName = selectedCustomer 
    ? (selectedCustomer.companyName || `${selectedCustomer.lastName} ${selectedCustomer.firstName}` || selectedCustomer.email)
    : 'N/A';

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
                {t('accountsReceivable.back')}
              </AxButton>
            )}
            <div style={{ flex: 1 }}>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {t('module.accountsReceivable')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {t('accountsReceivable.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {order.invoiceNumber && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                }}>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    {t('accountsReceivable.invoice.invoiceNumber')}
                  </AxParagraph>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {order.invoiceNumber}
                  </AxParagraph>
                </div>
              )}
              <div style={{ 
                padding: 'var(--spacing-md)', 
                backgroundColor: 'var(--color-background-secondary)', 
                borderRadius: 'var(--radius-md)',
              }}>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {t('accountsReceivable.customer')}
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {selectedCustomerName}
                </AxParagraph>
              </div>
              <div style={{ 
                padding: 'var(--spacing-md)', 
                backgroundColor: 'var(--color-background-secondary)', 
                borderRadius: 'var(--radius-md)',
              }}>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {t('accountsReceivable.total')}
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  ${order.total?.toFixed(2) || '0.00'}
                </AxParagraph>
              </div>
              <div style={{ 
                padding: 'var(--spacing-md)', 
                backgroundColor: 'var(--color-background-secondary)', 
                borderRadius: 'var(--radius-md)',
              }}>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {t('accountsReceivable.outstanding')}
                </AxParagraph>
                <AxParagraph style={{ 
                  fontWeight: 'var(--font-weight-bold)',
                  color: outstandingAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)'
                }}>
                  ${outstandingAmount.toFixed(2)}
                </AxParagraph>
              </div>
            </div>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
        <StepIndicator {...debugProps(COMPONENT_NAME, 'StepIndicator')}>
          <Step
            $active={currentStep === 'invoice'}
            $completed={isStepCompleted('invoice')}
            onClick={() => setCurrentStep('invoice')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {t('accountsReceivable.step.invoice')}
          </Step>
          <Step
            $active={currentStep === 'payment'}
            $completed={isStepCompleted('payment')}
            onClick={() => setCurrentStep('payment')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {t('accountsReceivable.step.payment')}
          </Step>
          <Step
            $active={currentStep === 'history'}
            $completed={isStepCompleted('history')}
            onClick={() => setCurrentStep('history')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {t('accountsReceivable.step.history')}
          </Step>
        </StepIndicator>

        {currentStep === 'invoice' && renderInvoiceStep()}
        {currentStep === 'payment' && renderPaymentStep()}
        {currentStep === 'history' && renderHistoryStep()}
      </ContentCard>
    </PageContainer>
  );
}

