import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxInput,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
  AxListbox,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { RMA, RMAItem } from '../../api/rmaApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  ContentCard,
  FormSection,
  TableWrapper,
  ButtonGroup,
  InfoBox,
  StatusBadge,
} from './ShopFloorControlPage.styles';

const COMPONENT_NAME = 'ShopFloorControlPage';

interface ShopFloorControlPageRenderProps {
  rma: RMA;
  loading: boolean;
  error: string | null;
  submitting: boolean;
  canMarkAsReceived: boolean;
  canMarkAsProcessed: boolean;
  onNavigateBack?: () => void;
  backButtonLabel?: string;
  onUpdateReturnedQuantity: (itemId: string, returnedQuantity: number) => void;
  onUpdateItemCondition: (itemId: string, condition: string) => void;
  onMarkAsReceived: () => void;
  onMarkAsProcessed: () => void;
  getProductName: (productId?: string) => string;
}

export function ShopFloorControlPageRender(props: ShopFloorControlPageRenderProps) {
  const {
    rma,
    loading,
    error,
    submitting,
    canMarkAsReceived,
    canMarkAsProcessed,
    onNavigateBack,
    backButtonLabel = '← Back',
    onUpdateReturnedQuantity,
    onUpdateItemCondition,
    onMarkAsReceived,
    onMarkAsProcessed,
    getProductName,
  } = props;

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large">
          <AxParagraph>Loading shop floor control data...</AxParagraph>
        </ContentCard>
      </PageContainer>
    );
  }

  if (error || !rma) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large">
          <AxParagraph style={{ color: 'var(--color-danger)' }}>
            {error || 'RMA not found'}
          </AxParagraph>
          {onNavigateBack && (
            <AxButton variant="secondary" onClick={onNavigateBack} style={{ marginTop: 'var(--spacing-md)' }}>
              ← Back
            </AxButton>
          )}
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
                Shop Floor Control - RMA {rma.rmaNumber || rma.id}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Track receipt and processing of returned items
              </AxParagraph>
            </div>
          </HeaderLeft>
          <div>
            <StatusBadge status={rma.status || 'DRAFT'}>
              {rma.status || 'DRAFT'}
            </StatusBadge>
          </div>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
        <FormSection>
          <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
            RMA Information
          </AxHeading3>
          <InfoBox>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Customer
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  {rma.customerName || 'N/A'}
                </AxParagraph>
              </div>
              <div>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  Order Number
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  {rma.orderNumber || 'N/A'}
                </AxParagraph>
              </div>
              <div>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  RMA Date
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  {rma.rmaDate ? new Date(rma.rmaDate).toLocaleDateString() : 'N/A'}
                </AxParagraph>
              </div>
              {rma.receivedDate && (
                <div>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    Received Date
                  </AxParagraph>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                    {new Date(rma.receivedDate).toLocaleDateString()}
                  </AxParagraph>
                </div>
              )}
            </div>
          </InfoBox>
        </FormSection>

        <FormSection>
          <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
            Returned Items Processing
          </AxHeading3>
          
          {rma.items && rma.items.length > 0 ? (
            <TableWrapper>
              <AxTable fullWidth>
                <AxTableHead>
                  <AxTableRow>
                    <AxTableHeader>Product</AxTableHeader>
                    <AxTableHeader align="right">Requested Qty</AxTableHeader>
                    <AxTableHeader align="right">Returned Qty</AxTableHeader>
                    <AxTableHeader>Condition</AxTableHeader>
                    <AxTableHeader>Reason</AxTableHeader>
                    <AxTableHeader align="right">Unit Price</AxTableHeader>
                    <AxTableHeader align="right">Line Total</AxTableHeader>
                  </AxTableRow>
                </AxTableHead>
                <AxTableBody>
                  {rma.items.map((item) => (
                    <AxTableRow key={item.id}>
                      <AxTableCell>{getProductName(item.productId)}</AxTableCell>
                      <AxTableCell align="right">{item.quantity || 0}</AxTableCell>
                      <AxTableCell align="right">
                        <AxInput
                          type="number"
                          value={item.returnedQuantity || 0}
                          onChange={(e) => {
                            const newQty = parseInt(e.target.value) || 0;
                            if (item.id && newQty >= 0 && newQty <= (item.quantity || 0)) {
                              onUpdateReturnedQuantity(item.id, newQty);
                            }
                          }}
                          min="0"
                          max={item.quantity}
                          style={{ width: '80px' }}
                          disabled={submitting || rma.status === 'PROCESSED' || rma.status === 'CANCELLED'}
                        />
                      </AxTableCell>
                      <AxTableCell style={{ position: 'relative', overflow: 'visible' }}>
                        <AxListbox
                          options={[
                            { value: 'NEW', label: 'New' },
                            { value: 'LIKE_NEW', label: 'Like New' },
                            { value: 'GOOD', label: 'Good' },
                            { value: 'FAIR', label: 'Fair' },
                            { value: 'POOR', label: 'Poor' },
                            { value: 'DAMAGED', label: 'Damaged' },
                          ]}
                          value={item.condition || null}
                          onChange={(value) => {
                            console.log('Condition onChange:', { itemId: item.id, value, type: typeof value });
                            if (item.id && value && typeof value === 'string') {
                              onUpdateItemCondition(item.id, value);
                            } else if (item.id && value && Array.isArray(value) && value.length > 0) {
                              // Handle array case (shouldn't happen with single select, but just in case)
                              onUpdateItemCondition(item.id, value[0]);
                            }
                          }}
                          placeholder="Select Condition"
                          disabled={submitting || rma.status === 'PROCESSED' || rma.status === 'CANCELLED'}
                          fullWidth
                        />
                      </AxTableCell>
                      <AxTableCell>{item.reason || '-'}</AxTableCell>
                      <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                      <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                    </AxTableRow>
                  ))}
                </AxTableBody>
              </AxTable>
            </TableWrapper>
          ) : (
            <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
              No items to process
            </AxParagraph>
          )}
        </FormSection>

        {rma.notes && (
          <FormSection>
            <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
              Notes
            </AxHeading3>
            <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
              {rma.notes}
            </AxParagraph>
          </FormSection>
        )}

        <ButtonGroup>
          {canMarkAsReceived && (
            <AxButton
              variant="primary"
              onClick={onMarkAsReceived}
              disabled={submitting}
            >
              Mark as Received
            </AxButton>
          )}
          {canMarkAsProcessed && (
            <AxButton
              variant="primary"
              onClick={onMarkAsProcessed}
              disabled={submitting}
            >
              Mark as Processed
            </AxButton>
          )}
          {onNavigateBack && (
            <AxButton variant="secondary" onClick={onNavigateBack}>
              {backButtonLabel}
            </AxButton>
          )}
        </ButtonGroup>
      </ContentCard>
    </PageContainer>
  );
}

