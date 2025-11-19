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
import { OrderEntryStepProps, EntrySubStep } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { CustomerEditDialog } from '../../components/CustomerEditDialog';
import { debugProps } from '../../utils/emotionCache';
import { StepContent, ItemsTable, SubStepIndicator, SubStep } from './OrderEntryStepPage.styles';

const COMPONENT_NAME = 'OrderEntryStepPage';

const createEntrySubSteps = (l10n: (key: string) => string): { key: EntrySubStep; label: string }[] => [
  { key: 'customer', label: l10n('orderEntry.subStep.customer') },
  { key: 'products', label: l10n('orderEntry.subStep.products') },
  { key: 'shipping', label: l10n('orderEntry.subStep.shipping') },
  { key: 'review', label: l10n('orderEntry.subStep.review') },
];

interface OrderEntryStepPageRenderProps extends OrderEntryStepProps {
  isSubStepCompleted: (subStep: EntrySubStep) => boolean;
  customerDialogOpen: boolean;
  setCustomerDialogOpen: (open: boolean) => void;
  handleCustomerUpdated: () => Promise<void>;
  handleAddressesUpdated: () => Promise<void>;
}

export function OrderEntryStepPageRender(props: OrderEntryStepPageRenderProps) {
  const {
    order,
    customers,
    products,
    addresses,
    selectedProduct,
    quantity,
    shippingId,
    billingId,
    currentSubStep,
    onCustomerSelect,
    onAddProduct,
    onUpdateQuantity,
    onRemoveItem,
    onShippingInfoUpdate,
    onSubStepChange,
    onSetSelectedProduct,
    onSetQuantity,
    onSetShippingId,
    onSetBillingId,
    loading = false,
    readOnly = false,
    isSubStepCompleted,
    customerDialogOpen,
    setCustomerDialogOpen,
    handleCustomerUpdated,
    handleAddressesUpdated,
  } = props;
  const { l10n } = useI18n();
  const entrySubSteps = createEntrySubSteps(l10n);

  const renderCustomerStep = () => {
    const customerOptions = customers.map(c => ({
      value: c.id!,
      label: c.companyName || `${c.lastName} ${c.firstName}` || c.email || c.id!,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.customer.selectCustomer')}</AxHeading3>
        {!order?.id && (
          <AxParagraph marginBottom="md" color="warning">
            {l10n('orderEntry.customer.initializing')}
          </AxParagraph>
        )}
        <AxFormGroup>
          <AxLabel>{l10n('orderEntry.customer.label')}</AxLabel>
          <AxListbox
            options={customerOptions}
            value={order?.customerId || undefined}
            onChange={async (value: string | string[]) => {
              const customerId = Array.isArray(value) ? value[0] : value;
              if (customerId && order?.id) {
                await onCustomerSelect(customerId);
              } else if (customerId && !order?.id) {
                alert(l10n('orderEntry.customer.notReady'));
              }
            }}
            placeholder={l10n('orderEntry.customer.placeholder')}
            fullWidth
            disabled={loading || !order?.id || readOnly}
          />
        </AxFormGroup>
        {order?.customerId && (
          <AxParagraph marginTop="md" color="secondary">
            {l10n('orderEntry.customer.selected')}
          </AxParagraph>
        )}
      </div>
    );
  };

  const renderProductsStep = () => {
    const productOptions = products.map(p => ({
      value: p.id!,
      label: `${p.productCode || ''} - ${p.productName || ''} ($${p.unitPrice || 0})`,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.products.addProducts')}</AxHeading3>

        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            alignItems: 'flex-end',
            marginBottom: 'var(--spacing-lg)',
          }}
        >
          <div style={{ flex: 1 }}>
            <AxFormGroup style={{ marginBottom: 0 }}>
              <AxLabel>{l10n('orderEntry.products.product')}</AxLabel>
              <AxListbox
                options={productOptions}
                value={selectedProduct || undefined}
                onChange={(value: string | string[]) => {
                  const productId = Array.isArray(value) ? value[0] : value;
                  onSetSelectedProduct(productId || null);
                }}
                placeholder={l10n('orderEntry.products.selectProduct')}
                fullWidth
                disabled={loading || readOnly}
              />
            </AxFormGroup>
          </div>
          <div style={{ width: '150px' }}>
            <AxFormGroup style={{ marginBottom: 0 }}>
              <AxLabel>{l10n('orderEntry.products.quantity')}</AxLabel>
              <AxInput
                type="number"
                min="1"
                value={quantity}
                onChange={e => onSetQuantity(parseInt(e.target.value) || 1)}
                disabled={loading || readOnly}
                fullWidth
              />
            </AxFormGroup>
          </div>
          <AxButton
            variant="primary"
            onClick={async () => {
              if (selectedProduct) {
                await onAddProduct(selectedProduct, quantity);
                onSetSelectedProduct(null);
                onSetQuantity(1);
              }
            }}
            disabled={!selectedProduct || loading || readOnly}
          >
            {l10n('orderEntry.products.add')}
          </AxButton>
        </div>

        <ItemsTable {...debugProps(COMPONENT_NAME, 'ItemsTable')}>
          <AxTable fullWidth>
            <AxTableHead>
              <AxTableRow>
                <AxTableHeader>{l10n('orderEntry.products.table.product')}</AxTableHeader>
                <AxTableHeader>{l10n('orderEntry.products.table.quantity')}</AxTableHeader>
                <AxTableHeader align="right">{l10n('orderEntry.products.table.unitPrice')}</AxTableHeader>
                <AxTableHeader align="right">{l10n('orderEntry.products.table.lineTotal')}</AxTableHeader>
                <AxTableHeader align="center">{l10n('orderEntry.products.table.actions')}</AxTableHeader>
              </AxTableRow>
            </AxTableHead>
            <AxTableBody>
              {order?.items && order.items.length > 0 ? (
                order.items.map(item => (
                  <AxTableRow key={item.id}>
                    <AxTableCell>{item.productName || item.productCode}</AxTableCell>
                    <AxTableCell>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                        <AxButton
                          variant="secondary"
                          size="small"
                          onClick={() => onUpdateQuantity(item.id!, (item.quantity || 1) - 1)}
                          disabled={loading || (item.quantity || 1) <= 1 || readOnly}
                        >
                          -
                        </AxButton>
                        <span style={{ minWidth: '40px', textAlign: 'center' }}>{item.quantity || 0}</span>
                        <AxButton
                          variant="secondary"
                          size="small"
                          onClick={() => onUpdateQuantity(item.id!, (item.quantity || 1) + 1)}
                          disabled={loading || readOnly}
                        >
                          +
                        </AxButton>
                      </div>
                    </AxTableCell>
                    <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                    <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                    <AxTableCell align="center">
                      <AxButton
                        variant="danger"
                        size="small"
                        onClick={() => onRemoveItem(item.id!)}
                        disabled={loading}
                      >
                        {l10n('orderEntry.products.delete')}
                      </AxButton>
                    </AxTableCell>
                  </AxTableRow>
                ))
              ) : (
                <AxTableRow>
                  <AxTableCell colSpan={5} align="center">
                    <AxParagraph color="secondary">
                      {l10n('orderEntry.products.noProducts')}
                    </AxParagraph>
                  </AxTableCell>
                </AxTableRow>
              )}
            </AxTableBody>
          </AxTable>
        </ItemsTable>

        {order && (
          <div
            style={{
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>
                <strong>{l10n('orderEntry.products.subtotal')}</strong>
              </AxParagraph>
              <AxParagraph>
                <strong>${order.subtotal?.toFixed(2) || '0.00'}</strong>
              </AxParagraph>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderShippingStep = () => {
    const addressOptions = addresses.map(a => ({
      value: a.id!,
      label: `${a.streetAddress1 || ''}, ${a.city || ''}, ${a.state || ''} ${a.postalCode || ''}${a.addressType ? ` (${a.addressType})` : ''}`,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.shipping.shippingInformation')}</AxHeading3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>{l10n('orderEntry.shippingAddress')}</AxLabel>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <AxListbox
                  options={addressOptions}
                  value={shippingId || undefined}
                  onChange={async (value: string | string[]) => {
                    const addressId = Array.isArray(value) ? value[0] : value;
                    onSetShippingId(addressId || null);
                    // Update shipping info if we have at least one address
                    // Use billingId if available, otherwise use shippingId for both
                    if (addressId) {
                      await onShippingInfoUpdate(addressId, billingId || addressId);
                    }
                  }}
                  placeholder={l10n('orderEntry.shipping.selectShippingAddress')}
                  fullWidth
                  disabled={loading || addressOptions.length === 0 || readOnly}
                />
              </div>
              <AxButton
                onClick={() => {
                  setCustomerDialogOpen(true);
                }}
                disabled={loading || readOnly || !order?.customerId}
                title={l10n('orderEntry.shipping.editCustomer')}
                style={{ 
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  padding: 0,
                  whiteSpace: 'nowrap', 
                  flexShrink: 0, 
                  overflow: 'visible', 
                  textOverflow: 'clip',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '2px solid var(--color-border-default)',
                  alignSelf: 'flex-start'
                }}
              >
                ...
              </AxButton>
            </div>
            {addressOptions.length === 0 && (
              <AxParagraph
                style={{
                  marginTop: 'var(--spacing-xs)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {l10n('orderEntry.shipping.noAddresses')}
              </AxParagraph>
            )}
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{l10n('orderEntry.billingAddress')}</AxLabel>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <AxListbox
                  options={addressOptions}
                  value={billingId || undefined}
                  onChange={async (value: string | string[]) => {
                    const addressId = Array.isArray(value) ? value[0] : value;
                    onSetBillingId(addressId || null);
                    // Update shipping info if we have at least one address
                    // Use shippingId if available, otherwise use billingId for both
                    if (addressId) {
                      await onShippingInfoUpdate(shippingId || addressId, addressId);
                    }
                  }}
                  placeholder={l10n('orderEntry.shipping.selectBillingAddress')}
                  fullWidth
                  disabled={loading || addressOptions.length === 0 || readOnly}
                />
              </div>
              <AxButton
                onClick={() => {
                  setCustomerDialogOpen(true);
                }}
                disabled={loading || readOnly || !order?.customerId}
                title={l10n('orderEntry.shipping.editCustomer')}
                style={{ 
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  padding: 0,
                  whiteSpace: 'nowrap', 
                  flexShrink: 0, 
                  overflow: 'visible', 
                  textOverflow: 'clip',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '2px solid var(--color-border-default)',
                  alignSelf: 'flex-start'
                }}
              >
                ...
              </AxButton>
            </div>
            {addressOptions.length === 0 && (
              <AxParagraph
                style={{
                  marginTop: 'var(--spacing-xs)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {l10n('orderEntry.shipping.noAddresses')}
              </AxParagraph>
            )}
          </AxFormGroup>
        </div>
        <AxParagraph
          style={{
            marginTop: 'var(--spacing-xs)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          {l10n('orderEntry.shipping.sameAddress')}
        </AxParagraph>
        {order?.customerId && (
          <CustomerEditDialog
            open={customerDialogOpen}
            onClose={() => {
              setCustomerDialogOpen(false);
            }}
            customerId={order.customerId}
            onCustomerUpdated={handleCustomerUpdated}
            onAddressesUpdated={handleAddressesUpdated}
          />
        )}
      </div>
    );
  };

  const renderReviewStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.review.reviewOrder')}</AxHeading3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

          <div>
            <AxParagraph weight="bold" marginBottom="sm">
              {l10n('orderEntry.review.orderItems')}
            </AxParagraph>
            <ItemsTable {...debugProps(COMPONENT_NAME, 'ItemsTable')}>
              <AxTable fullWidth>
                <AxTableHead>
                  <AxTableRow>
                    <AxTableHeader>{l10n('orderEntry.products.table.product')}</AxTableHeader>
                    <AxTableHeader>{l10n('orderEntry.products.table.quantity')}</AxTableHeader>
                    <AxTableHeader align="right">{l10n('orderEntry.products.table.unitPrice')}</AxTableHeader>
                    <AxTableHeader align="right">{l10n('orderEntry.products.table.lineTotal')}</AxTableHeader>
                  </AxTableRow>
                </AxTableHead>
                <AxTableBody>
                  {order?.items?.map(item => (
                    <AxTableRow key={item.id}>
                      <AxTableCell>{item.productName || item.productCode}</AxTableCell>
                      <AxTableCell>{item.quantity || 0}</AxTableCell>
                      <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                      <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                    </AxTableRow>
                  ))}
                </AxTableBody>
              </AxTable>
            </ItemsTable>
          </div>

          <div
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>{l10n('orderEntry.review.subtotal')}</AxParagraph>
              <AxParagraph>${order?.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>{l10n('orderEntry.review.tax')}</AxParagraph>
              <AxParagraph>${order?.tax?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>{l10n('orderEntry.review.shipping')}</AxParagraph>
              <AxParagraph>${order?.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 'var(--spacing-sm)',
                borderTop: '2px solid var(--color-border-default)',
              }}
            >
              <AxParagraph weight="bold">{l10n('orderEntry.review.total')}</AxParagraph>
              <AxParagraph weight="bold">
                ${order?.total?.toFixed(2) || '0.00'}
              </AxParagraph>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubStepContent = () => {
    switch (currentSubStep) {
      case 'customer':
        return renderCustomerStep();
      case 'products':
        return renderProductsStep();
      case 'shipping':
        return renderShippingStep();
      case 'review':
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
      <SubStepIndicator {...debugProps(COMPONENT_NAME, 'SubStepIndicator')}>
        {entrySubSteps.map(subStep => {
          const isActive = currentSubStep === subStep.key;
          const isCompleted = isSubStepCompleted(subStep.key);
          return (
            <SubStep
              key={subStep.key}
              $active={isActive}
              $completed={isCompleted}
              onClick={() => {
                if (readOnly) {
                  // In read-only mode, only allow access to completed sub-steps
                  if (isCompleted) {
                    onSubStepChange(subStep.key);
                  }
                } else {
                  // In edit mode, allow access to completed or active sub-steps
                  if (isCompleted || isActive) {
                    onSubStepChange(subStep.key);
                  }
                }
              }}
              {...debugProps(COMPONENT_NAME, 'SubStep')}
            >
              {subStep.label}
            </SubStep>
          );
        })}
      </SubStepIndicator>
      {renderSubStepContent()}
    </StepContent>
  );
}

