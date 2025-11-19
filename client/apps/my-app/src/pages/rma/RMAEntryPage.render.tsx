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
import { useI18n } from '../../i18n/I18nProvider';
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

  const { l10n } = useI18n();

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <AxParagraph>{l10n('rma.loadingRMA')}</AxParagraph>
        </HeaderCard>
      </PageContainer>
    );
  }

  if (!rma) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <AxParagraph>{l10n('rma.notFound')}</AxParagraph>
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
                {l10n('rma.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {rma.id ? `RMA ${rma.rmaNumber || rma.id}` : l10n('rma.newRMA')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {rma.id ? l10n('rma.editRMA') : l10n('rma.createNew')}
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
                    {l10n('rma.customer')}
                  </AxParagraph>
                  <AxListbox
                    options={[
                      { value: null, label: l10n('rma.selectCustomer') },
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
                    {l10n('rma.orderNumber')}
                  </AxParagraph>
                  <AxListbox
                    options={[
                      { value: null, label: l10n('rma.selectOrder') },
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
                        {l10n('rma.customer')}
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
                        {l10n('rma.orderNumber')}
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
                {l10n('rma.table.status')}
              </AxParagraph>
              <AxListbox
                key={`status-${rma?.id || 'new'}-${rma?.status || 'DRAFT'}`}
                options={[
                  { value: 'DRAFT', label: l10n('rma.status.draft') },
                  { value: 'PENDING_APPROVAL', label: l10n('rma.status.pendingApproval') },
                  { value: 'APPROVED', label: l10n('rma.status.approved') },
                  { value: 'RECEIVED', label: l10n('rma.status.received') },
                  { value: 'PROCESSED', label: l10n('rma.status.processed') },
                  { value: 'CANCELLED', label: l10n('rma.status.cancelled') },
                ]}
                value={rma?.status || 'DRAFT'}
                onChange={(value: string | null) => {
                  if (value) {
                    onStatusChange(value as RMA['status']);
                  }
                }}
                placeholder={l10n('rma.selectStatus')}
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
                {l10n('rma.shopFloorControl')}
              </AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
        <FormSection>
          <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
            {l10n('rma.returnItems')}
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
                  <AxLabel>{l10n('rma.product')}</AxLabel>
                  <AxListbox
                    options={[
                      { value: null, label: l10n('rma.selectProduct') },
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
                  <AxLabel>{l10n('rma.quantity')}</AxLabel>
                  <AxInput
                    type="number"
                    value={quantity}
                    onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </AxFormGroup>
                <AxFormGroup>
                  <AxLabel>{l10n('rma.reason')}</AxLabel>
                  <AxInput
                    value={reason}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder={l10n('rma.reasonPlaceholder')}
                  />
                </AxFormGroup>
                <AxFormGroup>
                  <AxButton
                    variant="primary"
                    onClick={onAddItem}
                    disabled={!selectedProduct || !quantity || submitting}
                    style={{ width: '100%' }}
                  >
                    {l10n('rma.addItem')}
                  </AxButton>
                </AxFormGroup>
              </div>
            </div>
          )}

          {rma.items && rma.items.length > 0 ? (
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>{l10n('rma.product')}</AxTableHeader>
                  <AxTableHeader align="right">{l10n('rma.quantity')}</AxTableHeader>
                  <AxTableHeader align="right">{l10n('rma.table.returnedQty')}</AxTableHeader>
                  <AxTableHeader align="right">{l10n('rma.table.unitPrice')}</AxTableHeader>
                  <AxTableHeader align="right">{l10n('rma.table.lineTotal')}</AxTableHeader>
                  <AxTableHeader>{l10n('rma.reason')}</AxTableHeader>
                  {!readOnly && <AxTableHeader align="center">{l10n('generalLedger.table.actions')}</AxTableHeader>}
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
                          {l10n('rma.remove')}
                        </AxButton>
                      </AxTableCell>
                    )}
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          ) : (
            <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
              {l10n('rma.noItems')}
            </AxParagraph>
          )}
        </FormSection>

        <FormSection>
          <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
            {l10n('rma.financialInformation')}
          </AxHeading3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-sm)' }}>
            <AxFormGroup>
              <AxLabel>{l10n('rma.restockingFee')}</AxLabel>
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
              <AxLabel>{l10n('rma.notes')}</AxLabel>
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
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>{l10n('rma.subtotal')}</strong></AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>${rma.subtotal?.toFixed(2) || '0.00'}</strong></AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-xs)' }}>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>{l10n('rma.restockingFee')}:</strong></AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>-${restockingFee.toFixed(2)}</strong></AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-border-default)', paddingTop: 'var(--spacing-xs)', marginTop: 'var(--spacing-xs)' }}>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>{l10n('rma.totalRefund')}</strong></AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}><strong>${rma.total?.toFixed(2) || '0.00'}</strong></AxParagraph>
            </div>
          </div>
        </FormSection>

        {!readOnly && (
          <ButtonGroup>
            <AxButton variant="secondary" onClick={onNavigateToRMAs || onNavigateBack}>
              {l10n('rma.cancel')}
            </AxButton>
            <AxButton
              variant="primary"
              onClick={onSave}
              disabled={submitting}
            >
              {submitting ? l10n('rma.saving') : l10n('rma.save')}
            </AxButton>
          </ButtonGroup>
        )}
      </ContentCard>
    </PageContainer>
  );
}

