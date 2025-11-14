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
import styled from 'styled-components';
import { OrderEntryStepProps, EntrySubStep } from './types';

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
  backgroundColor: var(--color-background-secondary);
  borderRadius: var(--radius-md);
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
  { key: 'customer', label: 'Customer' },
  { key: 'products', label: 'Products' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'review', label: 'Review' },
];

export function OrderEntryStepPage(props: OrderEntryStepProps) {
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
  } = props;

  const isSubStepCompleted = (subStep: EntrySubStep) => {
    if (!order) return false;
    switch (subStep) {
      case 'customer':
        return !!order.customerId;
      case 'products':
        return order.items && order.items.length > 0;
      case 'shipping':
        return !!order.shippingAddressId && !!order.billingAddressId;
      case 'review':
        return false;
      default:
        return false;
    }
  };

  const renderCustomerStep = () => {
    const customerOptions = customers.map(c => ({
      value: c.id!,
      label: c.companyName || `${c.lastName} ${c.firstName}` || c.email || c.id!,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>Select Customer</AxHeading3>
        {!order?.id && (
          <AxParagraph style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-warning)' }}>
            Initializing order... Please wait.
          </AxParagraph>
        )}
        <AxFormGroup>
          <AxLabel>Customer</AxLabel>
          <AxListbox
            options={customerOptions}
            value={order?.customerId || null}
            onChange={async value => {
              if (value && order?.id) {
                await onCustomerSelect(value);
              } else if (value && !order?.id) {
                alert('Order is not ready yet. Please wait a moment and try again.');
              }
            }}
            placeholder="Select a customer"
            fullWidth
            disabled={loading || !order?.id}
          />
        </AxFormGroup>
        {order?.customerId && (
          <AxParagraph style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
            Customer selected. You can proceed to the next step.
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
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>Add Products</AxHeading3>

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
              <AxLabel>Product</AxLabel>
              <AxListbox
                options={productOptions}
                value={selectedProduct}
                onChange={onSetSelectedProduct}
                placeholder="Select a product"
                fullWidth
                disabled={loading}
              />
            </AxFormGroup>
          </div>
          <div style={{ width: '150px' }}>
            <AxFormGroup style={{ marginBottom: 0 }}>
              <AxLabel>Quantity</AxLabel>
              <AxInput
                type="number"
                min="1"
                value={quantity}
                onChange={e => onSetQuantity(parseInt(e.target.value) || 1)}
                disabled={loading}
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
            disabled={!selectedProduct || loading}
          >
            Add
          </AxButton>
        </div>

        <ItemsTable>
          <AxTable fullWidth>
            <AxTableHead>
              <AxTableRow>
                <AxTableHeader>Product</AxTableHeader>
                <AxTableHeader>Quantity</AxTableHeader>
                <AxTableHeader align="right">Unit Price</AxTableHeader>
                <AxTableHeader align="right">Line Total</AxTableHeader>
                <AxTableHeader align="center">Actions</AxTableHeader>
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
                          disabled={loading || (item.quantity || 1) <= 1}
                        >
                          -
                        </AxButton>
                        <span style={{ minWidth: '40px', textAlign: 'center' }}>{item.quantity || 0}</span>
                        <AxButton
                          variant="secondary"
                          size="small"
                          onClick={() => onUpdateQuantity(item.id!, (item.quantity || 1) + 1)}
                          disabled={loading}
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
                        Delete
                      </AxButton>
                    </AxTableCell>
                  </AxTableRow>
                ))
              ) : (
                <AxTableRow>
                  <AxTableCell colSpan={5} align="center">
                    <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                      No products added yet
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
                <strong>Subtotal:</strong>
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
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>Shipping Information</AxHeading3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>Shipping Address</AxLabel>
            <AxListbox
              options={addressOptions}
              value={shippingId}
              onChange={async value => {
                onSetShippingId(value);
                if (value && billingId) {
                  await onShippingInfoUpdate(value, billingId);
                }
              }}
              placeholder="Select shipping address"
              fullWidth
              disabled={loading || addressOptions.length === 0}
            />
            {addressOptions.length === 0 && (
              <AxParagraph
                style={{
                  marginTop: 'var(--spacing-xs)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                No addresses found for this customer. Please add addresses in the customer management page.
              </AxParagraph>
            )}
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>Billing Address</AxLabel>
            <AxListbox
              options={addressOptions}
              value={billingId}
              onChange={async value => {
                onSetBillingId(value);
                if (value && shippingId) {
                  await onShippingInfoUpdate(shippingId, value);
                }
              }}
              placeholder="Select billing address (can be same as shipping)"
              fullWidth
              disabled={loading || addressOptions.length === 0}
            />
            {addressOptions.length === 0 && (
              <AxParagraph
                style={{
                  marginTop: 'var(--spacing-xs)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                No addresses found for this customer. Please add addresses in the customer management page.
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
          You can select the same address for both shipping and billing.
        </AxParagraph>
      </div>
    );
  };

  const renderReviewStep = () => {
    const shippingAddress = addresses.find(a => a.id === order?.shippingAddressId);
    const billingAddress = addresses.find(a => a.id === order?.billingAddressId);

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>Review Order</AxHeading3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
                Shipping Address
              </AxParagraph>
              {shippingAddress ? (
                <AxParagraph>
                  {shippingAddress.streetAddress1}
                  <br />
                  {shippingAddress.streetAddress2 && (
                    <>
                      {shippingAddress.streetAddress2}
                      <br />
                    </>
                  )}
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                  <br />
                  {shippingAddress.country}
                </AxParagraph>
              ) : (
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>Not selected</AxParagraph>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
                Billing Address
              </AxParagraph>
              {billingAddress ? (
                <AxParagraph>
                  {billingAddress.streetAddress1}
                  <br />
                  {billingAddress.streetAddress2 && (
                    <>
                      {billingAddress.streetAddress2}
                      <br />
                    </>
                  )}
                  {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                  <br />
                  {billingAddress.country}
                </AxParagraph>
              ) : (
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>Not selected</AxParagraph>
              )}
            </div>
          </div>

          <div>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
              Order Items
            </AxParagraph>
            <ItemsTable>
              <AxTable fullWidth>
                <AxTableHead>
                  <AxTableRow>
                    <AxTableHeader>Product</AxTableHeader>
                    <AxTableHeader>Quantity</AxTableHeader>
                    <AxTableHeader align="right">Unit Price</AxTableHeader>
                    <AxTableHeader align="right">Line Total</AxTableHeader>
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
              <AxParagraph>Subtotal:</AxParagraph>
              <AxParagraph>${order?.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>Tax:</AxParagraph>
              <AxParagraph>${order?.tax?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>Shipping:</AxParagraph>
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
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>Total:</AxParagraph>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
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
                if (isCompleted || isActive) {
                  onSubStepChange(subStep.key);
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

