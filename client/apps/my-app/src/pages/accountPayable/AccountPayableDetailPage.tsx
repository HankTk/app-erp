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
import { fetchVendors, Vendor } from '../../api/vendorApi';
import { fetchAddressesByVendorId, Address } from '../../api/addressApi';
import { fetchPurchaseOrderById, updatePurchaseOrder, PurchaseOrder } from '../../api/purchaseOrderApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'AccountPayableDetailPage';

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

const ItemsTable = styled.div`
  margin-top: var(--spacing-md);
  overflow-x: auto;
`;

type AccountPayableStep = 'invoice' | 'payment' | 'history';

interface AccountPayableDetailPageProps {
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

export function AccountPayableDetailPage(props: AccountPayableDetailPageProps = {}) {
  const { invoiceId, onNavigateBack } = props;
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState<AccountPayableStep>('invoice');
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [suppliers, setSuppliers] = useState<Vendor[]>([]);
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
        const poData = await fetchPurchaseOrderById(invoiceId);
        setPO(poData);
        
        // Load suppliers (vendors)
        const suppliersData = await fetchVendors();
        setSuppliers(suppliersData);
        
        // Load addresses if supplier exists
        if (poData.supplierId) {
          const addressesData = await fetchAddressesByVendorId(poData.supplierId);
          setAddresses(addressesData);
        }
        
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

  const selectedSupplier = suppliers.find(s => s.id === po?.supplierId);
  const shippingAddress = addresses.find(a => a.id === po?.shippingAddressId);
  const billingAddress = addresses.find(a => a.id === po?.billingAddressId);
  const outstandingAmount = (po?.total || 0) - paymentAmount;

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
                  {t('accountsPayable.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {t('module.accountsPayable')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {t('accountsPayable.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <AxParagraph>{t('accountsPayable.loading')}</AxParagraph>
        </ContentCard>
      </PageContainer>
    );
  }

  if (!po) {
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
                  {t('accountsPayable.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {t('module.accountsPayable')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {t('accountsPayable.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <AxParagraph>{t('accountsPayable.notFound')}</AxParagraph>
        </ContentCard>
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
                {t('accountsPayable.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {t('module.accountsPayable')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {t('accountsPayable.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
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
            {t('accountsPayable.step.invoice')}
          </Step>
          <Step
            $active={currentStep === 'payment'}
            $completed={isStepCompleted('payment')}
            onClick={() => setCurrentStep('payment')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {t('accountsPayable.step.payment')}
          </Step>
          <Step
            $active={currentStep === 'history'}
            $completed={isStepCompleted('history')}
            onClick={() => setCurrentStep('history')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {t('accountsPayable.step.history')}
          </Step>
        </StepIndicator>

        <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
          {currentStep === 'invoice' && (
            <>
              <div>
                <AxHeading3>{t('accountsPayable.invoice.title')}</AxHeading3>
                <AxParagraph>{t('accountsPayable.invoice.description')}</AxParagraph>
              </div>
              <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
                <InfoRow>
                  <AxLabel>{t('accountsPayable.invoice.invoiceNumber')}</AxLabel>
                  <AxParagraph>{po.invoiceNumber || 'N/A'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{t('accountsPayable.invoice.orderNumber')}</AxLabel>
                  <AxParagraph>{po.orderNumber || po.id?.substring(0, 8) || 'N/A'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{t('accountsPayable.invoice.supplier')}</AxLabel>
                  <AxParagraph>
                    {selectedSupplier ? (selectedSupplier.companyName || `${selectedSupplier.lastName} ${selectedSupplier.firstName}` || selectedSupplier.email) : po.supplierId || 'N/A'}
                  </AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{t('accountsPayable.invoice.invoiceDate')}</AxLabel>
                  <AxParagraph>{formatDate(po.invoiceDate)}</AxParagraph>
                </InfoRow>
              </InfoSection>

              {po.items && po.items.length > 0 && (
                <div>
                  <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>{t('accountsPayable.invoice.items')}</AxHeading3>
                  <ItemsTable>
                    <AxTable fullWidth>
                      <AxTableHead>
                        <AxTableRow>
                          <AxTableHeader>{t('accountsPayable.invoice.product')}</AxTableHeader>
                          <AxTableHeader>{t('accountsPayable.invoice.quantity')}</AxTableHeader>
                          <AxTableHeader align="right">{t('accountsPayable.invoice.unitPrice')}</AxTableHeader>
                          <AxTableHeader align="right">{t('accountsPayable.invoice.lineTotal')}</AxTableHeader>
                        </AxTableRow>
                      </AxTableHead>
                      <AxTableBody>
                        {po.items.map((item) => (
                          <AxTableRow key={item.id}>
                            <AxTableCell>{item.productName || item.productCode || item.productId || 'N/A'}</AxTableCell>
                            <AxTableCell>{item.quantity || 0}</AxTableCell>
                            <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                            <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                          </AxTableRow>
                        ))}
                      </AxTableBody>
                    </AxTable>
                  </ItemsTable>
                </div>
              )}

              <InfoSection>
                <InfoRow>
                  <AxLabel>{t('accountsPayable.invoice.subtotal')}</AxLabel>
                  <AxParagraph>${po.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{t('accountsPayable.invoice.tax')}</AxLabel>
                  <AxParagraph>${po.tax?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{t('accountsPayable.invoice.shipping')}</AxLabel>
                  <AxParagraph>${po.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel style={{ fontWeight: 'var(--font-weight-bold)' }}>{t('accountsPayable.invoice.total')}</AxLabel>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>${po.total?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
              </InfoSection>
            </>
          )}

          {currentStep === 'payment' && (
            <>
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>
                  {t('accountsPayable.payment.title')}
                </AxHeading3>
                <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
                  {t('accountsPayable.payment.description')}
                </AxParagraph>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xsm)' }}>
                <AxFormGroup>
                  <AxLabel>{t('accountsPayable.payment.paymentAmount')}</AxLabel>
                  <AxInput
                    type="number"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    fullWidth
                  />
                </AxFormGroup>

                <AxFormGroup>
                  <AxLabel>{t('accountsPayable.payment.paymentDate')}</AxLabel>
                  <AxInput
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    fullWidth
                  />
                </AxFormGroup>

                <AxFormGroup>
                  <AxLabel>{t('accountsPayable.payment.paymentMethod')}</AxLabel>
                  <AxListbox
                    value={paymentMethod}
                    onChange={(value) => setPaymentMethod(value)}
                    options={[
                      { value: 'BANK_TRANSFER', label: t('accountsPayable.payment.method.bankTransfer') },
                      { value: 'CREDIT_CARD', label: t('accountsPayable.payment.method.creditCard') },
                      { value: 'CASH', label: t('accountsPayable.payment.method.cash') },
                      { value: 'CHECK', label: t('accountsPayable.payment.method.check') },
                      { value: 'OTHER', label: t('accountsPayable.payment.method.other') },
                    ]}
                    placeholder={t('accountsPayable.payment.paymentMethodPlaceholder')}
                    fullWidth
                  />
                </AxFormGroup>

                <InfoSection>
                  <InfoRow>
                    <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {t('accountsPayable.payment.invoiceAmount')}
                    </AxParagraph>
                    <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
                      ${po.total?.toFixed(2) || '0.00'}
                    </AxParagraph>
                  </InfoRow>
                  {paymentAmount > 0 && (
                    <InfoRow>
                      <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {t('accountsPayable.payment.paidAmount')}
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
                      {t('accountsPayable.payment.outstanding')}
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

              <ButtonGroup>
                <div></div>
                <AxButton 
                  variant="primary" 
                  onClick={handlePayment} 
                  disabled={submitting || !paymentAmount || !paymentDate || !paymentMethod}
                >
                  {submitting ? t('accountsPayable.payment.processing') : t('accountsPayable.payment.record')}
                </AxButton>
              </ButtonGroup>
            </>
          )}

          {currentStep === 'history' && (
            <>
              <div>
                <AxHeading3>{t('accountsPayable.history.title')}</AxHeading3>
                <AxParagraph>{t('accountsPayable.history.description')}</AxParagraph>
              </div>
              {getHistoryRecords().length === 0 ? (
                <AxParagraph>{t('accountsPayable.history.empty')}</AxParagraph>
              ) : (
                <ItemsTable>
                  <AxTable fullWidth>
                    <AxTableHead>
                      <AxTableRow>
                        <AxTableHeader>{t('accountsPayable.history.timestamp')}</AxTableHeader>
                        <AxTableHeader>{t('accountsPayable.history.step')}</AxTableHeader>
                        <AxTableHeader>{t('accountsPayable.history.status')}</AxTableHeader>
                        <AxTableHeader>{t('accountsPayable.history.note')}</AxTableHeader>
                      </AxTableRow>
                    </AxTableHead>
                    <AxTableBody>
                      {getHistoryRecords().map((record, index) => (
                        <AxTableRow key={index}>
                          <AxTableCell>{formatDateTime(record.timestamp)}</AxTableCell>
                          <AxTableCell>
                            {record.step === 'invoicing' ? t('accountsPayable.history.step.invoicing') :
                             record.step === 'payment' ? t('accountsPayable.history.step.payment') :
                             record.step === 'status_change' ? t('accountsPayable.history.step.statusChange') :
                             record.step}
                          </AxTableCell>
                          <AxTableCell>
                            {record.status === 'INVOICED' ? t('accountsPayable.history.status.invoiced') :
                             record.status === 'PAID' ? t('accountsPayable.history.status.paid') :
                             record.status}
                          </AxTableCell>
                          <AxTableCell>{record.note || '-'}</AxTableCell>
                        </AxTableRow>
                      ))}
                    </AxTableBody>
                  </AxTable>
                </ItemsTable>
              )}
            </>
          )}
        </StepContent>
      </ContentCard>
    </PageContainer>
  );
}

