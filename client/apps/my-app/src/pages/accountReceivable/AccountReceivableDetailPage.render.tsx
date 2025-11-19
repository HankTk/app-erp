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
  InfoBoxContainer,
  InfoBox,
  InfoBoxLabel,
  InfoBoxValue,
  LoadingContainer,
  BackButton,
  HeaderTitleContainer,
  HeadingWithMarginBottom,
  ParagraphSecondary,
  ParagraphWithMargin,
  ParagraphBold,
  ParagraphBoldLarge,
  ParagraphLargeBold,
  ParagraphLarge,
  FormContainer,
  InputWithWidth,
  ListboxWithWidth,
  OutstandingParagraph,
  OutstandingParagraphLarge,
  EmptyStateContainer,
  ScrollableContainer,
  DataContainer,
  DataItem,
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

interface OrderItem {
  id?: string;
  productName?: string;
  productCode?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
}

const INVOICE_ITEMS_TABLE_COLUMNS = [
  { 
    key: 'accountsReceivable.invoice.product',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (item: OrderItem) => item.productName || item.productCode || 'N/A'
  },
  { 
    key: 'accountsReceivable.invoice.quantity',
    align: 'right' as const,
    render: (item: OrderItem) => item.quantity || 0
  },
  { 
    key: 'accountsReceivable.invoice.unitPrice',
    align: 'right' as const,
    render: (item: OrderItem) => `$${(item.unitPrice?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'accountsReceivable.invoice.lineTotal',
    align: 'right' as const,
    render: (item: OrderItem) => `$${(item.lineTotal?.toFixed(2) || '0.00')}`
  },
];

type HistoryRenderContext = {
  formatDateTime: (dateString: string) => string;
  getStepLabel: (step: string) => string;
  getStatusLabel: (status?: string) => string;
  getDataKeyLabel: (key: string) => string;
  formatDataValue: (key: string, value: any) => string;
};

const HISTORY_TABLE_COLUMNS = [
  { 
    key: 'accountsReceivable.history.timestamp',
    render: (record: HistoryRecord, context: HistoryRenderContext) => context.formatDateTime(record.timestamp)
  },
  { 
    key: 'accountsReceivable.history.step',
    render: (record: HistoryRecord, context: HistoryRenderContext) => context.getStepLabel(record.step)
  },
  { 
    key: 'accountsReceivable.history.status',
    render: (record: HistoryRecord, context: HistoryRenderContext) => context.getStatusLabel(record.status)
  },
  { 
    key: 'accountsReceivable.history.note',
    render: (record: HistoryRecord, _context: HistoryRenderContext) => record.note || 'N/A'
  },
  { 
    key: 'accountsReceivable.history.data',
    render: (record: HistoryRecord, context: HistoryRenderContext) => {
      if (record.data && Object.keys(record.data).length > 0) {
        return (
          <DataContainer>
            {Object.entries(record.data).map(([key, value]) => (
              <DataItem key={key}>
                <strong>{context.getDataKeyLabel(key)}:</strong> {context.formatDataValue(key, value)}
              </DataItem>
            ))}
          </DataContainer>
        );
      }
      return 'N/A';
    }
  },
];

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
  onPaymentMethodChange: (value: string | string[]) => void;
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
          <LoadingContainer>
            <AxParagraph>Loading invoice...</AxParagraph>
          </LoadingContainer>
        </ContentCard>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <LoadingContainer>
            <AxParagraph>Invoice not found</AxParagraph>
            {onNavigateBack && (
              <AxButton variant="secondary" onClick={onNavigateBack}>
                {l10n('accountsReceivable.back')}
              </AxButton>
            )}
          </LoadingContainer>
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
              <BackButton 
                variant="secondary" 
                onClick={onNavigateBack}
              >
                {l10n('accountsReceivable.back')}
              </BackButton>
            )}
            <HeaderTitleContainer>
              <HeadingWithMarginBottom $marginBottom="var(--spacing-xs)">
                {l10n('module.accountsReceivable')}
              </HeadingWithMarginBottom>
              <ParagraphSecondary>
                {l10n('accountsReceivable.subtitle')}
              </ParagraphSecondary>
            </HeaderTitleContainer>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <InfoBoxContainer {...debugProps(COMPONENT_NAME, 'InfoBoxContainer')}>
              {order.invoiceNumber && (
                <InfoBox {...debugProps(COMPONENT_NAME, 'InfoBox')}>
                  <InfoBoxLabel>
                    {l10n('accountsReceivable.invoice.invoiceNumber')}
                  </InfoBoxLabel>
                  <InfoBoxValue>
                    {order.invoiceNumber}
                  </InfoBoxValue>
                </InfoBox>
              )}
              <InfoBox {...debugProps(COMPONENT_NAME, 'InfoBox')}>
                <InfoBoxLabel>
                  {l10n('accountsReceivable.customer')}
                </InfoBoxLabel>
                <InfoBoxValue>
                  {selectedCustomerName}
                </InfoBoxValue>
              </InfoBox>
              <InfoBox {...debugProps(COMPONENT_NAME, 'InfoBox')}>
                <InfoBoxLabel>
                  {l10n('accountsReceivable.total')}
                </InfoBoxLabel>
                <InfoBoxValue>
                  ${order.total?.toFixed(2) || '0.00'}
                </InfoBoxValue>
              </InfoBox>
              <InfoBox {...debugProps(COMPONENT_NAME, 'InfoBox')}>
                <InfoBoxLabel>
                  {l10n('accountsReceivable.outstanding')}
                </InfoBoxLabel>
                <InfoBoxValue $color={outstandingAmount > 0 ? 'var(--color-warning)' : 'var(--color-success)'}>
                  ${outstandingAmount.toFixed(2)}
                </InfoBoxValue>
              </InfoBox>
            </InfoBoxContainer>
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
              <HeadingWithMarginBottom>
                {l10n('accountsReceivable.invoice.title')}
              </HeadingWithMarginBottom>
              <ParagraphWithMargin>
                {l10n('accountsReceivable.invoice.description')}
              </ParagraphWithMargin>

              <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
                <InfoRow>
                  <ParagraphBold>
                    {l10n('accountsReceivable.invoice.invoiceNumber')}
                  </ParagraphBold>
                  <AxParagraph>{order.invoiceNumber || 'N/A'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <ParagraphBold>
                    {l10n('accountsReceivable.invoice.invoiceDate')}
                  </ParagraphBold>
                  <AxParagraph>{formatDate(order.invoiceDate)}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <ParagraphBold>
                    {l10n('accountsReceivable.invoice.orderNumber')}
                  </ParagraphBold>
                  <AxParagraph>{order.orderNumber || 'N/A'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <ParagraphBold>
                    {l10n('accountsReceivable.invoice.customer')}
                  </ParagraphBold>
                  <AxParagraph>
                    {selectedCustomer ? (selectedCustomer.companyName || `${selectedCustomer.lastName} ${selectedCustomer.firstName}` || selectedCustomer.email) : 'N/A'}
                  </AxParagraph>
                </InfoRow>
              </InfoSection>

              {order.items && order.items.length > 0 && (
                <ItemsTable fullWidth>
                  <AxTableHead>
                    <AxTableRow>
                      {INVOICE_ITEMS_TABLE_COLUMNS.map((column) => (
                        <AxTableHeader key={column.key} align={column.align}>
                          {l10n(column.key)}
                        </AxTableHeader>
                      ))}
                    </AxTableRow>
                  </AxTableHead>
                  <AxTableBody>
                    {order.items.map((item, index) => (
                      <AxTableRow key={index}>
                        {INVOICE_ITEMS_TABLE_COLUMNS.map((column) => (
                          <AxTableCell key={column.key} align={column.align}>
                            {column.render(item)}
                          </AxTableCell>
                        ))}
                      </AxTableRow>
                    ))}
                  </AxTableBody>
                </ItemsTable>
              )}

              <InfoSection>
                <InfoRow>
                  <ParagraphBold>
                    {l10n('accountsReceivable.invoice.subtotal')}
                  </ParagraphBold>
                  <AxParagraph>${order.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <ParagraphBold>
                    {l10n('accountsReceivable.invoice.tax')}
                  </ParagraphBold>
                  <AxParagraph>${order.tax?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <ParagraphBold>
                    {l10n('accountsReceivable.invoice.shipping')}
                  </ParagraphBold>
                  <AxParagraph>${order.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
                </InfoRow>
                <InfoRow>
                  <ParagraphBoldLarge>
                    {l10n('accountsReceivable.invoice.total')}
                  </ParagraphBoldLarge>
                  <ParagraphLargeBold>
                    ${order.total?.toFixed(2) || '0.00'}
                  </ParagraphLargeBold>
                </InfoRow>
              </InfoSection>
            </>
          )}

          {currentStep === 'payment' && (
            <>
              <HeadingWithMarginBottom>
                {l10n('accountsReceivable.payment.title')}
              </HeadingWithMarginBottom>
              <ParagraphWithMargin>
                {l10n('accountsReceivable.payment.description')}
              </ParagraphWithMargin>

              <FormContainer>
                <AxFormGroup>
                  <AxLabel>{l10n('accountsReceivable.payment.paymentAmount')}</AxLabel>
                  <InputWithWidth
                    type="number"
                    value={paymentAmount || ''}
                    onChange={e => onPaymentAmountChange(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
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
                  <ListboxWithWidth
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
                  />
                </AxFormGroup>

                <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
                  <InfoRow>
                    <ParagraphBold>
                      {l10n('accountsReceivable.payment.invoiceAmount')}
                    </ParagraphBold>
                    <ParagraphLarge>
                      ${order.total?.toFixed(2) || '0.00'}
                    </ParagraphLarge>
                  </InfoRow>
                  {paymentAmount > 0 && (
                    <InfoRow>
                      <ParagraphBold>
                        {l10n('accountsReceivable.payment.paidAmount')}
                      </ParagraphBold>
                      <ParagraphLarge>
                        ${paymentAmount.toFixed(2)}
                      </ParagraphLarge>
                    </InfoRow>
                  )}
                  <InfoRow>
                    <OutstandingParagraph $outstandingAmount={outstandingAmount}>
                      {l10n('accountsReceivable.payment.outstanding')}
                    </OutstandingParagraph>
                    <OutstandingParagraphLarge $outstandingAmount={outstandingAmount}>
                      ${outstandingAmount.toFixed(2)}
                    </OutstandingParagraphLarge>
                  </InfoRow>
                </InfoSection>
              </FormContainer>

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
              <HeadingWithMarginBottom>
                {l10n('accountsReceivable.history.title')}
              </HeadingWithMarginBottom>
              <ParagraphWithMargin>
                {l10n('accountsReceivable.history.description')}
              </ParagraphWithMargin>

              {historyRecords.length === 0 ? (
                <EmptyStateContainer>
                  <AxParagraph>{l10n('accountsReceivable.history.empty')}</AxParagraph>
                </EmptyStateContainer>
              ) : (
                <ScrollableContainer>
                  <AxTable fullWidth>
                    <AxTableHead>
                      <AxTableRow>
                        {HISTORY_TABLE_COLUMNS.map((column) => (
                          <AxTableHeader key={column.key}>
                            {l10n(column.key)}
                          </AxTableHeader>
                        ))}
                      </AxTableRow>
                    </AxTableHead>
                    <AxTableBody>
                      {historyRecords.map((record, index) => {
                        const context: HistoryRenderContext = {
                          formatDateTime,
                          getStepLabel,
                          getStatusLabel,
                          getDataKeyLabel,
                          formatDataValue,
                        };
                        return (
                          <AxTableRow key={index}>
                            {HISTORY_TABLE_COLUMNS.map((column) => (
                              <AxTableCell key={column.key}>
                                {column.render(record, context)}
                              </AxTableCell>
                            ))}
                          </AxTableRow>
                        );
                      })}
                    </AxTableBody>
                  </AxTable>
                </ScrollableContainer>
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

