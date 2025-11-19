import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxListbox,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { PurchaseOrderStep } from './types';
import { PurchaseOrder, updatePurchaseOrder } from '../../api/purchaseOrderApi';
import { Vendor } from '../../api/vendorApi';
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
} from './PurchaseOrderEntryPage.styles';

const COMPONENT_NAME = 'PurchaseOrderEntryPage';

interface PurchaseOrderEntryPageRenderProps {
  po: PurchaseOrder | null;
  vendors: Vendor[];
  addresses: Address[];
  loading: boolean;
  submitting: boolean;
  readOnly: boolean;
  title?: string;
  subtitle?: string;
  currentStep: PurchaseOrderStep;
  currentEntrySubStep: string;
  steps: { key: PurchaseOrderStep; label: string; description: string }[];
  onNavigateBack?: () => void;
  onNavigateToPOs?: () => void;
  renderStepContent: () => React.ReactNode;
  isStepCompleted: (step: PurchaseOrderStep) => boolean;
  canProceedToNext: () => boolean;
  handleNavigateBack: () => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleCompleteEntry: () => void;
  handleApprovePO: () => void;
  handleReceivePO: () => void;
  handleInvoicePO: () => void;
  setCurrentStep: (step: PurchaseOrderStep) => void;
  setCurrentEntrySubStep: (subStep: string) => void;
  onStatusChange: (value: string | null) => void;
  addHistoryRecord: (type: string, step: string, note?: string, status?: string, metadata?: any, updatedPO?: PurchaseOrder) => Promise<void>;
  l10n: (key: string) => string;
}

export function PurchaseOrderEntryPageRender(props: PurchaseOrderEntryPageRenderProps) {
  const {
    po,
    vendors,
    addresses,
    loading,
    submitting,
    readOnly,
    title,
    subtitle,
    currentStep,
    currentEntrySubStep,
    steps,
    onNavigateBack,
    onNavigateToPOs,
    renderStepContent,
    isStepCompleted,
    canProceedToNext,
    handleNavigateBack,
    handlePrevious,
    handleNext,
    handleCompleteEntry,
    handleApprovePO,
    handleReceivePO,
    handleInvoicePO,
    setCurrentStep,
    setCurrentEntrySubStep,
    onStatusChange,
    addHistoryRecord,
    l10n,
  } = props;

  const selectedVendor = vendors.find(v => v.id === po?.supplierId);

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
                {l10n('purchaseOrderEntry.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {title || l10n('purchaseOrderEntry.title')}
              </AxHeading3>
              {subtitle && (
                <AxParagraph color="secondary">
                  {subtitle}
                </AxParagraph>
              )}
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            {(() => {
              if (po?.id && selectedVendor) {
                const shippingAddress = addresses.find(a => a.id === po.shippingAddressId);
                const billingAddress = addresses.find(a => a.id === po.billingAddressId);
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
                        <AxParagraph weight="bold" marginBottom="xs" size="sm">
                          {l10n('purchaseOrderEntry.shippingAddress')}
                        </AxParagraph>
                        <AxParagraph size="sm" lineHeight="tight">
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
                        <AxParagraph weight="bold" marginBottom="xs" size="sm">
                          {l10n('purchaseOrderEntry.billingAddress')}
                        </AxParagraph>
                        <AxParagraph size="sm" lineHeight="tight">
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
            {po?.id && (
              <>
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                  minWidth: '200px'
                }}>
                  <AxParagraph weight="bold" marginBottom="xs" size="sm">
                    {l10n('purchaseOrderEntry.orderStatus')}
                  </AxParagraph>
                  <AxListbox
                    key={`status-${po.id}-${po.status || 'null'}`}
                    options={[
                      { value: 'DRAFT', label: l10n('purchaseOrder.status.draft') },
                      { value: 'PENDING_APPROVAL', label: l10n('purchaseOrder.status.pendingApproval') },
                      { value: 'APPROVED', label: l10n('purchaseOrder.status.approved') },
                      { value: 'RECEIVED', label: l10n('purchaseOrder.status.received') },
                      { value: 'INVOICED', label: l10n('purchaseOrder.status.invoiced') },
                      { value: 'PAID', label: l10n('purchaseOrder.status.paid') },
                      { value: 'CANCELLED', label: l10n('purchaseOrder.status.cancelled') },
                    ]}
                    value={po?.status || null}
                    onChange={onStatusChange}
                    placeholder={l10n('purchaseOrderEntry.selectStatus')}
                    fullWidth
                    disabled={loading || !po?.id || readOnly}
                  />
                </div>
              </>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
        <StepIndicator {...debugProps(COMPONENT_NAME, 'StepIndicator')}>
          <StepScrollContainer {...debugProps(COMPONENT_NAME, 'StepScrollContainer')}>
            {steps
              .filter(step => {
                if (readOnly) {
                  return step.key !== 'history' && isStepCompleted(step.key);
                }
                return step.key !== 'history';
              })
              .map((step, index) => {
                const isActive = currentStep === step.key;
                const isCompleted = isStepCompleted(step.key);
                const originalIndex = steps.findIndex(s => s.key === step.key);
                return (
                  <Step
                    key={step.key}
                    $active={isActive}
                    $completed={isCompleted}
                    {...debugProps(COMPONENT_NAME, 'Step')}
                    onClick={() => {
                      if (readOnly) {
                        if (isCompleted) {
                          setCurrentStep(step.key);
                          if (step.key === 'entry') {
                            setCurrentEntrySubStep('review');
                          }
                        }
                      } else {
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
              disabled={(currentStep === 'entry' && currentEntrySubStep === 'supplier') || submitting}
            >
              {l10n('purchaseOrderEntry.previous')}
            </AxButton>
            {currentStep === 'entry' && currentEntrySubStep === 'review' ? (
              <AxButton
                variant="primary"
                onClick={handleCompleteEntry}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('purchaseOrderEntry.saving') : (po?.id ? l10n('purchaseOrderEntry.saveOrder') : l10n('purchaseOrderEntry.completeOrder'))}
              </AxButton>
            ) : currentStep === 'approval' ? (
              <AxButton
                variant="primary"
                onClick={handleApprovePO}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('purchaseOrderEntry.approving') : l10n('purchaseOrderEntry.approveOrder')}
              </AxButton>
            ) : currentStep === 'received' ? (
              <AxButton
                variant="primary"
                onClick={handleReceivePO}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('purchaseOrderEntry.receiving') : l10n('purchaseOrderEntry.receiveOrder')}
              </AxButton>
            ) : currentStep === 'invoicing' ? (
              <AxButton
                variant="primary"
                onClick={handleInvoicePO}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('purchaseOrderEntry.invoicing') : l10n('purchaseOrderEntry.createInvoice')}
              </AxButton>
            ) : currentStep === 'history' ? (
              <AxButton
                variant="secondary"
                onClick={() => {
                  if (onNavigateToPOs) {
                    onNavigateToPOs();
                  } else {
                    handlePrevious();
                  }
                }}
                disabled={submitting}
              >
                {onNavigateToPOs ? l10n('purchaseOrderEntry.backToPOs') : l10n('purchaseOrderEntry.previous')}
              </AxButton>
            ) : (
              <AxButton
                variant="primary"
                onClick={handleNext}
                disabled={!canProceedToNext() || submitting}
              >
                {l10n('purchaseOrderEntry.next')}
              </AxButton>
            )}
          </ButtonGroup>
        )}
        {readOnly && currentStep === 'history' && (
          <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
            <AxButton
              variant="secondary"
              onClick={() => {
                if (onNavigateToPOs) {
                  onNavigateToPOs();
                } else if (onNavigateBack) {
                  onNavigateBack();
                }
              }}
            >
              {onNavigateToPOs ? l10n('purchaseOrderEntry.backToPOs') : l10n('purchaseOrderEntry.previous')}
            </AxButton>
          </ButtonGroup>
        )}
        {readOnly && currentStep !== 'history' && (
          <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
            <AxButton
              variant="secondary"
              onClick={() => {
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
              {l10n('purchaseOrderEntry.previous')}
            </AxButton>
            <AxButton
              variant="primary"
              onClick={() => {
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
              {l10n('purchaseOrderEntry.next')}
            </AxButton>
          </ButtonGroup>
        )}
      </ContentCard>
    </PageContainer>
  );
}

