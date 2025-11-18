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
import { debugProps } from '../../utils/emotionCache';
import { Customer } from '../../api/customerApi';
import { Order } from '../../api/orderApi';
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
} from './AccountReceivableDetailPage.styles';

const COMPONENT_NAME = 'AccountReceivableDetailPage';

type AccountReceivableStep = 'invoice' | 'payment' | 'history';

interface HistoryRecord {
  step: string;
  status: string;
  timestamp: string;
  note?: string;
  data?: Record<string, any>;
}

interface AccountReceivableDetailPageRenderProps {
  // State
  currentStep: AccountReceivableStep;
  order: Order | null;
  loading: boolean;
  submitting: boolean;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: string;
  
  // Computed values
  selectedCustomer: Customer | undefined;
  selectedCustomerName: string;
  outstandingAmount: number;
  historyRecords: HistoryRecord[];
  
  // Handlers
  onNavigateBack?: () => void;
  onStepChange: (step: AccountReceivableStep) => void;
  onPaymentAmountChange: (value: number) => void;
  onPaymentDateChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onPaymentSubmit: () => void;
  
  // Helpers
  formatDate: (dateString?: string) => string;
  formatDateTime: (dateString: string) => string;
  isStepCompleted: (step: AccountReceivableStep) => boolean;
  getStepLabel: (step: string) => string;
  getStatusLabel: (status?: string) => string;
  getDataKeyLabel: (key: string) => string;
  formatDataValue: (key: string, value: any) => string;
}

export function AccountReceivableDetailPageRender(props: AccountReceivableDetailPageRenderProps) {
  const {
    currentStep,
    order,
    loading,
    submitting,
    paymentAmount,
    paymentDate,
    paymentMethod,
    selectedCustomer,
    selectedCustomerName,
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
    getStepLabel,
    getStatusLabel,
    getDataKeyLabel,
    formatDataValue,
  } = props;
  
  const { l10n } = useI18n();

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
                {l10n('accountsReceivable.back')}
              </AxButton>
            )}
          </div>
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
                {l10n('accountsReceivable.back')}
              </AxButton>
            )}
            <div style={{ flex: 1 }}>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('module.accountsReceivable')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('accountsReceivable.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {order.invoiceNumber && (
                <div style={{ 
                  padding: 'var(--spacing-sm)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                }}>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    {l10n('accountsReceivable.invoice.invoiceNumber')}
                  </AxParagraph>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {order.invoiceNumber}
                  </AxParagraph>
                </div>
              )}
              <div style={{ 
                padding: 'var(--spacing-sm)', 
                backgroundColor: 'var(--color-background-secondary)', 
                borderRadius: 'var(--radius-md)',
              }}>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('accountsReceivable.customer')}
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  {selectedCustomerName}
                </AxParagraph>
              </div>
              <div style={{ 
                padding: 'var(--spacing-sm)', 
                backgroundColor: 'var(--color-background-secondary)', 
                borderRadius: 'var(--radius-md)',
              }}>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('accountsReceivable.total')}
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                  ${order.total?.toFixed(2) || '0.00'}
                </AxParagraph>
              </div>
              <div style={{ 
                padding: 'var(--spacing-sm)', 
                backgroundColor: 'var(--color-background-secondary)', 
                borderRadius: 'var(--radius-md)',
              }}>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('accountsReceivable.outstanding')}
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
            onClick={() => onStepChange('invoice')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {l10n('accountsReceivable.step.invoice')}
          </Step>
          <Step
            $active={currentStep === 'payment'}
            $completed={isStepCompleted('payment')}
            onClick={() => onStepChange('payment')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {l10n('accountsReceivable.step.payment')}
          </Step>
          <Step
            $active={currentStep === 'history'}
            $completed={isStepCompleted('history')}
            onClick={() => onStepChange('history')}
            {...debugProps(COMPONENT_NAME, 'Step')}
          >
            {l10n('accountsReceivable.step.history')}
          </Step>
        </StepIndicator>

        <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
          {currentStep === 'invoice' && (
            <>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>
                {l10n('accountsReceivable.invoice.title')}
              </AxHeading3>
              <AxParagraph style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                {l10n('accountsReceivable.invoice.description')}
              </AxParagraph>

              <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
                <InfoRow>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {l10n('accountsReceivable.invoice.invoiceNumber')}
                  </AxParagraph>
                  <AxParagraph>{order.invoiceNumber || 'N/A'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {l10n('accountsReceivable.invoice.invoiceDate')}
                  </AxParagraph>
                  <AxParagraph>{formatDate(order.invoiceDate)}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {l10n('accountsReceivable.invoice.orderNumber')}
                  </AxParagraph>
                  <AxParagraph>{order.orderNumber || 'N/A'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {l10n('accountsReceivable.invoice.customer')}
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
                    {l10n('accountsReceivable.invoice.subtotal')}
                  </AxParagraph>
                  <AxParagraph>${order.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {l10n('accountsReceivable.invoice.tax')}
                  </AxParagraph>
                  <AxParagraph>${order.tax?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                    {l10n('accountsReceivable.invoice.shipping')}
                  </AxParagraph>
                  <AxParagraph>${order.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)' }}>
                    {l10n('accountsReceivable.invoice.total')}
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)' }}>
                    ${order.total?.toFixed(2) || '0.00'}
                  </AxParagraph>
                </InfoRow>
              </InfoSection>
            </>
          )}

          {currentStep === 'payment' && (
            <>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>
                {l10n('accountsReceivable.payment.title')}
              </AxHeading3>
              <AxParagraph style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                {l10n('accountsReceivable.payment.description')}
              </AxParagraph>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xsm)' }}>
                <AxFormGroup>
                  <AxLabel>{l10n('accountsReceivable.payment.paymentAmount')}</AxLabel>
                  <AxInput
                    type="number"
                    value={paymentAmount || ''}
                    onChange={e => onPaymentAmountChange(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    style={{ width: '220px' }}
                  />
                </AxFormGroup>

                <AxFormGroup>
                  <AxLabel>{l10n('accountsReceivable.payment.paymentDate')}</AxLabel>
                  <AxInput
                    type="date"
                    value={paymentDate}
                    onChange={e => onPaymentDateChange(e.target.value)}
                  />
                </AxFormGroup>

                <AxFormGroup>
                  <AxLabel>{l10n('accountsReceivable.payment.paymentMethod')}</AxLabel>
                  <AxListbox
                    options={[
                      { value: 'BANK_TRANSFER', label: l10n('accountsReceivable.payment.method.bankTransfer') },
                      { value: 'CREDIT_CARD', label: l10n('accountsReceivable.payment.method.creditCard') },
                      { value: 'CASH', label: l10n('accountsReceivable.payment.method.cash') },
                      { value: 'CHECK', label: l10n('accountsReceivable.payment.method.check') },
                      { value: 'OTHER', label: l10n('accountsReceivable.payment.method.other') },
                    ]}
                    value={paymentMethod}
                    onChange={onPaymentMethodChange}
                    placeholder={l10n('accountsReceivable.payment.paymentMethodPlaceholder')}
                    style={{ width: '220px' }}
                  />
                </AxFormGroup>

                <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
                  <InfoRow>
                    <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                      {l10n('accountsReceivable.payment.invoiceAmount')}
                    </AxParagraph>
                    <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
                      ${order.total?.toFixed(2) || '0.00'}
                    </AxParagraph>
                  </InfoRow>
                  {paymentAmount > 0 && (
                    <InfoRow>
                      <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {l10n('accountsReceivable.payment.paidAmount')}
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
                      {l10n('accountsReceivable.payment.outstanding')}
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
                  onClick={() => onStepChange('invoice')}
                >
                  {l10n('accountsReceivable.previous')}
                </AxButton>
                <AxButton
                  variant="primary"
                  onClick={onPaymentSubmit}
                  disabled={submitting || !paymentAmount || !paymentDate || !paymentMethod}
                >
                  {submitting ? l10n('accountsReceivable.payment.processing') : l10n('accountsReceivable.payment.record')}
                </AxButton>
              </ButtonGroup>
            </>
          )}

          {currentStep === 'history' && (
            <>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>
                {l10n('accountsReceivable.history.title')}
              </AxHeading3>
              <AxParagraph style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                {l10n('accountsReceivable.history.description')}
              </AxParagraph>

              {historyRecords.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                  <AxParagraph>{l10n('accountsReceivable.history.empty')}</AxParagraph>
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
                  onClick={() => onStepChange('payment')}
                >
                  {l10n('accountsReceivable.previous')}
                </AxButton>
              </ButtonGroup>
            </>
          )}
        </StepContent>
      </ContentCard>
    </PageContainer>
  );
}

