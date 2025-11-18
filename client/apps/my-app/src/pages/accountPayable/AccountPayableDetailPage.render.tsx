import {
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
import { debugProps } from '../../utils/emotionCache';
import { Vendor } from '../../api/vendorApi';
import { PurchaseOrder } from '../../api/purchaseOrderApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  ContentCard,
  StepIndicator,
  Step,
  StepContent,
  ButtonGroup,
  InfoSection,
  InfoRow,
  ItemsTable,
} from './AccountPayableDetailPage.styles';

const COMPONENT_NAME = 'AccountPayableDetailPage';

type AccountPayableStep = 'invoice' | 'payment' | 'history';

interface HistoryRecord {
  step: string;
  status: string;
  timestamp: string;
  note?: string;
  data?: Record<string, any>;
}

interface AccountPayableDetailPageRenderProps {
  // State
  currentStep: AccountPayableStep;
  po: PurchaseOrder | null;
  loading: boolean;
  submitting: boolean;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: string;
  
  // Computed values
  selectedSupplier: Vendor | undefined;
  outstandingAmount: number;
  historyRecords: HistoryRecord[];
  
  // Handlers
  onNavigateBack?: () => void;
  onStepChange: (step: AccountPayableStep) => void;
  onPaymentAmountChange: (value: number) => void;
  onPaymentDateChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onPaymentSubmit: () => void;
  
  // Helpers
  formatDate: (dateString?: string) => string;
  formatDateTime: (dateString: string) => string;
  isStepCompleted: (step: AccountPayableStep) => boolean;
}

export function AccountPayableDetailPageRender(props: AccountPayableDetailPageRenderProps) {
  const {
    currentStep,
    po,
    loading,
    submitting,
    paymentAmount,
    paymentDate,
    paymentMethod,
    selectedSupplier,
    outstandingAmount,
    historyRecords,
    onNavigateBack,
    onStepChange,
    onPaymentAmountChange,
    onPaymentDateChange,
    onPaymentMethodChange,
    onPaymentSubmit,
    formatDate,
    formatDateTime,
    isStepCompleted,
  } = props;
  
  const { l10n } = useI18n();

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
                  {l10n('accountsPayable.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('module.accountsPayable')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('accountsPayable.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <AxParagraph>{l10n('accountsPayable.loading')}</AxParagraph>
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
                  {l10n('accountsPayable.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('module.accountsPayable')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('accountsPayable.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <AxParagraph>{l10n('accountsPayable.notFound')}</AxParagraph>
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
                {l10n('accountsPayable.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('module.accountsPayable')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('accountsPayable.subtitle')}
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
            onClick={() => onStepChange('invoice')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {l10n('accountsPayable.step.invoice')}
          </Step>
          <Step
            $active={currentStep === 'payment'}
            $completed={isStepCompleted('payment')}
            onClick={() => onStepChange('payment')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {l10n('accountsPayable.step.payment')}
          </Step>
          <Step
            $active={currentStep === 'history'}
            $completed={isStepCompleted('history')}
            onClick={() => onStepChange('history')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {l10n('accountsPayable.step.history')}
          </Step>
        </StepIndicator>

        <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
          {currentStep === 'invoice' && (
            <>
              <div>
                <AxHeading3>{l10n('accountsPayable.invoice.title')}</AxHeading3>
                <AxParagraph>{l10n('accountsPayable.invoice.description')}</AxParagraph>
              </div>
              <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
                <InfoRow>
                  <AxLabel>{l10n('accountsPayable.invoice.invoiceNumber')}</AxLabel>
                  <AxParagraph>{po.invoiceNumber || 'N/A'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{l10n('accountsPayable.invoice.orderNumber')}</AxLabel>
                  <AxParagraph>{po.orderNumber || po.id?.substring(0, 8) || 'N/A'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{l10n('accountsPayable.invoice.supplier')}</AxLabel>
                  <AxParagraph>
                    {selectedSupplier ? (selectedSupplier.companyName || `${selectedSupplier.lastName} ${selectedSupplier.firstName}` || selectedSupplier.email) : po.supplierId || 'N/A'}
                  </AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{l10n('accountsPayable.invoice.invoiceDate')}</AxLabel>
                  <AxParagraph>{formatDate(po.invoiceDate)}</AxParagraph>
                </InfoRow>
              </InfoSection>

              {po.items && po.items.length > 0 && (
                <div>
                  <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>{l10n('accountsPayable.invoice.items')}</AxHeading3>
                  <ItemsTable>
                    <AxTable fullWidth>
                      <AxTableHead>
                        <AxTableRow>
                          <AxTableHeader>{l10n('accountsPayable.invoice.product')}</AxTableHeader>
                          <AxTableHeader>{l10n('accountsPayable.invoice.quantity')}</AxTableHeader>
                          <AxTableHeader align="right">{l10n('accountsPayable.invoice.unitPrice')}</AxTableHeader>
                          <AxTableHeader align="right">{l10n('accountsPayable.invoice.lineTotal')}</AxTableHeader>
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
                  <AxLabel>{l10n('accountsPayable.invoice.subtotal')}</AxLabel>
                  <AxParagraph>${po.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{l10n('accountsPayable.invoice.tax')}</AxLabel>
                  <AxParagraph>${po.tax?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel>{l10n('accountsPayable.invoice.shipping')}</AxLabel>
                  <AxParagraph>${po.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxLabel style={{ fontWeight: 'var(--font-weight-bold)' }}>{l10n('accountsPayable.invoice.total')}</AxLabel>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>${po.total?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
              </InfoSection>
            </>
          )}

          {currentStep === 'payment' && (
            <>
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>
                  {l10n('accountsPayable.payment.title')}
                </AxHeading3>
                <AxParagraph style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                  {l10n('accountsPayable.payment.description')}
                </AxParagraph>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xsm)' }}>
                <AxFormGroup>
                  <AxLabel>{l10n('accountsPayable.payment.paymentAmount')}</AxLabel>
                  <AxInput
                    type="number"
                    value={paymentAmount || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPaymentAmountChange(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{ width: '220px' }}
                  />
                </AxFormGroup>

                <AxFormGroup>
                  <AxLabel>{l10n('accountsPayable.payment.paymentDate')}</AxLabel>
                  <AxInput
                    type="date"
                    value={paymentDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onPaymentDateChange(e.target.value)}
                  />
                </AxFormGroup>

                <AxFormGroup>
                  <AxLabel>{l10n('accountsPayable.payment.paymentMethod')}</AxLabel>
                  <AxListbox
                    value={paymentMethod}
                    onChange={onPaymentMethodChange}
                    options={[
                      { value: 'BANK_TRANSFER', label: l10n('accountsPayable.payment.method.bankTransfer') },
                      { value: 'CREDIT_CARD', label: l10n('accountsPayable.payment.method.creditCard') },
                      { value: 'CASH', label: l10n('accountsPayable.payment.method.cash') },
                      { value: 'CHECK', label: l10n('accountsPayable.payment.method.check') },
                      { value: 'OTHER', label: l10n('accountsPayable.payment.method.other') },
                    ]}
                    placeholder={l10n('accountsPayable.payment.paymentMethodPlaceholder')}
                    style={{ width: '220px' }}
                  />
                </AxFormGroup>

                <InfoSection>
                  <InfoRow>
                    <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {l10n('accountsPayable.payment.invoiceAmount')}
                    </AxParagraph>
                    <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
                      ${po.total?.toFixed(2) || '0.00'}
                    </AxParagraph>
                  </InfoRow>
                  {paymentAmount > 0 && (
                    <InfoRow>
                      <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {l10n('accountsPayable.payment.paidAmount')}
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
                      {l10n('accountsPayable.payment.outstanding')}
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
                  onClick={onPaymentSubmit} 
                  disabled={submitting || !paymentAmount || !paymentDate || !paymentMethod}
                >
                  {submitting ? l10n('accountsPayable.payment.processing') : l10n('accountsPayable.payment.record')}
                </AxButton>
              </ButtonGroup>
            </>
          )}

          {currentStep === 'history' && (
            <>
              <div>
                <AxHeading3>{l10n('accountsPayable.history.title')}</AxHeading3>
                <AxParagraph>{l10n('accountsPayable.history.description')}</AxParagraph>
              </div>
              {historyRecords.length === 0 ? (
                <AxParagraph>{l10n('accountsPayable.history.empty')}</AxParagraph>
              ) : (
                <ItemsTable>
                  <AxTable fullWidth>
                    <AxTableHead>
                      <AxTableRow>
                        <AxTableHeader>{l10n('accountsPayable.history.timestamp')}</AxTableHeader>
                        <AxTableHeader>{l10n('accountsPayable.history.step')}</AxTableHeader>
                        <AxTableHeader>{l10n('accountsPayable.history.status')}</AxTableHeader>
                        <AxTableHeader>{l10n('accountsPayable.history.note')}</AxTableHeader>
                      </AxTableRow>
                    </AxTableHead>
                    <AxTableBody>
                      {historyRecords.map((record, index) => (
                        <AxTableRow key={index}>
                          <AxTableCell>{formatDateTime(record.timestamp)}</AxTableCell>
                          <AxTableCell>
                            {record.step === 'invoicing' ? l10n('accountsPayable.history.step.invoicing') :
                             record.step === 'payment' ? l10n('accountsPayable.history.step.payment') :
                             record.step === 'status_change' ? l10n('accountsPayable.history.step.statusChange') :
                             record.step}
                          </AxTableCell>
                          <AxTableCell>
                            {record.status === 'INVOICED' ? l10n('accountsPayable.history.status.invoiced') :
                             record.status === 'PAID' ? l10n('accountsPayable.history.status.paid') :
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

