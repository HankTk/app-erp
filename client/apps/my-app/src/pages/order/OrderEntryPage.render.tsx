import {
  AxHeading3,
  AxParagraph,
  AxButton,
  AxListbox,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { OrderStep } from './types';
import { Order } from '../../api/orderApi';
import { Customer } from '../../api/customerApi';
import { Address } from '../../api/addressApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  ContentCard,
  StepIndicator,
  StepScrollContainer,
  HistoryStepContainer,
  Step,
  StepContent,
  ButtonGroup,
} from './OrderEntryPage.styles';

const COMPONENT_NAME = 'OrderEntryPage';

interface OrderEntryPageRenderProps {
  order: Order | null;
  customers: Customer[];
  addresses: Address[];
  loading: boolean;
  submitting: boolean;
  readOnly: boolean;
  title?: string;
  subtitle?: string;
  currentStep: OrderStep;
  currentEntrySubStep: string;
  steps: { key: OrderStep; label: string; description: string }[];
  statusOptions: { value: string; label: string }[];
  onNavigateBack?: () => void;
  onNavigateToOrders?: () => void;
  renderStepContent: () => React.ReactNode;
  isStepCompleted: (step: OrderStep) => boolean;
  canProceedToNext: () => boolean;
  handleNavigateBack: () => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleCompleteEntry: () => void;
  handleApproveOrder: () => void;
  handleConfirmOrder: () => void;
  handleShippingInstruction: () => void;
  handleShipOrder: () => void;
  handleInvoiceOrder: () => void;
  setCurrentStep: (step: OrderStep) => void;
  setCurrentEntrySubStep: (subStep: string) => void;
  onStatusChange: (value: string) => void;
  orderIdToEdit?: string | null;
  l10n: (key: string) => string;
}

export function OrderEntryPageRender(props: OrderEntryPageRenderProps) {
  const {
    order,
    customers,
    addresses,
    loading,
    submitting,
    readOnly,
    title,
    subtitle,
    currentStep,
    currentEntrySubStep,
    steps,
    statusOptions,
    onNavigateBack,
    onNavigateToOrders,
    renderStepContent,
    isStepCompleted,
    canProceedToNext,
    handleNavigateBack,
    handlePrevious,
    handleNext,
    handleCompleteEntry,
    handleApproveOrder,
    handleConfirmOrder,
    handleShippingInstruction,
    handleShipOrder,
    handleInvoiceOrder,
    setCurrentStep,
    setCurrentEntrySubStep,
    onStatusChange,
    orderIdToEdit,
    l10n,
  } = props;

  const selectedCustomer = customers.find(c => c.id === order?.customerId);

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={handleNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                {l10n('orderEntry.back')}
              </AxButton>
            )}
            <div style={{ flex: 1 }}>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {title || l10n('orderEntry.title')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {subtitle || l10n('orderEntry.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {order?.orderNumber && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                  minWidth: '150px'
                }}>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    {l10n('orderEntry.confirmation.orderNumber')}
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}>
                    {order.orderNumber}
                  </AxParagraph>
                </div>
              )}
              {selectedCustomer && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                  minWidth: '200px'
                }}>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    {l10n('orderEntry.customer')}
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}>
                    {selectedCustomer.companyName || `${selectedCustomer.lastName} ${selectedCustomer.firstName}` || selectedCustomer.email}
                  </AxParagraph>
                  {selectedCustomer.email && (
                    <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                      {selectedCustomer.email}
                    </AxParagraph>
                  )}
                </div>
              )}
              {(() => {
                const shippingAddress = addresses.find(a => a.id === order?.shippingAddressId);
                const billingAddress = addresses.find(a => a.id === order?.billingAddressId);
                if (shippingAddress || billingAddress) {
                  return (
                    <>
                      {shippingAddress && (
                        <div style={{ 
                          padding: 'var(--spacing-md)', 
                          backgroundColor: 'var(--color-background-secondary)', 
                          borderRadius: 'var(--radius-md)',
                          minWidth: '200px',
                          maxWidth: '250px'
                        }}>
                          <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                            {l10n('orderEntry.shippingAddress')}
                          </AxParagraph>
                          <AxParagraph style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-tight)' }}>
                            {shippingAddress.streetAddress1}
                            {shippingAddress.streetAddress2 && `, ${shippingAddress.streetAddress2}`}
                            <br />
                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                            {shippingAddress.country && (
                              <>
                                <br />
                                {shippingAddress.country}
                              </>
                            )}
                          </AxParagraph>
                        </div>
                      )}
                      {billingAddress && (
                        <div style={{ 
                          padding: 'var(--spacing-md)', 
                          backgroundColor: 'var(--color-background-secondary)', 
                          borderRadius: 'var(--radius-md)',
                          minWidth: '200px',
                          maxWidth: '250px'
                        }}>
                          <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                            {l10n('orderEntry.billingAddress')}
                          </AxParagraph>
                          <AxParagraph style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-tight)' }}>
                            {billingAddress.streetAddress1}
                            {billingAddress.streetAddress2 && `, ${billingAddress.streetAddress2}`}
                            <br />
                            {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                            {billingAddress.country && (
                              <>
                                <br />
                                {billingAddress.country}
                              </>
                            )}
                          </AxParagraph>
                        </div>
                      )}
                    </>
                  );
                }
                return null;
              })()}
              {order?.id && (
                <>
                  <div style={{ 
                    padding: 'var(--spacing-md)', 
                    backgroundColor: 'var(--color-background-secondary)', 
                    borderRadius: 'var(--radius-md)',
                    minWidth: '200px'
                  }}>
                    <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                      {l10n('orderEntry.orderStatus')}
                    </AxParagraph>
                    <AxListbox
                      key={`status-${order.id}-${order.status || 'null'}`}
                      options={statusOptions}
                      value={order?.status || undefined}
                      onChange={(value: string | string[]) => {
                        const statusValue = Array.isArray(value) ? value[0] : value;
                        if (statusValue) {
                          onStatusChange(statusValue);
                        }
                      }}
                      placeholder={l10n('orderEntry.selectStatus')}
                      fullWidth
                      disabled={loading || !order?.id || readOnly}
                    />
                  </div>
                </>
              )}
            </div>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
        <StepIndicator {...debugProps(COMPONENT_NAME, 'StepIndicator')}>
          <StepScrollContainer {...debugProps(COMPONENT_NAME, 'StepScrollContainer')}>
            {steps
              .filter(step => {
                // In read-only mode, only show completed steps (except history)
                if (readOnly) {
                  return step.key !== 'history' && isStepCompleted(step.key);
                }
                // In edit mode, show all steps except history
                return step.key !== 'history';
              })
              .map((step) => {
                const isActive = currentStep === step.key;
                const isCompleted = isStepCompleted(step.key);
                // Calculate the original step number for display
                const originalIndex = steps.findIndex(s => s.key === step.key);
                return (
                  <Step
                    key={step.key}
                    $active={isActive}
                    $completed={isCompleted}
                    {...debugProps(COMPONENT_NAME, 'Step')}
                    onClick={() => {
                      if (readOnly) {
                        // In read-only mode, only allow access to completed steps
                        if (isCompleted) {
                          setCurrentStep(step.key);
                          if (step.key === 'entry') {
                            setCurrentEntrySubStep('review');
                          }
                        }
                      } else {
                        // In edit mode, allow access to completed or active steps
                        if (isCompleted || isActive) {
                          setCurrentStep(step.key);
                          if (step.key === 'entry') {
                            setCurrentEntrySubStep('review');
                          }
                        }
                      }
                    }}
                    title={step.description}
                  >
                    {originalIndex + 1}. {step.label}
                  </Step>
                );
              })}
          </StepScrollContainer>
          <HistoryStepContainer {...debugProps(COMPONENT_NAME, 'HistoryStepContainer')}>
            {(() => {
              const historyStep = steps.find(s => s.key === 'history');
              if (!historyStep) return null;
              const isActive = currentStep === 'history';
              const isCompleted = isStepCompleted('history');
              return (
                <Step
                  key="history"
                  $active={isActive}
                  $completed={isCompleted}
                  {...debugProps(COMPONENT_NAME, 'Step')}
                  onClick={() => {
                    setCurrentStep('history');
                  }}
                  title={historyStep.description}
                >
                  {historyStep.label}
                </Step>
              );
            })()}
          </HistoryStepContainer>
        </StepIndicator>

        <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
          {renderStepContent()}
        </StepContent>

        {!readOnly && (
          <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
            <AxButton
              variant="secondary"
              onClick={handlePrevious}
              disabled={(currentStep === 'entry' && currentEntrySubStep === 'customer') || submitting}
            >
              {l10n('orderEntry.previous')}
            </AxButton>
            {currentStep === 'entry' && currentEntrySubStep === 'review' ? (
              <AxButton
                variant="primary"
                onClick={handleCompleteEntry}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('orderEntry.saving') : (orderIdToEdit ? l10n('orderEntry.saveOrder') : l10n('orderEntry.completeOrder'))}
              </AxButton>
            ) : currentStep === 'approval' ? (
              <AxButton
                variant="primary"
                onClick={handleApproveOrder}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('orderEntry.approving') : l10n('orderEntry.approveOrder')}
              </AxButton>
            ) : currentStep === 'confirmation' ? (
              <AxButton
                variant="primary"
                onClick={handleConfirmOrder}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('orderEntry.confirming') : l10n('orderEntry.confirmOrder')}
              </AxButton>
            ) : currentStep === 'shipping_instruction' ? (
              <AxButton
                variant="primary"
                onClick={handleShippingInstruction}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('orderEntry.submitting') : l10n('orderEntry.submitShippingInstruction')}
              </AxButton>
            ) : currentStep === 'shipping' ? (
              <AxButton
                variant="primary"
                onClick={handleShipOrder}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('orderEntry.shipping') : l10n('orderEntry.shipOrder')}
              </AxButton>
            ) : currentStep === 'invoicing' ? (
              <AxButton
                variant="primary"
                onClick={handleInvoiceOrder}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('orderEntry.invoicing') : l10n('orderEntry.createInvoice')}
              </AxButton>
            ) : currentStep === 'history' ? (
              <AxButton
                variant="secondary"
                onClick={() => {
                  if (onNavigateToOrders) {
                    onNavigateToOrders();
                  } else {
                    handlePrevious();
                  }
                }}
                disabled={submitting}
              >
                {onNavigateToOrders ? l10n('orderEntry.backToOrders') : l10n('orderEntry.previous')}
              </AxButton>
            ) : (
              <AxButton
                variant="primary"
                onClick={handleNext}
                disabled={!canProceedToNext() || submitting}
              >
                {l10n('orderEntry.next')}
              </AxButton>
            )}
          </ButtonGroup>
        )}
        {readOnly && currentStep === 'history' && (
          <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
            <AxButton
              variant="secondary"
              onClick={() => {
                if (onNavigateToOrders) {
                  onNavigateToOrders();
                } else if (onNavigateBack) {
                  onNavigateBack();
                }
              }}
            >
              {onNavigateToOrders ? l10n('orderEntry.backToOrders') : l10n('orderEntry.previous')}
            </AxButton>
          </ButtonGroup>
        )}
        {readOnly && currentStep !== 'history' && (
          <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
            <AxButton
              variant="secondary"
              onClick={() => {
                // Find previous completed step
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                for (let i = currentIndex - 1; i >= 0; i--) {
                  if (isStepCompleted(steps[i].key)) {
                    setCurrentStep(steps[i].key);
                    if (steps[i].key === 'entry') {
                      setCurrentEntrySubStep('review');
                    }
                    return;
                  }
                }
              }}
              disabled={(() => {
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                return currentIndex === 0 || !steps.slice(0, currentIndex).some(s => isStepCompleted(s.key));
              })()}
            >
              {l10n('orderEntry.previous')}
            </AxButton>
            <AxButton
              variant="primary"
              onClick={() => {
                // Find next completed step (excluding history)
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                for (let i = currentIndex + 1; i < steps.length; i++) {
                  if (steps[i].key !== 'history' && isStepCompleted(steps[i].key)) {
                    setCurrentStep(steps[i].key);
                    if (steps[i].key === 'entry') {
                      setCurrentEntrySubStep('review');
                    }
                    return;
                  }
                }
              }}
              disabled={(() => {
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                const remainingSteps = steps.slice(currentIndex + 1).filter(s => s.key !== 'history');
                return remainingSteps.length === 0 || !remainingSteps.some(s => isStepCompleted(s.key));
              })()}
            >
              {l10n('orderEntry.next')}
            </AxButton>
          </ButtonGroup>
        )}
      </ContentCard>
    </PageContainer>
  );
}

