import { useState, useEffect } from 'react';
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
import { useI18n } from '../../i18n/I18nProvider';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchOrders, Order } from '../../api/orderApi';
import { fetchActiveProducts, Product } from '../../api/productApi';
import {
  createRMA,
  updateRMA,
  addRMAItem,
  updateRMAItemQuantity,
  updateRMAItemReturnedQuantity,
  removeRMAItem,
  fetchRMAById,
  RMA,
  RMAItem,
} from '../../api/rmaApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'RMAEntryPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1;
`;

const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const ContentCard = styled(AxCard)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg) !important;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--color-border-default);
  flex-shrink: 0;
`;

interface RMAEntryPageProps {
  onNavigateToRMAs?: () => void;
  rmaIdToEdit?: string | null;
  onNavigateBack?: () => void;
  readOnly?: boolean;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
}

export function RMAEntryPage(props: RMAEntryPageProps = {}) {
  const { onNavigateToRMAs, rmaIdToEdit, onNavigateBack, readOnly = false, onNavigateToShopFloorControl } = props;
  const { t } = useI18n();
  const [rma, setRma] = useState<RMA | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [returnedQuantity, setReturnedQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');
  const [restockingFee, setRestockingFee] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    loadCustomers();
    loadOrders();
    loadProducts();
    if (rmaIdToEdit) {
      loadRMA(rmaIdToEdit);
    } else {
      // Initialize new RMA
      setRma({
        status: 'DRAFT',
        items: [],
        subtotal: 0,
        tax: 0,
        restockingFee: 0,
        total: 0,
      });
    }
  }, [rmaIdToEdit]);

  const loadRMA = async (id: string) => {
    try {
      setLoading(true);
      const rmaData = await fetchRMAById(id);
      setRma(rmaData);
      setSelectedOrderId(rmaData.orderId || null);
      setSelectedCustomerId(rmaData.customerId || null);
      setRestockingFee(rmaData.restockingFee || 0);
      setNotes(rmaData.notes || '');
    } catch (err) {
      console.error('Error loading RMA:', err);
      alert(err instanceof Error ? err.message : 'Failed to load RMA');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const customersData = await fetchCustomers();
      setCustomers(customersData);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadOrders = async () => {
    try {
      const ordersData = await fetchOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const productsData = await fetchActiveProducts();
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleOrderSelect = (orderId: string | null) => {
    setSelectedOrderId(orderId);
    if (orderId && rma) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const updatedRMA = {
          ...rma,
          orderId: orderId,
          orderNumber: order.orderNumber,
          customerId: order.customerId,
        };
        setRma(updatedRMA);
        setSelectedCustomerId(order.customerId || null);
      }
    }
  };

  const handleCustomerSelect = (customerId: string | null) => {
    setSelectedCustomerId(customerId);
    if (rma) {
      setRma({ ...rma, customerId: customerId || undefined });
    }
  };

  const handleAddItem = async () => {
    if (!rma || !selectedProduct || !quantity) return;

    try {
      setSubmitting(true);
      let updatedRMA: RMA;
      
      if (rma.id) {
        updatedRMA = await addRMAItem(rma.id, selectedProduct, quantity, reason);
      } else {
        // Create RMA first if it doesn't exist
        const newRMA = await createRMA({
          ...rma,
          orderId: selectedOrderId || undefined,
          customerId: selectedCustomerId || undefined,
          items: [
            ...(rma.items || []),
            {
              productId: selectedProduct,
              quantity: quantity,
              returnedQuantity: returnedQuantity,
              reason: reason,
            },
          ],
        });
        updatedRMA = newRMA;
        setRma(updatedRMA);
      }
      
      setRma(updatedRMA);
      setSelectedProduct(null);
      setQuantity(1);
      setReturnedQuantity(1);
      setReason('');
    } catch (err) {
      console.error('Error adding item:', err);
      alert(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!rma?.id || !itemId) return;

    try {
      setSubmitting(true);
      const updatedRMA = await removeRMAItem(rma.id, itemId);
      setRma(updatedRMA);
    } catch (err) {
      console.error('Error removing item:', err);
      alert(err instanceof Error ? err.message : 'Failed to remove item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReturnedQuantity = async (itemId: string, newQuantity: number) => {
    if (!rma?.id || !itemId) return;

    try {
      setSubmitting(true);
      const updatedRMA = await updateRMAItemReturnedQuantity(rma.id, itemId, newQuantity);
      setRma(updatedRMA);
    } catch (err) {
      console.error('Error updating returned quantity:', err);
      alert(err instanceof Error ? err.message : 'Failed to update quantity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    if (!rma) return;

    try {
      setSubmitting(true);
      const updatedRMA = {
        ...rma,
        orderId: selectedOrderId || undefined,
        customerId: selectedCustomerId || undefined,
        restockingFee: restockingFee,
        notes: notes,
      };

      let savedRMA: RMA;
      if (rma.id) {
        savedRMA = await updateRMA(rma.id, updatedRMA);
      } else {
        savedRMA = await createRMA(updatedRMA);
      }
      
      setRma(savedRMA);
      alert('RMA saved successfully');
      if (onNavigateToRMAs) {
        onNavigateToRMAs();
      }
    } catch (err) {
      console.error('Error saving RMA:', err);
      alert(err instanceof Error ? err.message : 'Failed to save RMA');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: RMA['status']) => {
    if (!rma?.id || !newStatus) return;

    try {
      setSubmitting(true);
      const updatedRMA = await updateRMA(rma.id, { ...rma, status: newStatus });
      setRma(updatedRMA);
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const getProductName = (productId?: string) => {
    if (!productId) return 'N/A';
    const product = products.find(p => p.id === productId);
    return product ? (product.productName || product.productCode) : productId;
  };

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
                    onChange={handleCustomerSelect}
                    disabled={readOnly}
                    fullWidth
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
                    onChange={handleOrderSelect}
                    disabled={readOnly}
                    fullWidth
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
                    if (rma?.id) {
                      handleStatusChange(value as RMA['status']);
                    } else {
                      // Update local state for new RMA
                      setRma({ ...rma, status: value as RMA['status'] });
                    }
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
                    onChange={setSelectedProduct}
                  />
                </AxFormGroup>
                <AxFormGroup>
                  <AxLabel>Quantity</AxLabel>
                  <AxInput
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </AxFormGroup>
                <AxFormGroup>
                  <AxLabel>Reason</AxLabel>
                  <AxInput
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Reason for return"
                  />
                </AxFormGroup>
                <AxFormGroup>
                  <AxButton
                    variant="primary"
                    onClick={handleAddItem}
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
                              handleUpdateReturnedQuantity(item.id, newQty);
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
                          onClick={() => item.id && handleRemoveItem(item.id)}
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
                onChange={(e) => setRestockingFee(parseFloat(e.target.value) || 0)}
                disabled={readOnly}
                min="0"
                step="0.01"
              />
            </AxFormGroup>
            <AxFormGroup>
              <AxLabel>Notes</AxLabel>
              <AxInput
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              onClick={handleSave}
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

