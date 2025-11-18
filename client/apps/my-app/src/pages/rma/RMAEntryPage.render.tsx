import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxListbox,
  AxInput,
  AxFormGroup,
  AxLabel,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { RMA, RMAItem } from '../../api/rmaApi';
import { Customer } from '../../api/customerApi';
import { Order } from '../../api/orderApi';
import { Product } from '../../api/productApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  ContentCard,
  FormSection,
  ButtonGroup,
} from './RMAEntryPage.styles';

const COMPONENT_NAME = 'RMAEntryPage';

interface RMAEntryPageRenderProps {
  rma: RMA | null;
  customers: Customer[];
  orders: Order[];
  products: Product[];
  loading: boolean;
  submitting: boolean;
  selectedOrderId: string | null;
  selectedCustomerId: string | null;
  selectedProduct: string | null;
  quantity: number;
  returnedQuantity: number;
  reason: string;
  restockingFee: number;
  notes: string;
  readOnly: boolean;
  onNavigateToRMAs?: () => void;
  onNavigateBack?: () => void;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
  onOrderSelect: (orderId: string | null) => void;
  onCustomerSelect: (customerId: string | null) => void;
  onProductSelect: (productId: string | null) => void;
  onQuantityChange: (quantity: number) => void;
  onReasonChange: (reason: string) => void;
  onRestockingFeeChange: (fee: number) => void;
  onNotesChange: (notes: string) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  onUpdateReturnedQuantity: (itemId: string, newQuantity: number) => void;
  onSave: () => void;
  onStatusChange: (status: RMA['status']) => void;
  getProductName: (productId?: string) => string;
}

export function RMAEntryPageRender(props: RMAEntryPageRenderProps) {
  const {
    rma,
    customers,
    orders,
    products,
    loading,
    submitting,
    selectedOrderId,
    selectedCustomerId,
    selectedProduct,
    quantity,
    returnedQuantity,
    reason,
    restockingFee,
    notes,
    readOnly,
    onNavigateToRMAs,
    onNavigateBack,
    onNavigateToShopFloorControl,
    onOrderSelect,
    onCustomerSelect,
    onProductSelect,
    onQuantityChange,
    onReasonChange,
    onRestockingFeeChange,
    onNotesChange,
    onAddItem,
    onRemoveItem,
    onUpdateReturnedQuantity,
    onSave,
    onStatusChange,
    getProductName,
  } = props;

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <AxParagraph>Loading RMA...</AxParagraph>
        </HeaderCard>
      </PageContainer>
    );
  }

  if (!rma) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <AxParagraph>RMA not found</AxParagraph>
        </HeaderCard>
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
                ← Back
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {rma.id ? `RMA ${rma.rmaNumber || rma.id}` : 'New RMA'}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {rma.id ? 'Edit RMA' : 'Create new return merchandise authorization'}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            {!readOnly && (
              <>
                <div style={{ 
                  padding: 'var(--spacing-sm)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                  minWidth: '180px',
                  maxWidth: '220px'
                }}>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    Customer
                  </AxParagraph>
                  <AxListbox
                    options={[
                      { value: null, label: 'Select Customer' },
                      ...customers.map(customer => ({
                        value: customer.id || '',
                        label: customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email,
                      })),
                    ]}
                    value={selectedCustomerId}
                    onChange={onCustomerSelect}
                    disabled={readOnly}
                    style={{ width: '100%', maxWidth: '220px' }}
                  />
                </div>
                <div style={{ 
                  padding: 'var(--spacing-sm)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                  minWidth: '180px',
                  maxWidth: '220px'
                }}>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    Order Number
                  </AxParagraph>
                  <AxListbox
                    options={[
                      { value: null, label: 'Select Order' },
                      ...orders.map(order => {
                        const orderCustomer = customers.find(c => c.id === order.customerId);
                        const customerName = orderCustomer 
                          ? (orderCustomer.companyName || `${orderCustomer.lastName} ${orderCustomer.firstName}` || orderCustomer.email)
                          : 'N/A';
                        return {
                          value: order.id || '',
                          label: `${order.orderNumber || order.id}`,
                        };
                      }),
                    ]}
                    value={selectedOrderId}
                    onChange={onOrderSelect}
                    disabled={readOnly}
                    style={{ width: '100%', maxWidth: '220px' }}
                  />
                </div>
              </>
            )}
            {readOnly && (selectedCustomerId || selectedOrderId) && (
              <>
                {selectedCustomerId && (() => {
                  const customer = customers.find(c => c.id === selectedCustomerId);
                  return customer ? (
                    <div style={{ 
                      padding: 'var(--spacing-sm)', 
                      backgroundColor: 'var(--color-background-secondary)', 
                      borderRadius: 'var(--radius-md)',
                      minWidth: '180px',
                      maxWidth: '220px'
                    }}>
                      <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                        Customer
                      </AxParagraph>
                      <AxParagraph style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-tight)' }}>
                        {customer.companyName || `${customer.lastName} ${customer.firstName}` || customer.email}
                      </AxParagraph>
                    </div>
                  ) : null;
                })()}
                {selectedOrderId && (() => {
                  const order = orders.find(o => o.id === selectedOrderId);
                  return order ? (
                    <div style={{ 
                      padding: 'var(--spacing-sm)', 
                      backgroundColor: 'var(--color-background-secondary)', 
                      borderRadius: 'var(--radius-md)',
                      minWidth: '180px',
                      maxWidth: '220px'
                    }}>
                      <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                        Order Number
                      </AxParagraph>
                      <AxParagraph style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-tight)' }}>
                        {order.orderNumber || order.id}
                      </AxParagraph>
                    </div>
                  ) : null;
                })()}
              </>
            )}
            <div style={{ 
              padding: 'var(--spacing-sm)', 
              backgroundColor: 'var(--color-background-secondary)', 
              borderRadius: 'var(--radius-md)',
              minWidth: '180px',
              maxWidth: '220px'
            }}>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                Status
              </AxParagraph>
              <AxListbox
                key={`status-${rma?.id || 'new'}-${rma?.status || 'DRAFT'}`}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
                  { value: 'APPROVED', label: 'Approved' },
                  { value: 'RECEIVED', label: 'Received' },
                  { value: 'PROCESSED', label: 'Processed' },
                  { value: 'CANCELLED', label: 'Cancelled' },
                ]}
                value={rma?.status || 'DRAFT'}
                onChange={(value: string | null) => {
                  if (value) {
                    onStatusChange(value as RMA['status']);
                  }
                }}
                placeholder="Select Status"
                fullWidth
                disabled={loading || readOnly || submitting}
              />
            </div>
            {rma?.id && onNavigateToShopFloorControl && (
              <AxButton
                variant="primary"
                onClick={() => onNavigateToShopFloorControl(rma.id!)}
                style={{ minWidth: 'auto', whiteSpace: 'nowrap', height: 'fit-content' }}
              >
                Shop Floor Control
              </AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
        <FormSection>
          <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
            Return Items
          </AxHeading3>
          
          {!readOnly && (
            <div style={{ 
              padding: 'var(--spacing-sm)', 
              backgroundColor: 'var(--color-background-secondary)', 
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-sm)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-sm)', alignItems: 'end' }}>
                <AxFormGroup>
                  <AxLabel>Product</AxLabel>
                  <AxListbox
                    options={[
                      { value: null, label: 'Select Product' },
                      ...products.map(product => ({
                        value: product.id || '',
                        label: product.productName || product.productCode,
                      })),
                    ]}
                    value={selectedProduct}
                    onChange={onProductSelect}
                  />
                </AxFormGroup>
                <AxFormGroup>
                  <AxLabel>Quantity</AxLabel>
                  <AxInput
                    type="number"
                    value={quantity}
                    onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </AxFormGroup>
                <AxFormGroup>
                  <AxLabel>Reason</AxLabel>
                  <AxInput
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Reason for return"
                  />
                </AxFormGroup>
                <AxFormGroup>
                  <AxButton
                    variant="primary"
                    onClick={onAddItem}
                    disabled={!selectedProduct || !quantity || submitting}
                    style={{ width: '100%' }}
                  >
                    Add Item
                  </AxButton>
                </AxFormGroup>
              </div>
            </div>
          )}

          {rma.items && rma.items.length > 0 ? (
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Product</AxTableHeader>
                  <AxTableHeader align="right">Quantity</AxTableHeader>
                  <AxTableHeader align="right">Returned Qty</AxTableHeader>
                  <AxTableHeader align="right">Unit Price</AxTableHeader>
                  <AxTableHeader align="right">Line Total</AxTableHeader>
                  <AxTableHeader>Reason</AxTableHeader>
                  {!readOnly && <AxTableHeader align="center">Actions</AxTableHeader>}
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {rma.items.map((item) => (
                  <AxTableRow key={item.id}>
                    <AxTableCell>{getProductName(item.productId)}</AxTableCell>
                    <AxTableCell align="right">{item.quantity || 0}</AxTableCell>
                    <AxTableCell align="right">
                      {readOnly ? (
                        item.returnedQuantity || 0
                      ) : (
                        <AxInput
                          type="number"
                          value={item.returnedQuantity || 0}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0;
                            if (item.id) {
                              onUpdateReturnedQuantity(item.id, newQty);
                            }
                          }}
                          min="0"
                          max={item.quantity}
                          style={{ width: '80px' }}
                        />
                      )}
                    </AxTableCell>
                    <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                    <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                    <AxTableCell>{item.reason || '-'}</AxTableCell>
                    {!readOnly && (
                      <AxTableCell align="center">
                        <AxButton
                          variant="danger"
                          size="small"
                          onClick={() => item.id && onRemoveItem(item.id)}
                          disabled={submitting}
                        >
                          Remove
                        </AxButton>
                      </AxTableCell>
                    )}
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          ) : (
            <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
              No items added yet
            </AxParagraph>
          )}
        </FormSection>

        <FormSection>
          <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
            Financial Information
          </AxHeading3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-sm)' }}>
            <AxFormGroup>
              <AxLabel>Restocking Fee</AxLabel>
              <AxInput
                type="number"
                value={restockingFee}
                onChange={(e) => onRestockingFeeChange(parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
                step="0.01"
              />
            </AxFormGroup>
            <AxFormGroup>
              <AxLabel>Notes</AxLabel>
              <AxInput
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                disabled={readOnly}
                multiline
                rows={3}
              />
            </AxFormGroup>
          </div>
          <div style={{ 
            marginTop: 'var(--spacing-sm)', 
            padding: 'var(--spacing-sm)', 
            backgroundColor: 'var(--color-background-secondary)', 
            borderRadius: 'var(--radius-md)',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>Subtotal:</strong></AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>${rma.subtotal?.toFixed(2) || '0.00'}</strong></AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>Restocking Fee:</strong></AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>-${restockingFee.toFixed(2)}</strong></AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-border-default)', paddingTop: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>Total Refund:</strong></AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>${rma.total?.toFixed(2) || '0.00'}</strong></AxParagraph>
            </div>
          </div>
        </FormSection>

        {!readOnly && (
          <ButtonGroup>
            <AxButton variant="secondary" onClick={onNavigateToRMAs || onNavigateBack}>
              Cancel
            </AxButton>
            <AxButton
              variant="primary"
              onClick={onSave}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save RMA'}
            </AxButton>
          </ButtonGroup>
        )}
      </ContentCard>
    </PageContainer>
  );
}

