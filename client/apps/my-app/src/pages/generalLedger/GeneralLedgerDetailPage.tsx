import { useState, useEffect } from 'react';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchProducts, Product } from '../../api/productApi';
import { fetchOrderById, Order } from '../../api/orderApi';
import { GeneralLedgerDetailPageRender } from './GeneralLedgerDetailPage.render';
import { PageContainer, ContentCard } from './GeneralLedgerDetailPage.styles';
import { AxParagraph, AxButton } from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'GeneralLedgerDetailPage';

interface GeneralLedgerDetailPageProps {
  orderId?: string | null;
  onNavigateBack?: () => void;
}

export function GeneralLedgerDetailPage(props: GeneralLedgerDetailPageProps = {}) {
  const { orderId, onNavigateBack } = props;
  const { l10n } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [orderData, customersData, productsData] = await Promise.all([
          fetchOrderById(orderId),
          fetchCustomers(),
          fetchProducts(),
        ]);
        setOrder(orderData);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (err) {
        // Set order to null so the "not found" UI is shown
        setOrder(null);
        // Only log non-404 errors to console (404 is expected when order doesn't exist)
        if (err instanceof Error) {
          const is404 = err.message.includes('404') || err.message.includes('HTTP 404');
          if (!is404) {
            console.error('Error loading order:', err);
            alert(l10n('generalLedger.errorLoadFailed') + ': ' + err.message);
          }
        } else {
          console.error('Error loading order:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [orderId]);

  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 'var(--spacing-md)' }}>
            <AxParagraph>{l10n('generalLedger.detail.loading')}</AxParagraph>
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
            <AxParagraph>{l10n('generalLedger.detail.notFound')}</AxParagraph>
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

  const selectedCustomer = customers.find(c => c.id === order.customerId);
  const customerName = selectedCustomer 
    ? (selectedCustomer.companyName || `${selectedCustomer.lastName || ''} ${selectedCustomer.firstName || ''}`.trim() || selectedCustomer.email || l10n('generalLedger.unknown'))
    : l10n('generalLedger.unknown');

  const formatDate = (dateString?: string) => {
    if (!dateString) return l10n('generalLedger.notAvailable');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Calculate GL entries for this order
  const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  const productCost = order.items?.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    const itemCost = product?.cost || (item.unitPrice || 0) * 0.7; // Use product cost, fallback to 70% of unit price
    return sum + (itemCost * (item.quantity || 0));
  }, 0) || 0;
  const shippingCost = order.shippingCost || 0;
  const totalCost = productCost + shippingCost;
  const revenue = order.total || 0;
  const paymentAmount = order.jsonData?.paymentAmount || 0;

  return (
    <GeneralLedgerDetailPageRender
      order={order}
      loading={loading}
      products={products}
      customerName={customerName}
      totalQuantity={totalQuantity}
      productCost={productCost}
      shippingCost={shippingCost}
      totalCost={totalCost}
      revenue={revenue}
      paymentAmount={paymentAmount}
      onNavigateBack={onNavigateBack}
      formatDate={formatDate}
    />
  );
}

