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
import { useI18n } from '../../i18n/I18nProvider';
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

  const { l10n } = useI18n();

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large">
          <AxParagraph>{l10n('sfc.loading')}</AxParagraph>
        </ContentCard>
      </PageContainer>
    );
  }

  if (error || !rma) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large">
          <AxParagraph style={{ color: 'var(--color-danger)' }}>
            {error || l10n('sfc.rmaNotFound')}
          </AxParagraph>
          {onNavigateBack && (
            <AxButton variant="secondary" onClick={onNavigateBack} style={{ marginTop: 'var(--spacing-md)' }}>
              {l10n('sfc.back')}
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
                {l10n('sfc.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('sfc.title')} - RMA {rma.rmaNumber || rma.id}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('sfc.trackReceipt')}
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
            {l10n('sfc.rmaInformation')}
          </AxHeading3>
          <InfoBox>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)' }}>
              <div>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('sfc.customer')}
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  {rma.customerName || l10n('generalLedger.notAvailable')}
                </AxParagraph>
              </div>
              <div>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('rma.orderNumber')}
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  {rma.orderNumber || l10n('generalLedger.notAvailable')}
                </AxParagraph>
              </div>
              <div>
                <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('sfc.rmaDate')}
                </AxParagraph>
                <AxParagraph style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                  {rma.rmaDate ? new Date(rma.rmaDate).toLocaleDateString() : l10n('generalLedger.notAvailable')}
                </AxParagraph>
              </div>
              {rma.receivedDate && (
                <div>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                    {l10n('sfc.receivedDate')}
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
            {l10n('sfc.returnedItemsProcessing')}
          </AxHeading3>
          
          {rma.items && rma.items.length > 0 ? (
            <TableWrapper>
              <AxTable fullWidth>
                <AxTableHead>
                  <AxTableRow>
                    <AxTableHeader>{l10n('sfc.table.product')}</AxTableHeader>
                    <AxTableHeader align="right">{l10n('sfc.table.requestedQty')}</AxTableHeader>
                    <AxTableHeader align="right">{l10n('sfc.table.returnedQty')}</AxTableHeader>
                    <AxTableHeader>{l10n('sfc.table.condition')}</AxTableHeader>
                    <AxTableHeader>{l10n('sfc.table.reason')}</AxTableHeader>
                    <AxTableHeader align="right">{l10n('sfc.table.unitPrice')}</AxTableHeader>
                    <AxTableHeader align="right">{l10n('sfc.table.lineTotal')}</AxTableHeader>
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
                            { value: 'NEW', label: l10n('sfc.condition.new') },
                            { value: 'LIKE_NEW', label: l10n('sfc.condition.likeNew') },
                            { value: 'GOOD', label: l10n('sfc.condition.good') },
                            { value: 'FAIR', label: l10n('sfc.condition.fair') },
                            { value: 'POOR', label: l10n('sfc.condition.poor') },
                            { value: 'DAMAGED', label: l10n('sfc.condition.damaged') },
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
                          placeholder={l10n('sfc.selectCondition')}
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
              {l10n('sfc.noItems')}
            </AxParagraph>
          )}
        </FormSection>

        {rma.notes && (
          <FormSection>
            <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)', fontWeight: 'var(--font-weight-semibold)' }}>
              {l10n('sfc.notes')}
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
              {l10n('sfc.markAsReceived')}
            </AxButton>
          )}
          {canMarkAsProcessed && (
            <AxButton
              variant="primary"
              onClick={onMarkAsProcessed}
              disabled={submitting}
            >
              {l10n('sfc.markAsProcessed')}
            </AxButton>
          )}
          {onNavigateBack && (
            <AxButton variant="secondary" onClick={onNavigateBack}>
              {l10n('sfc.back')}
            </AxButton>
          )}
        </ButtonGroup>
      </ContentCard>
    </PageContainer>
  );
}

