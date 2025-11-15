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
import styled from '@emotion/styled';
import { PurchaseOrderEntryStepProps, EntrySubStep } from './types';
import { useI18n } from '../../i18n/I18nProvider';

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  overflow: visible;
`;

const ItemsTable = styled.div`
  overflow-x: auto;
`;

const SubStepIndicator = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
`;

const SubStep = styled.div<{ $active: boolean; $completed: boolean }>`
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  text-align: center;
  border-radius: var(--radius-sm);
  background-color: ${props =>
    props.$active
      ? 'var(--color-primary)'
      : props.$completed
        ? 'var(--color-success)'
        : 'transparent'};
  color: ${props =>
    props.$active || props.$completed
      ? 'var(--color-text-inverse)'
      : 'var(--color-text-secondary)'};
  cursor: ${props => (props.$completed || props.$active ? 'pointer' : 'default')};
  font-size: var(--font-size-sm);
`;

const entrySubSteps: { key: EntrySubStep; label: string }[] = [
  { key: 'supplier', label: 'Supplier' },
  { key: 'products', label: 'Products' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'review', label: 'Review' },
];

export function PurchaseOrderEntryStepPage(props: PurchaseOrderEntryStepProps) {
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
  } = props;
  const { t } = useI18n();

  const isSubStepCompleted = (subStep: EntrySubStep) => {
    if (!po) return false;
    switch (subStep) {
      case 'supplier':
        return !!po.supplierId;
      case 'products':
        return po.items && po.items.length > 0;
      case 'shipping':
        return !!po.shippingAddressId && !!po.billingAddressId;
      case 'review':
        return !!po.supplierId && 
               po.items && po.items.length > 0 && 
               !!po.shippingAddressId && 
               !!po.billingAddressId;
      default:
        return false;
    }
  };

  const renderSupplierStep = () => {
    const vendorOptions = vendors.map(v => ({
      value: v.id!,
      label: v.companyName || `${v.lastName} ${v.firstName}` || v.email || v.id!,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('purchaseOrderEntry.selectSupplier')}</AxHeading3>
        {!po?.id && (
          <AxParagraph style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-warning)' }}>
            {t('purchaseOrderEntry.initializing')}
          </AxParagraph>
        )}
        <AxFormGroup>
          <AxLabel>{t('purchaseOrderEntry.supplier')}</AxLabel>
          <AxListbox
            options={vendorOptions}
            value={po?.supplierId || null}
            onChange={async value => {
              if (value && po?.id) {
                await onSupplierSelect(value);
              } else if (value && !po?.id) {
                alert(t('purchaseOrderEntry.notReady'));
              }
            }}
            placeholder={t('purchaseOrderEntry.selectSupplierPlaceholder')}
            fullWidth
            disabled={loading || !po?.id || readOnly}
          />
        </AxFormGroup>
        {po?.supplierId && (
          <AxParagraph style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
            {t('purchaseOrderEntry.supplierSelected')}
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
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('purchaseOrderEntry.addProducts')}</AxHeading3>

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
              <AxLabel>{t('purchaseOrderEntry.product')}</AxLabel>
              <AxListbox
                options={productOptions}
                value={selectedProduct}
                onChange={onSetSelectedProduct}
                placeholder={t('purchaseOrderEntry.selectProductPlaceholder')}
                fullWidth
                disabled={loading || readOnly}
              />
            </AxFormGroup>
          </div>
          <div style={{ width: '150px' }}>
            <AxFormGroup style={{ marginBottom: 0 }}>
              <AxLabel>{t('purchaseOrderEntry.quantity')}</AxLabel>
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
            {t('purchaseOrderEntry.add')}
          </AxButton>
        </div>

        <ItemsTable>
          <AxTable fullWidth>
            <AxTableHead>
              <AxTableRow>
                <AxTableHeader>{t('purchaseOrderEntry.product')}</AxTableHeader>
                <AxTableHeader>{t('purchaseOrderEntry.quantity')}</AxTableHeader>
                <AxTableHeader align="right">{t('purchaseOrderEntry.unitPrice')}</AxTableHeader>
                <AxTableHeader align="right">{t('purchaseOrderEntry.lineTotal')}</AxTableHeader>
                <AxTableHeader align="center">{t('purchaseOrderEntry.actions')}</AxTableHeader>
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
                        {t('purchaseOrderEntry.delete')}
                      </AxButton>
                    </AxTableCell>
                  </AxTableRow>
                ))
              ) : (
                <AxTableRow>
                  <AxTableCell colSpan={5} align="center">
                    <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                      {t('purchaseOrderEntry.noProducts')}
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
              marginTop: 'var(--spacing-lg)',
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>
                <strong>{t('purchaseOrderEntry.subtotal')}:</strong>
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
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('purchaseOrderEntry.shippingInformation')}</AxHeading3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>{t('purchaseOrderEntry.shippingAddress')}</AxLabel>
            <AxListbox
              options={addressOptions}
              value={shippingId}
              onChange={async value => {
                onSetShippingId(value);
                if (value && billingId) {
                  await onShippingInfoUpdate(value, billingId);
                }
              }}
              placeholder={t('purchaseOrderEntry.selectShippingAddress')}
              fullWidth
              disabled={loading || addressOptions.length === 0 || readOnly}
            />
            {addressOptions.length === 0 && (
              <AxParagraph
                style={{
                  marginTop: 'var(--spacing-xs)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {t('purchaseOrderEntry.noAddresses')}
              </AxParagraph>
            )}
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('purchaseOrderEntry.billingAddress')}</AxLabel>
            <AxListbox
              options={addressOptions}
              value={billingId}
              onChange={async value => {
                onSetBillingId(value);
                if (value && shippingId) {
                  await onShippingInfoUpdate(shippingId, value);
                }
              }}
              placeholder={t('purchaseOrderEntry.selectBillingAddress')}
              fullWidth
              disabled={loading || addressOptions.length === 0 || readOnly}
            />
            {addressOptions.length === 0 && (
              <AxParagraph
                style={{
                  marginTop: 'var(--spacing-xs)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {t('purchaseOrderEntry.noAddresses')}
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
          {t('purchaseOrderEntry.sameAddressNote')}
        </AxParagraph>
      </div>
    );
  };

  const renderReviewStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('purchaseOrderEntry.reviewOrder')}</AxHeading3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <AxFormGroup>
            <AxLabel>{t('purchaseOrderEntry.expectedDeliveryDate')}</AxLabel>
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
              fullWidth
            />
            <AxParagraph style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {t('purchaseOrderEntry.expectedDeliveryDateDescription')}
            </AxParagraph>
          </AxFormGroup>

          <div>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
              {t('purchaseOrderEntry.orderItems')}
            </AxParagraph>
            <ItemsTable>
              <AxTable fullWidth>
                <AxTableHead>
                  <AxTableRow>
                    <AxTableHeader>{t('purchaseOrderEntry.product')}</AxTableHeader>
                    <AxTableHeader>{t('purchaseOrderEntry.quantity')}</AxTableHeader>
                    <AxTableHeader align="right">{t('purchaseOrderEntry.unitPrice')}</AxTableHeader>
                    <AxTableHeader align="right">{t('purchaseOrderEntry.lineTotal')}</AxTableHeader>
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
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>{t('purchaseOrderEntry.subtotal')}:</AxParagraph>
              <AxParagraph>${po?.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>{t('purchaseOrderEntry.tax')}:</AxParagraph>
              <AxParagraph>${po?.tax?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>{t('purchaseOrderEntry.shipping')}:</AxParagraph>
              <AxParagraph>${po?.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 'var(--spacing-sm)',
                borderTop: '2px solid var(--color-border-default)',
              }}
            >
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>{t('purchaseOrderEntry.total')}:</AxParagraph>
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
    <StepContent>
      <SubStepIndicator>
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

