import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchOrders, Order } from '../../api/orderApi';
import { fetchActiveProducts, Product } from '../../api/productApi';
import {
  createRMA,
  updateRMA,
  addRMAItem,
  updateRMAItemReturnedQuantity,
  removeRMAItem,
  fetchRMAById,
  RMA,
} from '../../api/rmaApi';
import { RMAEntryPageRender } from './RMAEntryPage.render';

interface RMAEntryPageProps {
  onNavigateToRMAs?: () => void;
  rmaIdToEdit?: string | null;
  onNavigateBack?: () => void;
  readOnly?: boolean;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
}

export function RMAEntryPage(props: RMAEntryPageProps = {}) {
  const { onNavigateToRMAs, rmaIdToEdit, onNavigateBack, readOnly = false, onNavigateToShopFloorControl } = props;
  const { l10n } = useI18n();
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
    if (!rma || !newStatus) return;

    if (rma.id) {
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
    } else {
      // Update local state for new RMA
      setRma({ ...rma, status: newStatus });
    }
  };

  const getProductName = (productId?: string) => {
    if (!productId) return 'N/A';
    const product = products.find(p => p.id === productId);
    return product ? (product.productName || product.productCode) : productId;
  };

  return (
    <RMAEntryPageRender
      rma={rma}
      customers={customers}
      orders={orders}
      products={products}
      loading={loading}
      submitting={submitting}
      selectedOrderId={selectedOrderId}
      selectedCustomerId={selectedCustomerId}
      selectedProduct={selectedProduct}
      quantity={quantity}
      returnedQuantity={returnedQuantity}
      reason={reason}
      restockingFee={restockingFee}
      notes={notes}
      readOnly={readOnly}
      onNavigateToRMAs={onNavigateToRMAs}
      onNavigateBack={onNavigateBack}
      onNavigateToShopFloorControl={onNavigateToShopFloorControl}
      onOrderSelect={handleOrderSelect}
      onCustomerSelect={handleCustomerSelect}
      onProductSelect={setSelectedProduct}
      onQuantityChange={setQuantity}
      onReasonChange={setReason}
      onRestockingFeeChange={setRestockingFee}
      onNotesChange={setNotes}
      onAddItem={handleAddItem}
      onRemoveItem={handleRemoveItem}
      onUpdateReturnedQuantity={handleUpdateReturnedQuantity}
      onSave={handleSave}
      onStatusChange={handleStatusChange}
      getProductName={getProductName}
    />
  );
}

