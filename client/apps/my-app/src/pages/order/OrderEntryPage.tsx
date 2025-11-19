import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
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
  getNextInvoiceNumber,
  Order,
} from '../../api/orderApi';
import { OrderStep, EntrySubStep } from './types';
import { OrderEntryStepPage } from './OrderEntryStepPage';
import { OrderApprovalStepPage } from './OrderApprovalStepPage';
import { OrderConfirmationStepPage } from './OrderConfirmationStepPage';
import { OrderShippingInstructionStepPage } from './OrderShippingInstructionStepPage';
import { OrderShippingStepPage } from './OrderShippingStepPage';
import { OrderInvoicingStepPage } from './OrderInvoicingStepPage';
import { OrderHistoryStepPage } from './OrderHistoryStepPage';
import { OrderEntryPageRender } from './OrderEntryPage.render';
import { PageContainer, ContentCard } from './OrderEntryPage.styles';
import { 
  AxParagraph, 
} from '@ui/components';



// Module-level flag to prevent duplicate order creation across component instances
let isCreatingOrderGlobal = false;

interface OrderEntryPageProps {
  onNavigateToOrders?: () => void;
  orderIdToEdit?: string | null;
  onNavigateBack?: () => void;
  readOnly?: boolean; // If true, all fields are read-only except history notes
  title?: string; // Custom title for the page
  subtitle?: string; // Custom subtitle for the page
}

export function OrderEntryPage(props: OrderEntryPageProps = {}) {
  const { onNavigateToOrders, orderIdToEdit, onNavigateBack, readOnly = false, title, subtitle } = props;
  const { l10n } = useI18n();
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

  const steps: { key: OrderStep; label: string; description: string }[] = [
    { key: 'entry', label: l10n('orderEntry.step.entry'), description: l10n('orderEntry.step.entry') },
    { key: 'approval', label: l10n('orderEntry.step.approval'), description: l10n('orderEntry.step.approval') },
    { key: 'confirmation', label: l10n('orderEntry.step.confirmation'), description: l10n('orderEntry.step.confirmation') },
    { key: 'shipping_instruction', label: l10n('orderEntry.step.shippingInstruction'), description: l10n('orderEntry.step.shippingInstruction') },
    { key: 'shipping', label: l10n('orderEntry.step.shipping'), description: l10n('orderEntry.step.shipping') },
    { key: 'invoicing', label: l10n('orderEntry.step.invoicing'), description: l10n('orderEntry.step.invoicing') },
    { key: 'history', label: l10n('orderEntry.step.history'), description: l10n('orderEntry.step.history') },
  ];

  const entrySubSteps: { key: EntrySubStep; label: string }[] = [
    { key: 'customer', label: l10n('orderEntry.subStep.customer') },
    { key: 'products', label: l10n('orderEntry.subStep.products') },
    { key: 'shipping', label: l10n('orderEntry.subStep.shipping') },
    { key: 'review', label: l10n('orderEntry.subStep.review') },
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

  // In read-only mode, start from entry step with customer sub-step
  useEffect(() => {
    if (readOnly && order) {
      if (currentStep !== 'entry') {
        setCurrentStep('entry');
      }
      if (currentEntrySubStep !== 'customer') {
        setCurrentEntrySubStep('customer');
      }
    }
  }, [readOnly, order]);

  // Auto-generate invoice number when entering invoicing step
  useEffect(() => {
    if (currentStep === 'invoicing' && order) {
      // Check if invoice number is already set (from Order entity or jsonData)
      const existingInvoiceNumber = order.invoiceNumber || order.jsonData?.invoiceNumber;
      if (!invoiceNumber && !existingInvoiceNumber) {
        const loadInvoiceNumber = async () => {
          try {
            const nextInvoiceNumber = await getNextInvoiceNumber();
            setInvoiceNumber(nextInvoiceNumber);
            // Set invoice date to today if not set
            if (!invoiceDate) {
              const today = new Date().toISOString().split('T')[0];
              setInvoiceDate(today);
            }
          } catch (err) {
            console.error('Error loading invoice number:', err);
          }
        };
        loadInvoiceNumber();
      } else if (existingInvoiceNumber && !invoiceNumber) {
        // Load existing invoice number if not already loaded in state
        setInvoiceNumber(existingInvoiceNumber);
        // Load existing invoice date if available
        if (order.invoiceDate && !invoiceDate) {
          const invoiceDateValue = new Date(order.invoiceDate).toISOString().split('T')[0];
          setInvoiceDate(invoiceDateValue);
        } else if (order.jsonData?.invoiceDate && !invoiceDate) {
          setInvoiceDate(order.jsonData.invoiceDate);
        } else if (!invoiceDate) {
          // Set invoice date to today if not set
          const today = new Date().toISOString().split('T')[0];
          setInvoiceDate(today);
        }
      }
    }
  }, [currentStep, order, invoiceNumber, invoiceDate]);

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
              // Load invoice number from Order entity or jsonData (for backward compatibility)
              setInvoiceNumber(existingOrder.invoiceNumber || existingOrder.jsonData?.invoiceNumber || '');
              // Load invoice date from Order entity or jsonData (for backward compatibility)
              const invoiceDateValue = existingOrder.invoiceDate 
                ? new Date(existingOrder.invoiceDate).toISOString().split('T')[0]
                : existingOrder.jsonData?.invoiceDate || '';
              setInvoiceDate(invoiceDateValue);
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
                setCurrentStep('history');
                break;
              case 'PAID':
                setCurrentStep('history');
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
        // Only log non-404 errors (404 is expected when order doesn't exist)
        if (err instanceof Error) {
          const is404 = err.message.includes('404') || err.message.includes('HTTP 404');
          if (!is404) {
            console.error('Error initializing order:', err);
            alert('Failed to initialize order. Please refresh the page and try again.');
          } else {
            // For 404, just set order to null - user can create a new order
            setOrder(null);
          }
        } else {
          console.error('Error initializing order:', err);
          alert('Failed to initialize order. Please refresh the page and try again.');
        }
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

  const handleShippingInfo = async (shippingAddressId: string, billingAddressId: string, retryCount = 0) => {
    if (!order) {
      console.warn('Cannot update shipping info: order is missing');
      return;
    }
    
    // Prevent infinite recursion
    if (retryCount > 1) {
      console.error('Too many retries for shipping info update');
      alert('Failed to update shipping information after multiple attempts. Please refresh the page.');
      return;
    }
    
    // If order doesn't have an ID, create it first
    if (!order.id) {
      try {
        await handleCreateOrder();
        // Wait a bit for state to update, then retry
        await new Promise(resolve => setTimeout(resolve, 100));
        // After creation, retry the update
        const currentOrder = orderRef.current;
        if (currentOrder?.id) {
          return handleShippingInfo(shippingAddressId, billingAddressId, retryCount + 1);
        }
      } catch (err) {
        console.error('Error creating order before updating shipping info:', err);
        alert('Failed to create order. Please try again.');
        return;
      }
    }
    
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update shipping information';
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        console.error('Order not found in backend. Order ID:', order.id);
        // Try to recreate the order if it was lost (only once)
        if (retryCount === 0) {
          try {
            console.log('Attempting to recreate order...');
            await handleCreateOrder();
            // Wait a bit for state to update
            await new Promise(resolve => setTimeout(resolve, 100));
            // Retry the update after recreation
            const currentOrder = orderRef.current;
            if (currentOrder?.id) {
              const retryUpdated = await updateOrder(currentOrder.id, {
                ...currentOrder,
                shippingAddressId,
                billingAddressId,
              });
              setOrder(retryUpdated);
              return;
            }
          } catch (recreateErr) {
            console.error('Failed to recreate order:', recreateErr);
          }
        }
        alert('Order not found. Please refresh the page and try again.');
      } else {
        alert(`Failed to update shipping information: ${errorMessage}`);
      }
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
      await addHistoryRecord('approval', l10n('orderEntry.history.step.approval'), approvalNotes, 'APPROVED', {
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
      await addHistoryRecord('confirmation', l10n('orderEntry.history.step.confirmation'), undefined, 'APPROVED', {
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
      await addHistoryRecord('shipping_instruction', l10n('orderEntry.history.step.shippingInstruction'), shippingInstructions, 'SHIPPING_INSTRUCTED', {
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
      await addHistoryRecord('shipping', l10n('orderEntry.history.step.shipping'), undefined, 'SHIPPED', {
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
      // Set invoice date as LocalDateTime string format
      const invoiceDateObj = invoiceDate ? new Date(invoiceDate + 'T00:00:00').toISOString() : undefined;
      const updated = await updateOrder(order.id!, {
        ...order,
        status: 'INVOICED',
        invoiceNumber: invoiceNumber || undefined, // Store in Order entity for A/R processing
        invoiceDate: invoiceDateObj, // Store in Order entity
        jsonData,
      });
      setOrder(updated);
      // 履歴に記録（更新されたorderを使用）
      await addHistoryRecord('invoicing', l10n('orderEntry.history.step.invoicing'), undefined, 'INVOICED', {
        invoiceNumber,
        invoiceDate,
        total: updated.total,
      }, updated);
      setCurrentStep('history');
    } catch (err) {
      console.error('Error invoicing order:', err);
      alert('Failed to invoice order');
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

  const isStepCompleted = (step: OrderStep): boolean => {
    if (!order) return false;
    switch (step) {
      case 'entry':
        return order.status !== 'DRAFT' || !!(order.customerId && order.items && order.items.length > 0 && order.shippingAddressId && order.billingAddressId);
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
      case 'history':
        return true; // 履歴ページは常にアクセス可能
      default:
        return false;
    }
  };

  const canProceedToNext = (): boolean => {
    if (currentStep === 'entry') {
      switch (currentEntrySubStep) {
        case 'customer':
          return !!order?.customerId;
        case 'products':
          return !!(order?.items && order.items.length > 0);
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
        return !!(creditCheckPassed && inventoryConfirmed && priceApproved);
      case 'confirmation':
        return true;
      case 'shipping_instruction':
        return !!requestedShipDate;
      case 'shipping':
        return !!actualShipDate;
      case 'invoicing':
        return !!invoiceNumber && !!invoiceDate;
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

  const handleSetCurrentEntrySubStep = (subStep: string) => {
    if (subStep === 'customer' || subStep === 'products' || subStep === 'shipping' || subStep === 'review') {
      setCurrentEntrySubStep(subStep);
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
            readOnly={readOnly}
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
            onAddressesRefresh={async () => {
              if (order?.customerId) {
                await loadAddresses(order.customerId);
              }
            }}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
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
            readOnly={readOnly}
            invoiceNumber={invoiceNumber}
            invoiceDate={invoiceDate}
            onInvoiceNumberChange={setInvoiceNumber}
            onInvoiceDateChange={setInvoiceDate}
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
            readOnly={readOnly}
            onAddNote={handleAddNote}
            customers={customers}
          />
        );
      default:
        return null;
    }
  };

  const statusOptions = [
    { value: 'DRAFT', label: l10n('orderEntry.status.draft') },
    { value: 'PENDING_APPROVAL', label: l10n('orderEntry.status.pendingApproval') },
    { value: 'APPROVED', label: l10n('orderEntry.status.approved') },
    { value: 'SHIPPING_INSTRUCTED', label: l10n('orderEntry.status.shippingInstructed') },
    { value: 'SHIPPED', label: l10n('orderEntry.status.shipped') },
    { value: 'INVOICED', label: l10n('orderEntry.status.invoiced') },
    { value: 'PAID', label: l10n('orderEntry.status.paid') },
    { value: 'CANCELLED', label: l10n('orderEntry.status.cancelled') },
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
              <AxParagraph size="sm" color="secondary">
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

  return (
    <OrderEntryPageRender
      order={order}
      customers={customers}
      addresses={addresses}
      loading={loading}
      submitting={submitting}
      readOnly={readOnly}
      title={title}
      subtitle={subtitle}
      currentStep={currentStep}
      currentEntrySubStep={currentEntrySubStep}
      steps={steps}
      statusOptions={statusOptions}
      onNavigateBack={onNavigateBack}
      onNavigateToOrders={onNavigateToOrders}
      renderStepContent={renderStepContent}
      isStepCompleted={isStepCompleted}
      canProceedToNext={canProceedToNext}
      handleNavigateBack={handleNavigateBack}
      handlePrevious={handlePrevious}
      handleNext={handleNext}
      handleCompleteEntry={handleCompleteEntry}
      handleApproveOrder={handleApproveOrder}
      handleConfirmOrder={handleConfirmOrder}
      handleShippingInstruction={handleShippingInstruction}
      handleShipOrder={handleShipOrder}
      handleInvoiceOrder={handleInvoiceOrder}
      setCurrentStep={setCurrentStep}
      setCurrentEntrySubStep={handleSetCurrentEntrySubStep}
      onStatusChange={handleStatusChange}
      orderIdToEdit={orderIdToEdit}
      l10n={l10n}
    />
  );
}
