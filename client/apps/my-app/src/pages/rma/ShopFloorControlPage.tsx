import { useState, useEffect } from 'react';
import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxInput,
  AxFormGroup,
  AxLabel,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
  AxListbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchRMAById, updateRMA, updateRMAItemReturnedQuantity, updateRMAItemCondition, RMA, RMAItem } from '../../api/rmaApi';
import { fetchActiveProducts, Product } from '../../api/productApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'ShopFloorControlPage';

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
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: 0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const ContentCard = styled(AxCard)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg) !important;
  position: relative;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const TableWrapper = styled.div`
  position: relative;
  overflow: visible !important;
  
  table {
    overflow: visible !important;
  }
  
  td {
    overflow: visible !important;
  }
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

const InfoBox = styled.div`
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-md);
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  background-color: ${props => {
    switch (props.status) {
      case 'RECEIVED': return 'var(--color-info-light)';
      case 'PROCESSED': return 'var(--color-success-light)';
      case 'APPROVED': return 'var(--color-warning-light)';
      default: return 'var(--color-background-secondary)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'RECEIVED': return 'var(--color-info-dark)';
      case 'PROCESSED': return 'var(--color-success-dark)';
      case 'APPROVED': return 'var(--color-warning-dark)';
      default: return 'var(--color-text-primary)';
    }
  }};
`;

interface ShopFloorControlPageProps {
  rmaId: string;
  onNavigateBack?: () => void;
  backButtonLabel?: string;
}

export function ShopFloorControlPage({ rmaId, onNavigateBack, backButtonLabel = '← Back' }: ShopFloorControlPageProps) {
  const { t } = useI18n();
  const [rma, setRma] = useState<RMA | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [rmaId]);

  // Listen for RMA updates via WebSocket
  useWebSocket({
    onRMAUpdate: (updatedRMA: RMA) => {
      // Only update if it's the RMA we're currently viewing
      if (updatedRMA.id === rmaId) {
        console.log('Received RMA update via WebSocket:', updatedRMA);
        // Update state with the latest data from server
        setRma(updatedRMA);
      }
    },
    enabled: !!rmaId,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rmaData, productsData] = await Promise.all([
        fetchRMAById(rmaId),
        fetchActiveProducts(),
      ]);
      setRma(rmaData);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading shop floor control data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId?: string) => {
    if (!productId) return 'N/A';
    const product = products.find(p => p.id === productId);
    return product?.productName || product?.productCode || 'Unknown Product';
  };

  const handleUpdateReturnedQuantity = async (itemId: string, returnedQuantity: number) => {
    if (!rma?.id) return;
    
    try {
      setSubmitting(true);
      const updatedRMA = await updateRMAItemReturnedQuantity(rma.id, itemId, returnedQuantity);
      setRma(updatedRMA);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update returned quantity');
      console.error('Error updating returned quantity:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateItemCondition = async (itemId: string, condition: string) => {
    if (!rma?.id || !itemId || !condition) {
      console.error('Missing required parameters:', { rmaId: rma?.id, itemId, condition });
      return;
    }

    console.log('Updating condition:', { rmaId: rma.id, itemId, condition });

    try {
      setSubmitting(true);
      
      // Optimistic update - update UI immediately
      if (rma.items) {
        const updatedItems = rma.items.map(item => 
          item.id === itemId ? { ...item, condition } : item
        );
        setRma({ ...rma, items: updatedItems });
        console.log('Optimistic update applied, condition set to:', condition);
      }
      
      // Send update to server (WebSocket will confirm the update)
      console.log('Sending API request to update condition...');
      const updatedRMA = await updateRMAItemCondition(rma.id, itemId, condition);
      console.log('API request successful, received updated RMA:', updatedRMA);
      
      // Also update state with the response (in case WebSocket is delayed)
      if (updatedRMA) {
        setRma(updatedRMA);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item condition');
      console.error('Error updating item condition:', err);
      
      // Revert optimistic update on error - reload from server
      try {
        const currentRMA = await fetchRMAById(rma.id);
        setRma(currentRMA);
      } catch (reloadErr) {
        console.error('Error reloading RMA after failed update:', reloadErr);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsReceived = async () => {
    if (!rma?.id) return;

    try {
      setSubmitting(true);
      const updatedRMA = await updateRMA(rma.id, {
        ...rma,
        status: 'RECEIVED',
        receivedDate: new Date().toISOString(),
      });
      setRma(updatedRMA);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as received');
      console.error('Error marking as received:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsProcessed = async () => {
    if (!rma?.id) return;

    try {
      setSubmitting(true);
      const updatedRMA = await updateRMA(rma.id, {
        ...rma,
        status: 'PROCESSED',
      });
      setRma(updatedRMA);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as processed');
      console.error('Error marking as processed:', err);
    } finally {
      setSubmitting(false);
    }
  };

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

  const canMarkAsReceived = rma.status === 'APPROVED';
  const canMarkAsProcessed = rma.status === 'RECEIVED' && 
    rma.items?.every(item => (item.returnedQuantity || 0) > 0);

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
                              handleUpdateReturnedQuantity(item.id, newQty);
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
                              handleUpdateItemCondition(item.id, value);
                            } else if (item.id && value && Array.isArray(value) && value.length > 0) {
                              // Handle array case (shouldn't happen with single select, but just in case)
                              handleUpdateItemCondition(item.id, value[0]);
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
              onClick={handleMarkAsReceived}
              disabled={submitting}
            >
              Mark as Received
            </AxButton>
          )}
          {canMarkAsProcessed && (
            <AxButton
              variant="primary"
              onClick={handleMarkAsProcessed}
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

