import {
  AxHeading3,
  AxParagraph,
  AxButton,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import { Order } from '../../api/orderApi';
import { Product } from '../../api/productApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  ContentCard,
  InfoSection,
  InfoRow,
} from './GeneralLedgerDetailPage.styles';

const COMPONENT_NAME = 'GeneralLedgerDetailPage';

interface GeneralLedgerDetailPageRenderProps {
  order: Order | null;
  loading: boolean;
  products: Product[];
  customerName: string;
  totalQuantity: number;
  productCost: number;
  shippingCost: number;
  totalCost: number;
  revenue: number;
  paymentAmount: number;
  onNavigateBack?: () => void;
  formatDate: (dateString?: string) => string;
}

export function GeneralLedgerDetailPageRender(props: GeneralLedgerDetailPageRenderProps) {
  const {
    order,
    loading,
    products,
    customerName,
    totalQuantity,
    productCost,
    shippingCost,
    totalCost,
    revenue,
    paymentAmount,
    onNavigateBack,
    formatDate,
  } = props;
  
  const { l10n } = useI18n();

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 'var(--spacing-md)' }}>
            <AxParagraph>Loading general ledger entry...</AxParagraph>
          </div>
        </ContentCard>
      </PageContainer>
    );
  }

  if (!order) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 'var(--spacing-md)' }}>
            <AxParagraph>Order not found</AxParagraph>
            {onNavigateBack && (
              <AxButton variant="secondary" onClick={onNavigateBack}>
                {l10n('generalLedger.back')}
              </AxButton>
            )}
          </div>
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
                {l10n('generalLedger.back')}
              </AxButton>
            )}
            <div style={{ flex: 1 }}>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('module.generalLedger')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('generalLedger.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>
          {l10n('generalLedger.detail.title')}
        </AxHeading3>

        <InfoSection {...debugProps(COMPONENT_NAME, 'InfoSection')}>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {l10n('generalLedger.detail.orderNumber')}
            </AxParagraph>
            <AxParagraph>{order.orderNumber || 'N/A'}</AxParagraph>
          </InfoRow>
          {order.invoiceNumber && (
            <InfoRow>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {l10n('generalLedger.detail.invoiceNumber')}
              </AxParagraph>
              <AxParagraph>{order.invoiceNumber}</AxParagraph>
            </InfoRow>
          )}
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {l10n('generalLedger.detail.customer')}
            </AxParagraph>
            <AxParagraph>{customerName}</AxParagraph>
          </InfoRow>
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {l10n('generalLedger.detail.orderDate')}
            </AxParagraph>
            <AxParagraph>{formatDate(order.orderDate)}</AxParagraph>
          </InfoRow>
          {order.shipDate && (
            <InfoRow>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {l10n('generalLedger.detail.shipDate')}
              </AxParagraph>
              <AxParagraph>{formatDate(order.shipDate)}</AxParagraph>
            </InfoRow>
          )}
          {order.invoiceDate && (
            <InfoRow>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
                {l10n('generalLedger.detail.invoiceDate')}
              </AxParagraph>
              <AxParagraph>{formatDate(order.invoiceDate)}</AxParagraph>
            </InfoRow>
          )}
        </InfoSection>

        {order.items && order.items.length > 0 && (
          <>
            <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>
              {l10n('generalLedger.detail.items')}
            </AxHeading3>
            <AxTable fullWidth style={{ marginBottom: 'var(--spacing-lg)' }}>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Product</AxTableHeader>
                  <AxTableHeader align="right">Quantity</AxTableHeader>
                  <AxTableHeader align="right">Unit Price</AxTableHeader>
                  <AxTableHeader align="right">Line Total</AxTableHeader>
                  <AxTableHeader align="right">Cost (Est.)</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {order.items.map((item, index) => {
                  const product = products.find(p => p.id === item.productId);
                  const itemCost = product?.cost || (item.unitPrice || 0) * 0.7;
                  const lineCost = itemCost * (item.quantity || 0);
                  return (
                    <AxTableRow key={index}>
                      <AxTableCell>{item.productName || item.productCode || 'N/A'}</AxTableCell>
                      <AxTableCell align="right">{item.quantity || 0}</AxTableCell>
                      <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                      <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                      <AxTableCell align="right" style={{ color: 'var(--color-text-secondary)' }}>
                        ${lineCost.toFixed(2)}
                      </AxTableCell>
                    </AxTableRow>
                  );
                })}
              </AxTableBody>
            </AxTable>
          </>
        )}

        <InfoSection>
          <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>
            {l10n('generalLedger.detail.financialSummary')}
          </AxHeading3>
          
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {l10n('generalLedger.detail.totalQuantity')}
            </AxParagraph>
            <AxParagraph>{totalQuantity}</AxParagraph>
          </InfoRow>
          
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
              {l10n('generalLedger.detail.revenue')}
            </AxParagraph>
            <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
              ${revenue.toFixed(2)}
            </AxParagraph>
          </InfoRow>
          
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
              {l10n('generalLedger.detail.productCost')}
            </AxParagraph>
            <AxParagraph style={{ color: 'var(--color-error)' }}>
              ${productCost.toFixed(2)}
            </AxParagraph>
          </InfoRow>
          
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
              {l10n('generalLedger.detail.shippingCost')}
            </AxParagraph>
            <AxParagraph style={{ color: 'var(--color-error)' }}>
              ${shippingCost.toFixed(2)}
            </AxParagraph>
          </InfoRow>
          
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
              {l10n('generalLedger.detail.totalCost')}
            </AxParagraph>
            <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
              ${totalCost.toFixed(2)}
            </AxParagraph>
          </InfoRow>
          
          <InfoRow>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
              {l10n('generalLedger.detail.netIncome')}
            </AxParagraph>
            <AxParagraph style={{ 
              fontSize: 'var(--font-size-lg)', 
              fontWeight: 'var(--font-weight-bold)',
              color: (revenue - totalCost) >= 0 ? 'var(--color-success)' : 'var(--color-error)'
            }}>
              ${(revenue - totalCost).toFixed(2)}
            </AxParagraph>
          </InfoRow>
          
          {paymentAmount > 0 && (
            <InfoRow>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                {l10n('generalLedger.detail.paymentReceived')}
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                ${paymentAmount.toFixed(2)}
              </AxParagraph>
            </InfoRow>
          )}
        </InfoSection>
      </ContentCard>
    </PageContainer>
  );
}

