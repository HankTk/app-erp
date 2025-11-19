import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchRMAById, updateRMA, updateRMAItemReturnedQuantity, updateRMAItemCondition, RMA } from '../../api/rmaApi';
import { fetchActiveProducts, Product } from '../../api/productApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { ShopFloorControlPageRender } from './ShopFloorControlPage.render';

interface ShopFloorControlPageProps {
  rmaId: string;
  onNavigateBack?: () => void;
  backButtonLabel?: string;
}

export function ShopFloorControlPage({ rmaId, onNavigateBack, backButtonLabel = '← Back' }: ShopFloorControlPageProps) {
  const { l10n } = useI18n();
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
      setError(err instanceof Error ? err.message : l10n('sfc.failedToLoad'));
      console.error('Error loading shop floor control data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId?: string) => {
    if (!productId) return l10n('generalLedger.notAvailable');
    const product = products.find(p => p.id === productId);
    return product?.productName || product?.productCode || l10n('generalLedger.unknown');
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

  const canMarkAsReceived = rma?.status === 'APPROVED';
  const canMarkAsProcessed = rma?.status === 'RECEIVED' && 
    rma?.items?.every(item => (item.returnedQuantity || 0) > 0);

  return (
    <ShopFloorControlPageRender
      rma={rma}
      loading={loading}
      error={error}
      submitting={submitting}
      canMarkAsReceived={canMarkAsReceived}
      canMarkAsProcessed={canMarkAsProcessed}
      onNavigateBack={onNavigateBack}
      backButtonLabel={backButtonLabel}
      onUpdateReturnedQuantity={handleUpdateReturnedQuantity}
      onUpdateItemCondition={handleUpdateItemCondition}
      onMarkAsReceived={handleMarkAsReceived}
      onMarkAsProcessed={handleMarkAsProcessed}
      getProductName={getProductName}
    />
  );
}

