import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxListbox,
  AxInput,
  AxFormGroup,
  AxLabel,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchCustomers, Customer } from '../../api/customerApi';
import { fetchAddressesByCustomerId, Address } from '../../api/addressApi';
import { fetchActiveProducts, Product } from '../../api/productApi';
import {
  createOrder,
  updateOrder,
  addOrderItem,
  updateOrderItemQuantity,
  removeOrderItem,
  fetchOrdersByStatus,
  fetchOrderById,
  deleteOrder,
  Order,
} from '../../api/orderApi';
import styled from 'styled-components';
import { OrderStep, EntrySubStep } from './types';
import { OrderEntryStepPage } from './OrderEntryStepPage';
import { OrderApprovalStepPage } from './OrderApprovalStepPage';
import { OrderConfirmationStepPage } from './OrderConfirmationStepPage';
import { OrderShippingInstructionStepPage } from './OrderShippingInstructionStepPage';
import { OrderShippingStepPage } from './OrderShippingStepPage';
import { OrderInvoicingStepPage } from './OrderInvoicingStepPage';
import { OrderPaymentStepPage } from './OrderPaymentStepPage';
import { OrderHistoryStepPage } from './OrderHistoryStepPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
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
  margin-bottom: var(--spacing-md);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
`;

const ContentCard = styled(AxCard)`
  display: flex;
  flex-direction: column;
  overflow: visible;
  flex-shrink: 0;
`;

const StepIndicator = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border-default);
  flex-shrink: 0;
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  border-radius: var(--radius-md);
  background-color: ${props => 
    props.$active ? 'var(--color-primary)' : 
    props.$completed ? 'var(--color-success)' : 
    'var(--color-background-secondary)'};
  color: ${props => 
    props.$active || props.$completed ? 'var(--color-text-inverse)' : 
    'var(--color-text-secondary)'};
  font-weight: ${props => props.$active ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)'};
  cursor: ${props => props.$completed ? 'pointer' : 'default'};
  transition: all var(--transition-base);
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  overflow: visible;
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



// Module-level flag to prevent duplicate order creation across component instances
let isCreatingOrderGlobal = false;

interface OrderEntryPageProps {
  onNavigateToOrders?: () => void;
  orderIdToEdit?: string | null;
  onNavigateBack?: () => void;
}

export function OrderEntryPage(props: OrderEntryPageProps = {}) {
  const { onNavigateToOrders, orderIdToEdit, onNavigateBack } = props;
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState<OrderStep>('entry');
  const [currentEntrySubStep, setCurrentEntrySubStep] = useState<EntrySubStep>('customer');
  const [order, setOrder] = useState<Order | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isCreatingOrderRef = useRef(false);
  const orderRef = useRef<Order | null>(null);
  
  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  
  // Shipping address state
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [billingId, setBillingId] = useState<string | null>(null);

  // Approval state
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [creditCheckPassed, setCreditCheckPassed] = useState<boolean>(false);
  const [inventoryConfirmed, setInventoryConfirmed] = useState<boolean>(false);
  const [priceApproved, setPriceApproved] = useState<boolean>(false);

  // Shipping instruction state
  const [shippingInstructions, setShippingInstructions] = useState<string>('');
  const [requestedShipDate, setRequestedShipDate] = useState<string>('');

  // Shipping state
  const [actualShipDate, setActualShipDate] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');

  // Invoicing state
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>('');

  // Payment state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');

  const steps: { key: OrderStep; label: string; description: string }[] = [
    { key: 'entry', label: t('orderEntry.step.entry'), description: t('orderEntry.step.entry') },
    { key: 'approval', label: t('orderEntry.step.approval'), description: t('orderEntry.step.approval') },
    { key: 'confirmation', label: t('orderEntry.step.confirmation'), description: t('orderEntry.step.confirmation') },
    { key: 'shipping_instruction', label: t('orderEntry.step.shippingInstruction'), description: t('orderEntry.step.shippingInstruction') },
    { key: 'shipping', label: t('orderEntry.step.shipping'), description: t('orderEntry.step.shipping') },
    { key: 'invoicing', label: t('orderEntry.step.invoicing'), description: t('orderEntry.step.invoicing') },
    { key: 'payment', label: t('orderEntry.step.payment'), description: t('orderEntry.step.payment') },
    { key: 'history', label: t('orderEntry.step.history'), description: t('orderEntry.step.history') },
  ];

  const entrySubSteps: { key: EntrySubStep; label: string }[] = [
    { key: 'customer', label: 'Customer' },
    { key: 'products', label: 'Products' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'review', label: 'Review' },
  ];

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  useEffect(() => {
    if (order?.customerId) {
      loadAddresses(order.customerId);
    }
  }, [order?.customerId]);

  // Sync shipping/billing IDs with order when order changes
  useEffect(() => {
    if (order) {
      setShippingId(order.shippingAddressId || null);
      setBillingId(order.billingAddressId || null);
    }
  }, [order?.shippingAddressId, order?.billingAddressId]);

  // Keep orderRef in sync with order state for cleanup
  useEffect(() => {
    orderRef.current = order;
  }, [order]);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchActiveProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadAddresses = async (customerId: string) => {
    try {
      const data = await fetchAddressesByCustomerId(customerId);
      setAddresses(data);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  const handleCreateOrder = async () => {
    // Prevent multiple simultaneous order creations using both ref and module-level flag
    if (isCreatingOrderRef.current || isCreatingOrderGlobal) {
      console.log('Order creation already in progress, skipping...');
      return;
    }
    if (order?.id) {
      console.log('Order already exists, skipping creation');
      return;
    }
    try {
      isCreatingOrderRef.current = true;
      isCreatingOrderGlobal = true;
      setLoading(true);
      const newOrder: Partial<Order> = {
        status: 'DRAFT',
        items: [],
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0,
      };
      const created = await createOrder(newOrder);
      if (!created || !created.id) {
        throw new Error('Order was created but no ID was returned');
      }
      console.log('Order created with ID:', created.id);
      setOrder(created);
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to create order. Please refresh the page and try again.');
    } finally {
      setLoading(false);
      isCreatingOrderRef.current = false;
      isCreatingOrderGlobal = false;
    }
  };

  useEffect(() => {
    // Load order to edit or initialize new order
    const initializeOrder = async () => {
      // Reset order state when orderIdToEdit changes
      if (orderIdToEdit && order?.id !== orderIdToEdit) {
        setOrder(null);
      }
      
      // Skip if order is already loaded and matches orderIdToEdit, or if creation is in progress
      if ((order?.id && (!orderIdToEdit || order.id === orderIdToEdit)) || isCreatingOrderRef.current || isCreatingOrderGlobal) {
        return;
      }
      
      try {
        isCreatingOrderRef.current = true;
        isCreatingOrderGlobal = true;
        setLoading(true);
        
        // If orderIdToEdit is provided, load that order
        if (orderIdToEdit) {
          console.log('Loading order for editing:', orderIdToEdit);
          const existingOrder = await fetchOrderById(orderIdToEdit);
          if (existingOrder && existingOrder.id) {
            console.log('Order loaded:', existingOrder.id);
            setOrder(existingOrder);
            
            // Load data from jsonData if available
            if (existingOrder.jsonData) {
              setApprovalNotes(existingOrder.jsonData.approvalNotes || '');
              setCreditCheckPassed(existingOrder.jsonData.creditCheckPassed || false);
              setInventoryConfirmed(existingOrder.jsonData.inventoryConfirmed || false);
              setPriceApproved(existingOrder.jsonData.priceApproved || false);
              setShippingInstructions(existingOrder.jsonData.shippingInstructions || '');
              setRequestedShipDate(existingOrder.jsonData.requestedShipDate || '');
              setTrackingNumber(existingOrder.jsonData.trackingNumber || '');
              setInvoiceNumber(existingOrder.jsonData.invoiceNumber || '');
              setInvoiceDate(existingOrder.jsonData.invoiceDate || '');
              setPaymentAmount(existingOrder.jsonData.paymentAmount || 0);
              setPaymentDate(existingOrder.jsonData.paymentDate || '');
              setPaymentMethod(existingOrder.jsonData.paymentMethod || '');
              if (existingOrder.shipDate) {
                setActualShipDate(new Date(existingOrder.shipDate).toISOString().split('T')[0]);
              }
            }
            
            // Set step based on order status
            switch (existingOrder.status) {
              case 'DRAFT':
                // Set entry sub-step based on order state
                if (existingOrder.customerId) {
                  if (existingOrder.items && existingOrder.items.length > 0) {
                    if (existingOrder.shippingAddressId && existingOrder.billingAddressId) {
                      setCurrentStep('entry');
                      setCurrentEntrySubStep('review');
                    } else {
                      setCurrentStep('entry');
                      setCurrentEntrySubStep('shipping');
                    }
                  } else {
                    setCurrentStep('entry');
                    setCurrentEntrySubStep('products');
                  }
                } else {
                  setCurrentStep('entry');
                  setCurrentEntrySubStep('customer');
                }
                break;
              case 'PENDING_APPROVAL':
                setCurrentStep('approval');
                break;
              case 'APPROVED':
                setCurrentStep('confirmation');
                break;
              case 'SHIPPING_INSTRUCTED':
                setCurrentStep('shipping');
                break;
              case 'SHIPPED':
                setCurrentStep('invoicing');
                break;
              case 'INVOICED':
                setCurrentStep('payment');
                break;
              case 'PAID':
                setCurrentStep('payment');
                break;
              default:
                setCurrentStep('entry');
                setCurrentEntrySubStep('customer');
            }
            
            // 履歴データを読み込む（既にjsonDataから読み込まれている）
            return;
          } else {
            throw new Error('Order not found');
          }
        }
        
        // No order to edit, check for existing DRAFT orders
        const draftOrders = await fetchOrdersByStatus('DRAFT');
        
        if (draftOrders && draftOrders.length > 0) {
          // Use the most recent DRAFT order
          const existingOrder = draftOrders[0];
          console.log('Using existing DRAFT order:', existingOrder.id);
          if (existingOrder && existingOrder.id) {
            setOrder(existingOrder);
            return; // Successfully loaded existing order
          }
        }
        
        // No valid existing DRAFT order, create a new one
        console.log('Creating new DRAFT order...');
        const newOrder: Partial<Order> = {
          status: 'DRAFT',
          items: [],
          subtotal: 0,
          tax: 0,
          shippingCost: 0,
          total: 0,
        };
        const created = await createOrder(newOrder);
        if (!created || !created.id) {
          throw new Error('Order was created but no ID was returned');
        }
        console.log('Order created with ID:', created.id);
        setOrder(created);
      } catch (err) {
        console.error('Error initializing order:', err);
        alert('Failed to initialize order. Please refresh the page and try again.');
      } finally {
        setLoading(false);
        isCreatingOrderRef.current = false;
        isCreatingOrderGlobal = false;
      }
    };
    
    initializeOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderIdToEdit]);

  const handleCustomerSelect = async (customerId: string) => {
    if (!order) {
      console.error('No order available');
      return;
    }
    if (!order.id) {
      console.error('Order has no ID, cannot update');
      alert('Order is not ready yet. Please wait a moment and try again.');
      return;
    }
    try {
      setLoading(true);
      console.log('Updating order:', order.id, 'with customer:', customerId);
      const updated = await updateOrder(order.id, { ...order, customerId });
      if (!updated || !updated.id) {
        throw new Error('Order update failed - no order returned');
      }
      setOrder(updated);
      await loadAddresses(customerId);
    } catch (err) {
      console.error('Error updating order:', err);
      console.error('Order state:', order);
      alert('Failed to update order. The order may not exist yet. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productId: string, quantity: number = 1) => {
    if (!order?.id) return;
    try {
      setLoading(true);
      const updated = await addOrderItem(order.id, productId, quantity);
      setOrder(updated);
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!order?.id) return;
    try {
      setLoading(true);
      const updated = await updateOrderItemQuantity(order.id, itemId, quantity);
      setOrder(updated);
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!order?.id) return;
    try {
      setLoading(true);
      const updated = await removeOrderItem(order.id, itemId);
      setOrder(updated);
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingInfo = async (shippingAddressId: string, billingAddressId: string) => {
    if (!order) return;
    try {
      setLoading(true);
      const updated = await updateOrder(order.id!, {
        ...order,
        shippingAddressId,
        billingAddressId,
      });
      setOrder(updated);
    } catch (err) {
      console.error('Error updating shipping info:', err);
      alert('Failed to update shipping information');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEntry = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      const updated = await updateOrder(order.id!, {
        ...order,
        status: 'PENDING_APPROVAL',
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('entry', '受注入力', undefined, 'PENDING_APPROVAL', {
        customerId: updated.customerId,
        itemCount: updated.items?.length || 0,
        total: updated.total,
      }, updated);
      alert('Order submitted for approval successfully!');
      // オーダー一覧に戻る
      if (onNavigateToOrders) {
        onNavigateToOrders();
      }
    } catch (err) {
      console.error('Error completing entry:', err);
      alert('Failed to complete order entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveOrder = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      const jsonData = order.jsonData || {};
      jsonData.approvalNotes = approvalNotes;
      jsonData.creditCheckPassed = creditCheckPassed;
      jsonData.inventoryConfirmed = inventoryConfirmed;
      jsonData.priceApproved = priceApproved;
      jsonData.approvedAt = new Date().toISOString();
      const updated = await updateOrder(order.id!, {
        ...order,
        status: 'APPROVED',
        notes: approvalNotes || order.notes,
        jsonData,
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('approval', '承認・確認', approvalNotes, 'APPROVED', {
        creditCheckPassed,
        inventoryConfirmed,
        priceApproved,
      }, updated);
      setCurrentStep('confirmation');
    } catch (err) {
      console.error('Error approving order:', err);
      alert('Failed to approve order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmOrder = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      // Status remains APPROVED, but we can add confirmation date to jsonData
      const jsonData = order.jsonData || {};
      jsonData.confirmedAt = new Date().toISOString();
      const updated = await updateOrder(order.id!, {
        ...order,
        jsonData,
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('confirmation', '受注明細確定', undefined, 'APPROVED', {
        orderNumber: updated.orderNumber,
      }, updated);
      setCurrentStep('shipping_instruction');
    } catch (err) {
      console.error('Error confirming order:', err);
      alert('Failed to confirm order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShippingInstruction = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      const jsonData = order.jsonData || {};
      jsonData.shippingInstructions = shippingInstructions;
      jsonData.requestedShipDate = requestedShipDate;
      const updated = await updateOrder(order.id!, {
        ...order,
        status: 'SHIPPING_INSTRUCTED',
        jsonData,
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('shipping_instruction', '出荷指示', shippingInstructions, 'SHIPPING_INSTRUCTED', {
        requestedShipDate,
      }, updated);
      setCurrentStep('shipping');
    } catch (err) {
      console.error('Error creating shipping instruction:', err);
      alert('Failed to create shipping instruction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShipOrder = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      const jsonData = order.jsonData || {};
      jsonData.trackingNumber = trackingNumber;
      const shipDate = actualShipDate ? new Date(actualShipDate).toISOString() : new Date().toISOString();
      const updated = await updateOrder(order.id!, {
        ...order,
        status: 'SHIPPED',
        shipDate: shipDate,
        jsonData,
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('shipping', '出荷処理', undefined, 'SHIPPED', {
        shipDate,
        trackingNumber,
      }, updated);
      setCurrentStep('invoicing');
    } catch (err) {
      console.error('Error shipping order:', err);
      alert('Failed to ship order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvoiceOrder = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      const jsonData = order.jsonData || {};
      jsonData.invoiceNumber = invoiceNumber;
      jsonData.invoiceDate = invoiceDate;
      const updated = await updateOrder(order.id!, {
        ...order,
        status: 'INVOICED',
        jsonData,
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('invoicing', '請求処理', undefined, 'INVOICED', {
        invoiceNumber,
        invoiceDate,
        total: updated.total,
      }, updated);
      setCurrentStep('payment');
    } catch (err) {
      console.error('Error invoicing order:', err);
      alert('Failed to invoice order');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!order) return;
    try {
      setSubmitting(true);
      const jsonData = order.jsonData || {};
      jsonData.paymentAmount = paymentAmount;
      jsonData.paymentDate = paymentDate;
      jsonData.paymentMethod = paymentMethod;
      const updated = await updateOrder(order.id!, {
        ...order,
        status: 'PAID',
        jsonData,
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('payment', '入金処理', undefined, 'PAID', {
        paymentAmount,
        paymentDate,
        paymentMethod,
      }, updated);
      alert('Order payment completed successfully!');
      if (onNavigateToOrders) {
        onNavigateToOrders();
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      alert('Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  // Cleanup function to delete DRAFT order when leaving the page
  const cleanupDraftOrder = async (orderToCleanup: Order | null) => {
    // Only delete if:
    // 1. Order exists and has an ID
    // 2. Order status is DRAFT (not completed)
    // 3. Not editing an existing order (orderIdToEdit is not provided)
    if (
      orderToCleanup?.id &&
      orderToCleanup.status === 'DRAFT' &&
      !orderIdToEdit
    ) {
      try {
        console.log('Cleaning up DRAFT order:', orderToCleanup.id);
        await deleteOrder(orderToCleanup.id);
        console.log('DRAFT order deleted successfully');
      } catch (err) {
        console.error('Error deleting DRAFT order:', err);
        // Silently fail - this is cleanup, not critical
      }
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Use ref to get the latest order state in cleanup
      const currentOrder = orderRef.current;
      if (currentOrder?.id && currentOrder.status === 'DRAFT' && !orderIdToEdit) {
        // Use fetch with keepalive for better reliability on unmount
        fetch(`http://localhost:8080/api/orders/${currentOrder.id}`, {
          method: 'DELETE',
          keepalive: true,
        }).catch((err) => {
          console.error('Error deleting DRAFT order on unmount:', err);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle browser close/refresh with beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Use ref to get the latest order state
      const currentOrder = orderRef.current;
      if (currentOrder?.id && currentOrder.status === 'DRAFT' && !orderIdToEdit) {
        // Use fetch with keepalive for reliable cleanup on page unload
        fetch(`http://localhost:8080/api/orders/${currentOrder.id}`, {
          method: 'DELETE',
          keepalive: true,
        }).catch((err) => {
          console.error('Error deleting DRAFT order on beforeunload:', err);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [orderIdToEdit]);

  // Handle navigation back
  const handleNavigateBack = () => {
    // Cleanup DRAFT order before navigating
    if (order?.id && order.status === 'DRAFT' && !orderIdToEdit) {
      cleanupDraftOrder(order).then(() => {
        if (onNavigateBack) {
          onNavigateBack();
        }
      });
    } else {
      if (onNavigateBack) {
        onNavigateBack();
      }
    }
  };

  const getStepIndex = (step: OrderStep) => {
    return steps.findIndex(s => s.key === step);
  };

  const isStepCompleted = (step: OrderStep) => {
    if (!order) return false;
    switch (step) {
      case 'entry':
        return order.status !== 'DRAFT' || (!!order.customerId && order.items && order.items.length > 0 && !!order.shippingAddressId && !!order.billingAddressId);
      case 'approval':
        return order.status === 'APPROVED' || order.status === 'SHIPPING_INSTRUCTED' || order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID';
      case 'confirmation':
        return order.status === 'APPROVED' || order.status === 'SHIPPING_INSTRUCTED' || order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID';
      case 'shipping_instruction':
        return order.status === 'SHIPPING_INSTRUCTED' || order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID';
      case 'shipping':
        return order.status === 'SHIPPED' || order.status === 'INVOICED' || order.status === 'PAID';
      case 'invoicing':
        return order.status === 'INVOICED' || order.status === 'PAID';
      case 'payment':
        return order.status === 'PAID';
      case 'history':
        return true; // 履歴ページは常にアクセス可能
      default:
        return false;
    }
  };

  const isEntrySubStepCompleted = (subStep: EntrySubStep) => {
    if (!order) return false;
    switch (subStep) {
      case 'customer':
        return !!order.customerId;
      case 'products':
        return order.items && order.items.length > 0;
      case 'shipping':
        return !!order.shippingAddressId && !!order.billingAddressId;
      case 'review':
        return false;
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 'entry') {
      switch (currentEntrySubStep) {
        case 'customer':
          return !!order?.customerId;
        case 'products':
          return order?.items && order.items.length > 0;
        case 'shipping':
          return !!order?.shippingAddressId && !!order?.billingAddressId;
        case 'review':
          return true;
        default:
          return false;
      }
    }
    
    switch (currentStep) {
      case 'approval':
        return creditCheckPassed && inventoryConfirmed && priceApproved;
      case 'confirmation':
        return true;
      case 'shipping_instruction':
        return !!requestedShipDate;
      case 'shipping':
        return !!actualShipDate;
      case 'invoicing':
        return !!invoiceNumber && !!invoiceDate;
      case 'payment':
        return !!paymentAmount && !!paymentDate && !!paymentMethod;
      case 'history':
        return true; // 履歴ページは常に進むことができる
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 'entry') {
      const currentSubIndex = entrySubSteps.findIndex(s => s.key === currentEntrySubStep);
      if (currentSubIndex < entrySubSteps.length - 1) {
        setCurrentEntrySubStep(entrySubSteps[currentSubIndex + 1].key);
      } else {
        // Move to approval step
        const currentIndex = getStepIndex(currentStep);
        if (currentIndex < steps.length - 1) {
          setCurrentStep(steps[currentIndex + 1].key);
        }
      }
    } else {
      const currentIndex = getStepIndex(currentStep);
      if (currentIndex < steps.length - 1) {
        setCurrentStep(steps[currentIndex + 1].key);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'entry') {
      const currentSubIndex = entrySubSteps.findIndex(s => s.key === currentEntrySubStep);
      if (currentSubIndex > 0) {
        setCurrentEntrySubStep(entrySubSteps[currentSubIndex - 1].key);
      } else {
        // Move to previous main step (shouldn't happen for entry, but handle it)
        const currentIndex = getStepIndex(currentStep);
        if (currentIndex > 0) {
          setCurrentStep(steps[currentIndex - 1].key);
        }
      }
    } else {
      const currentIndex = getStepIndex(currentStep);
      if (currentIndex > 0) {
        if (steps[currentIndex - 1].key === 'entry') {
          setCurrentStep('entry');
          setCurrentEntrySubStep('review');
        } else {
          setCurrentStep(steps[currentIndex - 1].key);
        }
      }
    }
  };

  const renderCustomerStep = () => {
    const customerOptions = customers.map(c => ({
      value: c.id!,
      label: c.companyName || `${c.lastName} ${c.firstName}` || c.email || c.id!,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>Select Customer</AxHeading3>
        {!order?.id && (
          <AxParagraph style={{ marginBottom: 'var(--spacing-md)', color: 'var(--color-warning)' }}>
            Initializing order... Please wait.
          </AxParagraph>
        )}
        <AxFormGroup>
          <AxLabel>Customer</AxLabel>
          <AxListbox
            options={customerOptions}
            value={order?.customerId || null}
            onChange={(value) => {
              if (value && order?.id) {
                handleCustomerSelect(value);
              } else if (value && !order?.id) {
                alert('Order is not ready yet. Please wait a moment and try again.');
              }
            }}
            placeholder="Select a customer"
            fullWidth
            disabled={loading || !order?.id}
          />
        </AxFormGroup>
        {order?.customerId && (
          <AxParagraph style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
            Customer selected. You can proceed to the next step.
          </AxParagraph>
        )}
      </div>
    );
  };

  const renderProductsStep = () => {
    const productOptions = products.map(p => ({
      value: p.id!,
      label: `${p.productCode || ''} - ${p.productName || ''} ($${p.unitPrice || 0})`,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>Add Products</AxHeading3>
        
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end', marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ flex: 1 }}>
            <AxFormGroup style={{ marginBottom: 0 }}>
              <AxLabel>Product</AxLabel>
              <AxListbox
                options={productOptions}
                value={selectedProduct}
                onChange={setSelectedProduct}
                placeholder="Select a product"
                fullWidth
                disabled={loading}
              />
            </AxFormGroup>
          </div>
          <div style={{ width: '150px' }}>
            <AxFormGroup style={{ marginBottom: 0 }}>
              <AxLabel>Quantity</AxLabel>
              <AxInput
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                disabled={loading}
                fullWidth
              />
            </AxFormGroup>
          </div>
          <AxButton
            variant="primary"
            onClick={() => {
              if (selectedProduct) {
                handleAddProduct(selectedProduct, quantity);
                setSelectedProduct(null);
                setQuantity(1);
              }
            }}
            disabled={!selectedProduct || loading}
          >
            Add
          </AxButton>
        </div>

        <ItemsTable>
          <AxTable fullWidth>
            <AxTableHead>
              <AxTableRow>
                <AxTableHeader>Product</AxTableHeader>
                <AxTableHeader>Quantity</AxTableHeader>
                <AxTableHeader align="right">Unit Price</AxTableHeader>
                <AxTableHeader align="right">Line Total</AxTableHeader>
                <AxTableHeader align="center">Actions</AxTableHeader>
              </AxTableRow>
            </AxTableHead>
            <AxTableBody>
              {order?.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <AxTableRow key={item.id}>
                    <AxTableCell>{item.productName || item.productCode}</AxTableCell>
                    <AxTableCell>
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', alignItems: 'center' }}>
                        <AxButton
                          variant="secondary"
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id!, (item.quantity || 1) - 1)}
                          disabled={loading || (item.quantity || 1) <= 1}
                        >
                          -
                        </AxButton>
                        <span style={{ minWidth: '40px', textAlign: 'center' }}>{item.quantity || 0}</span>
                        <AxButton
                          variant="secondary"
                          size="small"
                          onClick={() => handleUpdateQuantity(item.id!, (item.quantity || 1) + 1)}
                          disabled={loading}
                        >
                          +
                        </AxButton>
                      </div>
                    </AxTableCell>
                    <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                    <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                    <AxTableCell align="center">
                      <AxButton
                        variant="danger"
                        size="small"
                        onClick={() => handleRemoveItem(item.id!)}
                        disabled={loading}
                      >
                        Delete
                      </AxButton>
                    </AxTableCell>
                  </AxTableRow>
                ))
              ) : (
                <AxTableRow>
                  <AxTableCell colSpan={5} align="center">
                    <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                      No products added yet
                    </AxParagraph>
                  </AxTableCell>
                </AxTableRow>
              )}
            </AxTableBody>
          </AxTable>
        </ItemsTable>

        {order && (
          <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph><strong>Subtotal:</strong></AxParagraph>
              <AxParagraph><strong>${order.subtotal?.toFixed(2) || '0.00'}</strong></AxParagraph>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderShippingAddressStep = () => {
    // Show all addresses for both shipping and billing (same address can be used for both)
    const allAddresses = addresses;

    const addressOptions = allAddresses.map(a => ({
      value: a.id!,
      label: `${a.streetAddress1 || ''}, ${a.city || ''}, ${a.state || ''} ${a.postalCode || ''}${a.addressType ? ` (${a.addressType})` : ''}`,
    }));

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>Shipping Information</AxHeading3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>Shipping Address</AxLabel>
            <AxListbox
              options={addressOptions}
              value={shippingId}
              onChange={(value) => {
                setShippingId(value);
                if (value && billingId) {
                  handleShippingInfo(value, billingId);
                }
              }}
              placeholder="Select shipping address"
              fullWidth
              disabled={loading || addressOptions.length === 0}
            />
            {addressOptions.length === 0 && (
              <AxParagraph style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                No addresses found for this customer. Please add addresses in the customer management page.
              </AxParagraph>
            )}
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>Billing Address</AxLabel>
            <AxListbox
              options={addressOptions}
              value={billingId}
              onChange={(value) => {
                setBillingId(value);
                if (value && shippingId) {
                  handleShippingInfo(shippingId, value);
                }
              }}
              placeholder="Select billing address (can be same as shipping)"
              fullWidth
              disabled={loading || addressOptions.length === 0}
            />
            {addressOptions.length === 0 && (
              <AxParagraph style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                No addresses found for this customer. Please add addresses in the customer management page.
              </AxParagraph>
            )}
          </AxFormGroup>
        </div>
        <AxParagraph style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          You can select the same address for both shipping and billing.
        </AxParagraph>
      </div>
    );
  };

  const renderReviewStep = () => {
    const shippingAddress = addresses.find(a => a.id === order?.shippingAddressId);
    const billingAddress = addresses.find(a => a.id === order?.billingAddressId);

    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>Review Order</AxHeading3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-xl)', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
                Shipping Address
              </AxParagraph>
              {shippingAddress ? (
                <AxParagraph>
                  {shippingAddress.streetAddress1}<br />
                  {shippingAddress.streetAddress2 && <>{shippingAddress.streetAddress2}<br /></>}
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                  {shippingAddress.country}
                </AxParagraph>
              ) : (
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>Not selected</AxParagraph>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '250px' }}>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
                Billing Address
              </AxParagraph>
              {billingAddress ? (
                <AxParagraph>
                  {billingAddress.streetAddress1}<br />
                  {billingAddress.streetAddress2 && <>{billingAddress.streetAddress2}<br /></>}
                  {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}<br />
                  {billingAddress.country}
                </AxParagraph>
              ) : (
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>Not selected</AxParagraph>
              )}
            </div>
          </div>

          <div>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
              Order Items
            </AxParagraph>
            <ItemsTable>
              <AxTable fullWidth>
                <AxTableHead>
                  <AxTableRow>
                    <AxTableHeader>Product</AxTableHeader>
                    <AxTableHeader>Quantity</AxTableHeader>
                    <AxTableHeader align="right">Unit Price</AxTableHeader>
                    <AxTableHeader align="right">Line Total</AxTableHeader>
                  </AxTableRow>
                </AxTableHead>
                <AxTableBody>
                  {order?.items?.map((item) => (
                    <AxTableRow key={item.id}>
                      <AxTableCell>{item.productName || item.productCode}</AxTableCell>
                      <AxTableCell>{item.quantity || 0}</AxTableCell>
                      <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                      <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                    </AxTableRow>
                  ))}
                </AxTableBody>
              </AxTable>
            </ItemsTable>
          </div>

          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>Subtotal:</AxParagraph>
              <AxParagraph>${order?.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>Tax:</AxParagraph>
              <AxParagraph>${order?.tax?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
              <AxParagraph>Shipping:</AxParagraph>
              <AxParagraph>${order?.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--spacing-sm)', borderTop: '2px solid var(--color-border-default)' }}>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>Total:</AxParagraph>
              <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>${order?.total?.toFixed(2) || '0.00'}</AxParagraph>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderApprovalStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.approval.title')}</AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('orderEntry.approval.description')}
        </AxParagraph>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>
              <input
                type="checkbox"
                checked={creditCheckPassed}
                onChange={(e) => setCreditCheckPassed(e.target.checked)}
                style={{ marginRight: 'var(--spacing-xs)' }}
              />
              {t('orderEntry.approval.creditCheck')}
            </AxLabel>
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>
              <input
                type="checkbox"
                checked={inventoryConfirmed}
                onChange={(e) => setInventoryConfirmed(e.target.checked)}
                style={{ marginRight: 'var(--spacing-xs)' }}
              />
              {t('orderEntry.approval.inventoryConfirmed')}
            </AxLabel>
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>
              <input
                type="checkbox"
                checked={priceApproved}
                onChange={(e) => setPriceApproved(e.target.checked)}
                style={{ marginRight: 'var(--spacing-xs)' }}
              />
              {t('orderEntry.approval.priceApproved')}
            </AxLabel>
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('orderEntry.approval.notes')}</AxLabel>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)',
                fontFamily: 'inherit',
              }}
              placeholder={t('orderEntry.approval.notesPlaceholder')}
            />
          </AxFormGroup>
        </div>
      </div>
    );
  };

  const renderConfirmationStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.confirmation.title')}</AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('orderEntry.confirmation.description')}
        </AxParagraph>
        
        <div style={{ padding: 'var(--spacing-lg)', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}>
          <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
            <strong>{t('orderEntry.confirmation.orderNumber')}</strong> {order?.orderNumber || 'N/A'}
          </AxParagraph>
          <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
            <strong>{t('orderEntry.confirmation.customer')}</strong> {selectedCustomer?.companyName || selectedCustomer?.email || 'N/A'}
          </AxParagraph>
          <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
            <strong>{t('orderEntry.confirmation.totalAmount')}</strong> ${order?.total?.toFixed(2) || '0.00'}
          </AxParagraph>
          <AxParagraph>
            {t('orderEntry.confirmation.confirmMessage')}
          </AxParagraph>
        </div>
      </div>
    );
  };

  const renderShippingInstructionStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.shippingInstruction.title')}</AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('orderEntry.shippingInstruction.description')}
        </AxParagraph>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>{t('orderEntry.shippingInstruction.requestedShipDate')}</AxLabel>
            <AxInput
              type="date"
              value={requestedShipDate}
              onChange={(e) => setRequestedShipDate(e.target.value)}
              fullWidth
            />
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('orderEntry.shippingInstruction.notes')}</AxLabel>
            <textarea
              value={shippingInstructions}
              onChange={(e) => setShippingInstructions(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-default)',
                fontFamily: 'inherit',
              }}
              placeholder={t('orderEntry.shippingInstruction.notesPlaceholder')}
            />
          </AxFormGroup>
        </div>
      </div>
    );
  };

  const renderShippingFulfillmentStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.shipping.title')}</AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('orderEntry.shipping.description')}
        </AxParagraph>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>{t('orderEntry.shipping.actualShipDate')}</AxLabel>
            <AxInput
              type="date"
              value={actualShipDate}
              onChange={(e) => setActualShipDate(e.target.value)}
              fullWidth
            />
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('orderEntry.shipping.trackingNumber')}</AxLabel>
            <AxInput
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder={t('orderEntry.shipping.trackingNumberPlaceholder')}
              fullWidth
            />
          </AxFormGroup>
        </div>
      </div>
    );
  };

  const renderInvoicingStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.invoicing.title')}</AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('orderEntry.invoicing.description')}
        </AxParagraph>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>{t('orderEntry.invoicing.invoiceNumber')}</AxLabel>
            <AxInput
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder={t('orderEntry.invoicing.invoiceNumberPlaceholder')}
              fullWidth
            />
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('orderEntry.invoicing.invoiceDate')}</AxLabel>
            <AxInput
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              fullWidth
            />
          </AxFormGroup>

          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
              {t('orderEntry.invoicing.invoiceAmount')}
            </AxParagraph>
            <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
              ${order?.total?.toFixed(2) || '0.00'}
            </AxParagraph>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentStep = () => {
    return (
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.payment.title')}</AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {t('orderEntry.payment.description')}
        </AxParagraph>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>{t('orderEntry.payment.paymentAmount')}</AxLabel>
            <AxInput
              type="number"
              value={paymentAmount || ''}
              onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              fullWidth
            />
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('orderEntry.payment.paymentDate')}</AxLabel>
            <AxInput
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              fullWidth
            />
          </AxFormGroup>

          <AxFormGroup>
            <AxLabel>{t('orderEntry.payment.paymentMethod')}</AxLabel>
            <AxListbox
              options={[
                { value: 'BANK_TRANSFER', label: t('orderEntry.payment.method.bankTransfer') },
                { value: 'CREDIT_CARD', label: t('orderEntry.payment.method.creditCard') },
                { value: 'CASH', label: t('orderEntry.payment.method.cash') },
                { value: 'CHECK', label: t('orderEntry.payment.method.check') },
                { value: 'OTHER', label: t('orderEntry.payment.method.other') },
              ]}
              value={paymentMethod}
              onChange={setPaymentMethod}
              placeholder={t('orderEntry.payment.paymentMethodPlaceholder')}
              fullWidth
            />
          </AxFormGroup>

          <div style={{ padding: 'var(--spacing-md)', backgroundColor: 'var(--color-background-secondary)', borderRadius: 'var(--radius-md)' }}>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
              {t('orderEntry.payment.invoiceAmount')}
            </AxParagraph>
            <AxParagraph style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
              ${order?.total?.toFixed(2) || '0.00'}
            </AxParagraph>
            {paymentAmount > 0 && (
              <AxParagraph style={{ color: paymentAmount >= (order?.total || 0) ? 'var(--color-success)' : 'var(--color-warning)' }}>
                {t('orderEntry.payment.paymentAmountLabel')} ${paymentAmount.toFixed(2)} {paymentAmount < (order?.total || 0) && t('orderEntry.payment.shortage')}
              </AxParagraph>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    setOrder(updatedOrder);
  };

  const addHistoryRecord = async (step: string, stepLabel: string, notes?: string, status?: string, data?: Record<string, any>, orderToUse?: Order) => {
    const targetOrder = orderToUse || order;
    if (!targetOrder?.id) return;
    try {
      const jsonData = targetOrder.jsonData || {};
      const history = jsonData.history || [];
      const newRecord = {
        step,
        stepLabel,
        timestamp: new Date().toISOString(),
        notes,
        status,
        data,
      };
      jsonData.history = [...history, newRecord];
      const updated = await updateOrder(targetOrder.id, {
        ...targetOrder,
        jsonData,
      });
      setOrder(updated);
    } catch (err) {
      console.error('Error adding history record:', err);
    }
  };

  const handleAddNote = async (note: string) => {
    if (!order?.id) return;
    try {
      // 備考をorder.notesに追加（既存の備考がある場合は改行で追加）
      const updatedNotes = order.notes ? `${order.notes}\n\n${note}` : note;
      const updated = await updateOrder(order.id, {
        ...order,
        notes: updatedNotes,
      });
      setOrder(updated);
      // 履歴にも記録（更新されたorderを使用）
      await addHistoryRecord('note', '備考', note, undefined, undefined, updated);
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  };

  const renderStepContent = () => {
    const selectedCustomer = customers.find(c => c.id === order?.customerId);
    
    switch (currentStep) {
      case 'entry':
        return (
          <OrderEntryStepPage
            order={order}
            onOrderUpdate={handleOrderUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            customers={customers}
            products={products}
            addresses={addresses}
            selectedProduct={selectedProduct}
            quantity={quantity}
            shippingId={shippingId}
            billingId={billingId}
            currentSubStep={currentEntrySubStep}
            onCustomerSelect={handleCustomerSelect}
            onAddProduct={handleAddProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onShippingInfoUpdate={handleShippingInfo}
            onSubStepChange={setCurrentEntrySubStep}
            onSetSelectedProduct={setSelectedProduct}
            onSetQuantity={setQuantity}
            onSetShippingId={setShippingId}
            onSetBillingId={setBillingId}
          />
        );
      case 'approval':
        return (
          <OrderApprovalStepPage
            order={order}
            onOrderUpdate={handleOrderUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            approvalNotes={approvalNotes}
            creditCheckPassed={creditCheckPassed}
            inventoryConfirmed={inventoryConfirmed}
            priceApproved={priceApproved}
            onApprovalNotesChange={setApprovalNotes}
            onCreditCheckChange={setCreditCheckPassed}
            onInventoryConfirmChange={setInventoryConfirmed}
            onPriceApproveChange={setPriceApproved}
          />
        );
      case 'confirmation':
        return (
          <OrderConfirmationStepPage
            order={order}
            onOrderUpdate={handleOrderUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            customer={selectedCustomer}
          />
        );
      case 'shipping_instruction':
        return (
          <OrderShippingInstructionStepPage
            order={order}
            onOrderUpdate={handleOrderUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            shippingInstructions={shippingInstructions}
            requestedShipDate={requestedShipDate}
            onShippingInstructionsChange={setShippingInstructions}
            onRequestedShipDateChange={setRequestedShipDate}
          />
        );
      case 'shipping':
        return (
          <OrderShippingStepPage
            order={order}
            onOrderUpdate={handleOrderUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            actualShipDate={actualShipDate}
            trackingNumber={trackingNumber}
            onActualShipDateChange={setActualShipDate}
            onTrackingNumberChange={setTrackingNumber}
          />
        );
      case 'invoicing':
        return (
          <OrderInvoicingStepPage
            order={order}
            onOrderUpdate={handleOrderUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            invoiceNumber={invoiceNumber}
            invoiceDate={invoiceDate}
            onInvoiceNumberChange={setInvoiceNumber}
            onInvoiceDateChange={setInvoiceDate}
          />
        );
      case 'payment':
        return (
          <OrderPaymentStepPage
            order={order}
            onOrderUpdate={handleOrderUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            paymentAmount={paymentAmount}
            paymentDate={paymentDate}
            paymentMethod={paymentMethod}
            onPaymentAmountChange={setPaymentAmount}
            onPaymentDateChange={setPaymentDate}
            onPaymentMethodChange={setPaymentMethod}
          />
        );
      case 'history':
        return (
          <OrderHistoryStepPage
            order={order}
            onOrderUpdate={handleOrderUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            onAddNote={handleAddNote}
            customers={customers}
          />
        );
      default:
        return null;
    }
  };

  const selectedCustomer = customers.find(c => c.id === order?.customerId);

  const statusOptions = [
    { value: 'DRAFT', label: t('orderEntry.status.draft') },
    { value: 'PENDING_APPROVAL', label: t('orderEntry.status.pendingApproval') },
    { value: 'APPROVED', label: t('orderEntry.status.approved') },
    { value: 'SHIPPING_INSTRUCTED', label: t('orderEntry.status.shippingInstructed') },
    { value: 'SHIPPED', label: t('orderEntry.status.shipped') },
    { value: 'INVOICED', label: t('orderEntry.status.invoiced') },
    { value: 'PAID', label: t('orderEntry.status.paid') },
    { value: 'CANCELLED', label: t('orderEntry.status.cancelled') },
  ];

  // WebSocket connection for real-time updates (must be called before any early returns)
  const orderId = order?.id;
  useWebSocket({
    onOrderUpdate: (updatedOrder: Order) => {
      // Update the order if it's the current order being edited
      if (orderId === updatedOrder.id) {
        console.log('WebSocket: Order updated, refreshing UI', updatedOrder);
        setOrder(updatedOrder);
      }
    },
    enabled: !!orderId, // Only connect when we have an order
  });

  // Show loading state only if order is not initialized yet
  if (!order || !order.id) {
    return (
      <PageContainer>
        <ContentCard padding="large">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', gap: 'var(--spacing-md)' }}>
            <AxParagraph>{loading ? 'Initializing order...' : 'Loading order...'}</AxParagraph>
            {process.env.NODE_ENV === 'development' && (
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                Order state: {order ? 'exists but no ID' : 'null'}, Loading: {loading ? 'true' : 'false'}
              </AxParagraph>
            )}
          </div>
        </ContentCard>
      </PageContainer>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!order || !order.id) {
      console.error('Cannot update status: order is missing', { order });
      return;
    }
    try {
      const oldStatus = order.status;
      const updated = await updateOrder(order.id, {
        ...order,
        status: newStatus as Order['status'],
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('status_change', 'ステータス変更', undefined, newStatus, {
        oldStatus: oldStatus,
        newStatus: newStatus,
      }, updated);
      console.log('Status updated:', {
        orderId: order.id,
        newStatus: newStatus,
      });
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    }
  };

  const handleNotesChange = async (notes: string) => {
    if (!order || !order.id) {
      return;
    }
    try {
      const updated = await updateOrder(order.id, {
        ...order,
        notes: notes,
      });
      setOrder(updated);
    } catch (err) {
      console.error('Error updating order notes:', err);
      alert('Failed to update order notes');
    }
  };

  return (
    <PageContainer>
      <HeaderCard padding="large">
        <HeaderSection>
          <HeaderLeft>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={handleNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                {t('orderEntry.back')}
              </AxButton>
            )}
            <div style={{ flex: 1 }}>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {t('orderEntry.title')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {t('orderEntry.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {selectedCustomer && (
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                  minWidth: '200px'
                }}>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    {t('orderEntry.customer')}
                  </AxParagraph>
                  <AxParagraph style={{ fontSize: 'var(--font-size-sm)' }}>
                    {selectedCustomer.companyName || `${selectedCustomer.lastName} ${selectedCustomer.firstName}` || selectedCustomer.email}
                  </AxParagraph>
                  {selectedCustomer.email && (
                    <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-xs)' }}>
                      {selectedCustomer.email}
                    </AxParagraph>
                  )}
                </div>
              )}
              {order?.id && (
                <>
                  <div style={{ 
                    padding: 'var(--spacing-md)', 
                    backgroundColor: 'var(--color-background-secondary)', 
                    borderRadius: 'var(--radius-md)',
                    minWidth: '200px'
                  }}>
                    <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                      {t('orderEntry.orderStatus')}
                    </AxParagraph>
                    <AxListbox
                      key={`status-${order.id}-${order.status || 'null'}`}
                      options={statusOptions}
                      value={order?.status || null}
                      onChange={(value) => {
                        if (value) {
                          handleStatusChange(value);
                        }
                      }}
                      placeholder={t('orderEntry.selectStatus')}
                      fullWidth
                      disabled={loading || !order?.id}
                    />
                  </div>
                </>
              )}
            </div>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large">
        <StepIndicator>
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = isStepCompleted(step.key);
            return (
              <Step
                key={step.key}
                $active={isActive}
                $completed={isCompleted}
                onClick={() => {
                  if (isCompleted || isActive) {
                    setCurrentStep(step.key);
                    if (step.key === 'entry') {
                      setCurrentEntrySubStep('review');
                    }
                  }
                }}
                title={step.description}
              >
                {index + 1}. {step.label}
              </Step>
            );
          })}
        </StepIndicator>

        <StepContent>
          {renderStepContent()}
        </StepContent>

        <ButtonGroup>
          <AxButton
            variant="secondary"
            onClick={handlePrevious}
            disabled={(currentStep === 'entry' && currentEntrySubStep === 'customer') || submitting}
          >
            {t('orderEntry.previous')}
          </AxButton>
          {currentStep === 'entry' && currentEntrySubStep === 'review' ? (
            <AxButton
              variant="primary"
              onClick={handleCompleteEntry}
              disabled={!canProceedToNext() || submitting}
            >
              {submitting ? t('orderEntry.saving') : (orderIdToEdit ? t('orderEntry.saveOrder') : t('orderEntry.completeOrder'))}
            </AxButton>
          ) : currentStep === 'approval' ? (
            <AxButton
              variant="primary"
              onClick={handleApproveOrder}
              disabled={!canProceedToNext() || submitting}
            >
              {submitting ? t('orderEntry.approving') : t('orderEntry.approveOrder')}
            </AxButton>
          ) : currentStep === 'confirmation' ? (
            <AxButton
              variant="primary"
              onClick={handleConfirmOrder}
              disabled={!canProceedToNext() || submitting}
            >
              {submitting ? t('orderEntry.confirming') : t('orderEntry.confirmOrder')}
            </AxButton>
          ) : currentStep === 'shipping_instruction' ? (
            <AxButton
              variant="primary"
              onClick={handleShippingInstruction}
              disabled={!canProceedToNext() || submitting}
            >
              {submitting ? t('orderEntry.submitting') : t('orderEntry.submitShippingInstruction')}
            </AxButton>
          ) : currentStep === 'shipping' ? (
            <AxButton
              variant="primary"
              onClick={handleShipOrder}
              disabled={!canProceedToNext() || submitting}
            >
              {submitting ? t('orderEntry.shipping') : t('orderEntry.shipOrder')}
            </AxButton>
          ) : currentStep === 'invoicing' ? (
            <AxButton
              variant="primary"
              onClick={handleInvoiceOrder}
              disabled={!canProceedToNext() || submitting}
            >
              {submitting ? t('orderEntry.invoicing') : t('orderEntry.createInvoice')}
            </AxButton>
          ) : currentStep === 'payment' ? (
            <AxButton
              variant="primary"
              onClick={handlePayment}
              disabled={!canProceedToNext() || submitting}
            >
              {submitting ? t('orderEntry.processing') : t('orderEntry.completePayment')}
            </AxButton>
          ) : currentStep === 'history' ? (
            <AxButton
              variant="secondary"
              onClick={() => {
                if (onNavigateToOrders) {
                  onNavigateToOrders();
                } else {
                  handlePrevious();
                }
              }}
              disabled={submitting}
            >
              {onNavigateToOrders ? t('orderEntry.backToOrders') : t('orderEntry.previous')}
            </AxButton>
          ) : (
            <AxButton
              variant="primary"
              onClick={handleNext}
              disabled={!canProceedToNext() || submitting}
            >
              {t('orderEntry.next')}
            </AxButton>
          )}
        </ButtonGroup>
      </ContentCard>
    </PageContainer>
  );
}

