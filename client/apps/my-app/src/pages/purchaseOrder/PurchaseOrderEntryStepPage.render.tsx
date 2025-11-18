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
import { PurchaseOrderEntryStepProps, EntrySubStep } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { VendorEditDialog } from '../../components/VendorEditDialog';
import { debugProps } from '../../utils/emotionCache';
import { StepContent, ItemsTable, SubStepIndicator, SubStep } from './PurchaseOrderEntryStepPage.styles';

const COMPONENT_NAME = 'PurchaseOrderEntryStepPage';

const entrySubSteps: { key: EntrySubStep; label: string }[] = [
  { key: 'supplier', label: 'Supplier' },
  { key: 'products', label: 'Products' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'review', label: 'Review' },
];

interface PurchaseOrderEntryStepPageRenderProps extends PurchaseOrderEntryStepProps {
  isSubStepCompleted: (subStep: EntrySubStep) => boolean;
  vendorDialogOpen: boolean;
  setVendorDialogOpen: (open: boolean) => void;
  handleVendorUpdated: () => Promise<void>;
  handleAddressesUpdated: () => Promise<void>;
}

export function PurchaseOrderEntryStepPageRender(props: PurchaseOrderEntryStepPageRenderProps) {
  const {
    po,
    vendors,
    products,
    addresses,
    selectedProduct,
    quantity,
    shippingId,
    billingId,
    expectedDeliveryDate,
    currentSubStep,
    onSupplierSelect,
    onAddProduct,
    onUpdateQuantity,
    onRemoveItem,
    onShippingInfoUpdate,
    onExpectedDeliveryDateUpdate,
    onSubStepChange,
    onSetSelectedProduct,
    onSetQuantity,
    onSetShippingId,
    onSetBillingId,
    onSetExpectedDeliveryDate,
    loading = false,
    readOnly = false,
    isSubStepCompleted,
    vendorDialogOpen,
    setVendorDialogOpen,
    handleVendorUpdated,
    handleAddressesUpdated,
  } = props;
  const { l10n } = useI18n();

  const renderSupplierStep = () => {
    const vendorOptions = vendors.map(v => ({
      value: v.id!,
      label: v.companyName || `${v.lastName} ${v.firstName}` || v.email || v.id!,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>{l10n('purchaseOrderEntry.selectSupplier')}</AxHeading3>
        {!po?.id && (
          <AxParagraph style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-warning)' }}>
            {l10n('purchaseOrderEntry.initializing')}
          </AxParagraph>
        )}
        <AxFormGroup>
          <AxLabel>{l10n('purchaseOrderEntry.supplier')}</AxLabel>
          <AxListbox
            options={vendorOptions}
            value={po?.supplierId || null}
            onChange={async value => {
              if (value && po?.id) {
                await onSupplierSelect(value);
              } else if (value && !po?.id) {
                alert(l10n('purchaseOrderEntry.notReady'));
              }
            }}
            placeholder={l10n('purchaseOrderEntry.selectSupplierPlaceholder')}
            fullWidth
            disabled={loading || !po?.id || readOnly}
          />
        </AxFormGroup>
        {po?.supplierId && (
          <AxParagraph style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-secondary)' }}>
            {l10n('purchaseOrderEntry.supplierSelected')}
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
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>{l10n('purchaseOrderEntry.addProducts')}</AxHeading3>

        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-sm)',
            alignItems: 'flex-end',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <div style={{ flex: 1 }}>
            <AxFormGroup style={{ marginBottom: 0 }}>
              <AxLabel>{l10n('purchaseOrderEntry.product')}</AxLabel>
              <AxListbox
                options={productOptions}
                value={selectedProduct}
                onChange={onSetSelectedProduct}
                placeholder={l10n('purchaseOrderEntry.selectProductPlaceholder')}
                fullWidth
                disabled={loading || readOnly}
              />
            </AxFormGroup>
          </div>
          <div style={{ width: '150px' }}>
            <AxFormGroup style={{ marginBottom: 0 }}>
              <AxLabel>{l10n('purchaseOrderEntry.quantity')}</AxLabel>
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
            {l10n('purchaseOrderEntry.add')}
          </AxButton>
        </div>

        <ItemsTable {...debugProps(COMPONENT_NAME, 'ItemsTable')}>
          <AxTable fullWidth>
            <AxTableHead>
              <AxTableRow>
                <AxTableHeader>{l10n('purchaseOrderEntry.product')}</AxTableHeader>
                <AxTableHeader>{l10n('purchaseOrderEntry.quantity')}</AxTableHeader>
                <AxTableHeader align="right">{l10n('purchaseOrderEntry.unitPrice')}</AxTableHeader>
                <AxTableHeader align="right">{l10n('purchaseOrderEntry.lineTotal')}</AxTableHeader>
                <AxTableHeader align="center">{l10n('purchaseOrderEntry.actions')}</AxTableHeader>
              </AxTableRow>
            </AxTableHead>
            <AxTableBody>
              {po?.items && po.items.length > 0 ? (
                po.items.map(item => (
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
                        disabled={loading || readOnly}
                      >
                        {l10n('purchaseOrderEntry.delete')}
                      </AxButton>
                    </AxTableCell>
                  </AxTableRow>
                ))
              ) : (
                <AxTableRow>
                  <AxTableCell colSpan={5} align="center">
                    <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                      {l10n('purchaseOrderEntry.noProducts')}
                    </AxParagraph>
                  </AxTableCell>
                </AxTableRow>
              )}
            </AxTableBody>
          </AxTable>
        </ItemsTable>

        {po && (
          <div
            style={{
              marginTop: 'var(--spacing-md)',
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>
                <strong>{l10n('purchaseOrderEntry.subtotal')}:</strong>
              </AxParagraph>
              <AxParagraph>
                <strong>${po.subtotal?.toFixed(2) || '0.00'}</strong>
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
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>{l10n('purchaseOrderEntry.shippingInformation')}</AxHeading3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
          <AxFormGroup>
            <AxLabel>{l10n('purchaseOrderEntry.shippingAddress')}</AxLabel>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <AxListbox
                  options={addressOptions}
                  value={shippingId}
                  onChange={async value => {
                    onSetShippingId(value);
                    if (value && billingId) {
                      await onShippingInfoUpdate(value, billingId);
                    }
                  }}
                  placeholder={l10n('purchaseOrderEntry.selectShippingAddress')}
                  fullWidth
                  disabled={loading || addressOptions.length === 0 || readOnly}
                />
              </div>
              <AxButton
                onClick={() => {
                  setVendorDialogOpen(true);
                }}
                disabled={loading || readOnly || !po?.supplierId}
                title="Edit vendor and manage addresses"
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
                {l10n('purchaseOrderEntry.noAddresses')} Click ... to create a new address.
              </AxParagraph>
            )}
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{l10n('purchaseOrderEntry.billingAddress')}</AxLabel>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <AxListbox
                  options={addressOptions}
                  value={billingId}
                  onChange={async value => {
                    onSetBillingId(value);
                    if (value && shippingId) {
                      await onShippingInfoUpdate(shippingId, value);
                    }
                  }}
                  placeholder={l10n('purchaseOrderEntry.selectBillingAddress')}
                  fullWidth
                  disabled={loading || addressOptions.length === 0 || readOnly}
                />
              </div>
              <AxButton
                onClick={() => {
                  setVendorDialogOpen(true);
                }}
                disabled={loading || readOnly || !po?.supplierId}
                title="Edit vendor and manage addresses"
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
                {l10n('purchaseOrderEntry.noAddresses')} Click ... to create a new address.
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
          {l10n('purchaseOrderEntry.sameAddressNote')}
        </AxParagraph>
        {po?.supplierId && (
          <VendorEditDialog
            open={vendorDialogOpen}
            onClose={() => {
              setVendorDialogOpen(false);
            }}
            vendorId={po.supplierId}
            onVendorUpdated={handleVendorUpdated}
            onAddressesUpdated={handleAddressesUpdated}
          />
        )}
      </div>
    );
  };

  const renderReviewStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>{l10n('purchaseOrderEntry.reviewOrder')}</AxHeading3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>{l10n('purchaseOrderEntry.expectedDeliveryDate')}</AxLabel>
            <AxInput
              type="date"
              value={expectedDeliveryDate}
              onChange={async (e) => {
                const date = e.target.value;
                onSetExpectedDeliveryDate(date);
                if (date && po?.id) {
                  await onExpectedDeliveryDateUpdate(date);
                }
              }}
              disabled={loading || !po?.id || readOnly}
            />
            <AxParagraph style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {l10n('purchaseOrderEntry.expectedDeliveryDateDescription')}
            </AxParagraph>
          </AxFormGroup>

          <div>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)' }}>
              {l10n('purchaseOrderEntry.orderItems')}
            </AxParagraph>
            <ItemsTable {...debugProps(COMPONENT_NAME, 'ItemsTable')}>
              <AxTable fullWidth>
                <AxTableHead>
                  <AxTableRow>
                    <AxTableHeader>{l10n('purchaseOrderEntry.product')}</AxTableHeader>
                    <AxTableHeader>{l10n('purchaseOrderEntry.quantity')}</AxTableHeader>
                    <AxTableHeader align="right">{l10n('purchaseOrderEntry.unitPrice')}</AxTableHeader>
                    <AxTableHeader align="right">{l10n('purchaseOrderEntry.lineTotal')}</AxTableHeader>
                  </AxTableRow>
                </AxTableHead>
                <AxTableBody>
                  {po?.items?.map(item => (
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
              padding: 'var(--spacing-sm)',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
              <AxParagraph>{l10n('purchaseOrderEntry.subtotal')}:</AxParagraph>
              <AxParagraph>${po?.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
              <AxParagraph>{l10n('purchaseOrderEntry.tax')}:</AxParagraph>
              <AxParagraph>${po?.tax?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
              <AxParagraph>{l10n('purchaseOrderEntry.shipping')}:</AxParagraph>
              <AxParagraph>${po?.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 'var(--spacing-xs)',
                borderTop: '2px solid var(--color-border-default)',
              }}
            >
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>{l10n('purchaseOrderEntry.total')}:</AxParagraph>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                ${po?.total?.toFixed(2) || '0.00'}
              </AxParagraph>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSubStepContent = () => {
    switch (currentSubStep) {
      case 'supplier':
        return renderSupplierStep();
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
                  if (isCompleted) {
                    onSubStepChange(subStep.key);
                  }
                } else {
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

