import { useState, useEffect, useRef } from 'react';
import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxListbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchVendors, Vendor } from '../../api/vendorApi';
import { fetchAddressesByVendorId, Address } from '../../api/addressApi';
import { fetchActiveProducts, Product } from '../../api/productApi';
import {
  createPurchaseOrder,
  updatePurchaseOrder,
  addPurchaseOrderItem,
  updatePurchaseOrderItemQuantity,
  removePurchaseOrderItem,
  fetchPurchaseOrdersByStatus,
  fetchPurchaseOrderById,
  deletePurchaseOrder,
  getNextInvoiceNumber,
  PurchaseOrder,
} from '../../api/purchaseOrderApi';
import styled from '@emotion/styled';
import { PurchaseOrderStep, EntrySubStep } from './types';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'PurchaseOrderEntryPage';
import { PurchaseOrderEntryStepPage } from './PurchaseOrderEntryStepPage';
import { PurchaseOrderApprovalStepPage } from './PurchaseOrderApprovalStepPage';
import { PurchaseOrderReceivedStepPage } from './PurchaseOrderReceivedStepPage';
import { PurchaseOrderInvoicingStepPage } from './PurchaseOrderInvoicingStepPage';
import { PurchaseOrderHistoryStepPage } from './PurchaseOrderHistoryStepPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-md);
  box-sizing: border-box;
  flex: 1;
`;

const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-sm) var(--spacing-md) !important;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xs);
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
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 2px solid var(--color-border-default);
  flex-shrink: 0;
  align-items: center;
  position: relative;
  width: 100%;
`;

const StepScrollContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  flex: 1 1 auto;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  align-items: center;
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--color-border-default);
    border-radius: 3px;
  }
`;

const HistoryStepContainer = styled.div`
  flex-shrink: 0;
  margin-left: var(--spacing-sm);
`;

const Step = styled.div<{ $active: boolean; $completed: boolean }>`
  flex: none;
  padding: var(--spacing-sm) var(--spacing-md);
  text-align: center;
  border-radius: var(--radius-md);
  white-space: nowrap;
  font-size: var(--font-size-sm);
  background-color: ${props => 
    props.$active ? 'var(--color-primary)' : 
    props.$completed ? 'var(--color-success)' : 
    'var(--color-background-secondary)'};
  color: ${props => 
    props.$active || props.$completed ? 'var(--color-text-inverse)' : 
    'var(--color-text-secondary)'};
  font-weight: ${props => props.$active ? 'var(--font-weight-bold)' : 'var(--font-weight-normal)'};
  cursor: ${props => props.$completed ? 'pointer' : 'not-allowed'};
  opacity: ${props => !props.$completed && !props.$active ? 0.5 : 1};
  transition: all var(--transition-base);
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  overflow: visible;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 2px solid var(--color-border-default);
  flex-shrink: 0;
`;

// Module-level flag to prevent duplicate PO creation across component instances
let isCreatingPOGlobal = false;

interface PurchaseOrderEntryPageProps {
  onNavigateToPOs?: () => void;
  poIdToEdit?: string | null;
  onNavigateBack?: () => void;
  readOnly?: boolean; // If true, all fields are read-only except history notes
  title?: string; // Custom title for the page
  subtitle?: string; // Custom subtitle for the page
}

export function PurchaseOrderEntryPage(props: PurchaseOrderEntryPageProps = {}) {
  const { onNavigateToPOs, poIdToEdit, onNavigateBack, readOnly = false, title, subtitle } = props;
  const { l10n } = useI18n();
  const [currentStep, setCurrentStep] = useState<PurchaseOrderStep>('entry');
  const [currentEntrySubStep, setCurrentEntrySubStep] = useState<EntrySubStep>('supplier');
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isCreatingPORef = useRef(false);
  const poRef = useRef<PurchaseOrder | null>(null);
  
  // Product selection state
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  
  // Shipping address state
  const [shippingId, setShippingId] = useState<string | null>(null);
  const [billingId, setBillingId] = useState<string | null>(null);
  
  // Expected delivery date state
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');

  // Approval state
  const [approvalNotes, setApprovalNotes] = useState<string>('');

  // Received state
  const [receivedDate, setReceivedDate] = useState<string>('');

  // Invoicing state
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>('');

  const steps: { key: PurchaseOrderStep; label: string; description: string }[] = [
    { key: 'entry', label: l10n('purchaseOrderEntry.step.entry'), description: l10n('purchaseOrderEntry.step.entry') },
    { key: 'approval', label: l10n('purchaseOrderEntry.step.approval'), description: l10n('purchaseOrderEntry.step.approval') },
    { key: 'received', label: l10n('purchaseOrderEntry.step.received'), description: l10n('purchaseOrderEntry.step.received') },
    { key: 'invoicing', label: l10n('purchaseOrderEntry.step.invoicing'), description: l10n('purchaseOrderEntry.step.invoicing') },
    { key: 'history', label: l10n('purchaseOrderEntry.step.history'), description: l10n('purchaseOrderEntry.step.history') },
  ];

  const entrySubSteps: { key: EntrySubStep; label: string }[] = [
    { key: 'supplier', label: 'Supplier' },
    { key: 'products', label: 'Products' },
    { key: 'shipping', label: 'Shipping' },
    { key: 'review', label: 'Review' },
  ];

  useEffect(() => {
    loadVendors();
    loadProducts();
  }, []);

  useEffect(() => {
    if (po?.supplierId) {
      loadAddresses(po.supplierId);
    }
  }, [po?.supplierId]);

  // Sync shipping/billing IDs and expected delivery date with PO when PO changes
  useEffect(() => {
    if (po) {
      setShippingId(po.shippingAddressId || null);
      setBillingId(po.billingAddressId || null);
      if (po.expectedDeliveryDate) {
        const dateValue = new Date(po.expectedDeliveryDate).toISOString().split('T')[0];
        setExpectedDeliveryDate(dateValue);
      } else {
        setExpectedDeliveryDate('');
      }
    }
  }, [po?.shippingAddressId, po?.billingAddressId, po?.expectedDeliveryDate]);

  // Keep poRef in sync with po state for cleanup
  useEffect(() => {
    poRef.current = po;
  }, [po]);

  // In read-only mode, start from entry step with supplier sub-step
  useEffect(() => {
    if (readOnly && po) {
      if (currentStep !== 'entry') {
        setCurrentStep('entry');
      }
      if (currentEntrySubStep !== 'supplier') {
        setCurrentEntrySubStep('supplier');
      }
    }
  }, [readOnly, po]);

  // Auto-generate invoice number when entering invoicing step
  useEffect(() => {
    if (currentStep === 'invoicing' && po) {
      const existingInvoiceNumber = po.invoiceNumber || po.jsonData?.invoiceNumber;
      if (!invoiceNumber && !existingInvoiceNumber) {
        const loadInvoiceNumber = async () => {
          try {
            const nextInvoiceNumber = await getNextInvoiceNumber();
            setInvoiceNumber(nextInvoiceNumber);
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
        setInvoiceNumber(existingInvoiceNumber);
        if (po.invoiceDate && !invoiceDate) {
          const invoiceDateValue = new Date(po.invoiceDate).toISOString().split('T')[0];
          setInvoiceDate(invoiceDateValue);
        } else if (po.jsonData?.invoiceDate && !invoiceDate) {
          setInvoiceDate(po.jsonData.invoiceDate);
        } else if (!invoiceDate) {
          const today = new Date().toISOString().split('T')[0];
          setInvoiceDate(today);
        }
      }
    }
  }, [currentStep, po, invoiceNumber, invoiceDate]);

  const loadVendors = async () => {
    try {
      const data = await fetchVendors();
      setVendors(data);
    } catch (err) {
      console.error('Error loading vendors:', err);
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

  const loadAddresses = async (vendorId: string) => {
    try {
      const data = await fetchAddressesByVendorId(vendorId);
      setAddresses(data);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  const handleCreatePO = async () => {
    if (isCreatingPORef.current || isCreatingPOGlobal) {
      console.log('PO creation already in progress, skipping...');
      return;
    }
    if (po?.id) {
      console.log('PO already exists, skipping creation');
      return;
    }
    try {
      isCreatingPORef.current = true;
      isCreatingPOGlobal = true;
      setLoading(true);
      const newPO: Partial<PurchaseOrder> = {
        status: 'DRAFT',
        items: [],
        subtotal: 0,
        tax: 0,
        shippingCost: 0,
        total: 0,
      };
      const created = await createPurchaseOrder(newPO);
      if (!created || !created.id) {
        throw new Error('PO was created but no ID was returned');
      }
      console.log('PO created with ID:', created.id);
      setPO(created);
    } catch (err) {
      console.error('Error creating PO:', err);
      alert('Failed to create purchase order. Please refresh the page and try again.');
    } finally {
      setLoading(false);
      isCreatingPORef.current = false;
      isCreatingPOGlobal = false;
    }
  };

  useEffect(() => {
    const initializePO = async () => {
      if (poIdToEdit && po?.id !== poIdToEdit) {
        setPO(null);
      }
      
      if ((po?.id && (!poIdToEdit || po.id === poIdToEdit)) || isCreatingPORef.current || isCreatingPOGlobal) {
        return;
      }
      
      try {
        isCreatingPORef.current = true;
        isCreatingPOGlobal = true;
        setLoading(true);
        
        if (poIdToEdit) {
          console.log('Loading PO for editing:', poIdToEdit);
          const existingPO = await fetchPurchaseOrderById(poIdToEdit);
          if (existingPO && existingPO.id) {
            console.log('PO loaded:', existingPO.id);
            setPO(existingPO);
            
            if (existingPO.jsonData) {
              setApprovalNotes(existingPO.jsonData.approvalNotes || '');
              setReceivedDate(existingPO.jsonData.receivedDate || '');
              setInvoiceNumber(existingPO.invoiceNumber || existingPO.jsonData?.invoiceNumber || '');
              const invoiceDateValue = existingPO.invoiceDate 
                ? new Date(existingPO.invoiceDate).toISOString().split('T')[0]
                : existingPO.jsonData?.invoiceDate || '';
              setInvoiceDate(invoiceDateValue);
            }
            
            // Load expected delivery date
            if (existingPO.expectedDeliveryDate) {
              const expectedDateValue = new Date(existingPO.expectedDeliveryDate).toISOString().split('T')[0];
              setExpectedDeliveryDate(expectedDateValue);
            }
            
            // Set step based on PO status
            switch (existingPO.status) {
              case 'DRAFT':
                if (existingPO.supplierId) {
                  if (existingPO.items && existingPO.items.length > 0) {
                    if (existingPO.shippingAddressId && existingPO.billingAddressId) {
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
                  setCurrentEntrySubStep('supplier');
                }
                break;
              case 'PENDING_APPROVAL':
                setCurrentStep('approval');
                break;
              case 'APPROVED':
                setCurrentStep('received');
                break;
              case 'RECEIVED':
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
                setCurrentEntrySubStep('supplier');
            }
            return;
          } else {
            throw new Error('PO not found');
          }
        }
        
        const draftPOs = await fetchPurchaseOrdersByStatus('DRAFT');
        
        if (draftPOs && draftPOs.length > 0) {
          const existingPO = draftPOs[0];
          console.log('Using existing DRAFT PO:', existingPO.id);
          if (existingPO && existingPO.id) {
            setPO(existingPO);
            return;
          }
        }
        
        console.log('Creating new DRAFT PO...');
        const newPO: Partial<PurchaseOrder> = {
          status: 'DRAFT',
          items: [],
          subtotal: 0,
          tax: 0,
          shippingCost: 0,
          total: 0,
        };
        const created = await createPurchaseOrder(newPO);
        if (!created || !created.id) {
          throw new Error('PO was created but no ID was returned');
        }
        console.log('PO created with ID:', created.id);
        setPO(created);
      } catch (err) {
        console.error('Error initializing PO:', err);
        alert('Failed to initialize purchase order. Please refresh the page and try again.');
      } finally {
        setLoading(false);
        isCreatingPORef.current = false;
        isCreatingPOGlobal = false;
      }
    };
    
    initializePO();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poIdToEdit]);

  const handleSupplierSelect = async (supplierId: string) => {
    if (!po) {
      console.error('No PO available');
      return;
    }
    if (!po.id) {
      console.error('PO has no ID, cannot update');
      alert('PO is not ready yet. Please wait a moment and try again.');
      return;
    }
    try {
      setLoading(true);
      console.log('Updating PO:', po.id, 'with supplier:', supplierId);
      const updated = await updatePurchaseOrder(po.id, { ...po, supplierId });
      if (!updated || !updated.id) {
        throw new Error('PO update failed - no PO returned');
      }
      setPO(updated);
      await loadAddresses(supplierId);
    } catch (err) {
      console.error('Error updating PO:', err);
      alert('Failed to update purchase order. Please refresh the page and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (productId: string, quantity: number = 1) => {
    if (!po?.id) return;
    try {
      setLoading(true);
      const updated = await addPurchaseOrderItem(po.id, productId, quantity);
      setPO(updated);
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (!po?.id) return;
    try {
      setLoading(true);
      const updated = await updatePurchaseOrderItemQuantity(po.id, itemId, quantity);
      setPO(updated);
    } catch (err) {
      console.error('Error updating quantity:', err);
      alert('Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!po?.id) return;
    try {
      setLoading(true);
      const updated = await removePurchaseOrderItem(po.id, itemId);
      setPO(updated);
    } catch (err) {
      console.error('Error removing item:', err);
      alert('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const handleShippingInfo = async (shippingAddressId: string, billingAddressId: string) => {
    if (!po) return;
    try {
      setLoading(true);
      const updated = await updatePurchaseOrder(po.id!, {
        ...po,
        shippingAddressId,
        billingAddressId,
      });
      setPO(updated);
    } catch (err) {
      console.error('Error updating shipping info:', err);
      alert('Failed to update shipping information');
    } finally {
      setLoading(false);
    }
  };

  const handleExpectedDeliveryDateUpdate = async (date: string) => {
    if (!po) return;
    try {
      setLoading(true);
      const dateObj = date ? new Date(date + 'T00:00:00').toISOString() : null;
      const updated = await updatePurchaseOrder(po.id!, {
        ...po,
        expectedDeliveryDate: dateObj,
      });
      setPO(updated);
    } catch (err) {
      console.error('Error updating expected delivery date:', err);
      alert('Failed to update expected delivery date');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEntry = async () => {
    if (!po) return;
    try {
      setSubmitting(true);
      const updated = await updatePurchaseOrder(po.id!, {
        ...po,
        status: 'PENDING_APPROVAL',
      });
      setPO(updated);
      await addHistoryRecord('entry', l10n('purchaseOrderEntry.history.step.entry'), undefined, 'PENDING_APPROVAL', {
        supplierId: updated.supplierId,
        itemCount: updated.items?.length || 0,
        total: updated.total,
      }, updated);
      alert(l10n('purchaseOrderEntry.submittedForApproval'));
      if (onNavigateToPOs) {
        onNavigateToPOs();
      }
    } catch (err) {
      console.error('Error completing entry:', err);
      alert(l10n('purchaseOrderEntry.failedToComplete'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovePO = async () => {
    if (!po) return;
    try {
      setSubmitting(true);
      const jsonData = po.jsonData || {};
      jsonData.approvalNotes = approvalNotes;
      jsonData.approvedAt = new Date().toISOString();
      const updated = await updatePurchaseOrder(po.id!, {
        ...po,
        status: 'APPROVED',
        notes: approvalNotes || po.notes,
        jsonData,
      });
      setPO(updated);
      await addHistoryRecord('approval', l10n('purchaseOrderEntry.history.step.approval'), approvalNotes, 'APPROVED', {}, updated);
      setCurrentStep('received');
    } catch (err) {
      console.error('Error approving PO:', err);
      alert(l10n('purchaseOrderEntry.failedToApprove'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceivePO = async () => {
    if (!po) return;
    try {
      setSubmitting(true);
      const jsonData = po.jsonData || {};
      jsonData.receivedDate = receivedDate;
      const receivedDateObj = receivedDate ? new Date(receivedDate + 'T00:00:00').toISOString() : new Date().toISOString();
      const updated = await updatePurchaseOrder(po.id!, {
        ...po,
        status: 'RECEIVED',
        jsonData,
      });
      setPO(updated);
      await addHistoryRecord('received', l10n('purchaseOrderEntry.history.step.received'), undefined, 'RECEIVED', {
        receivedDate,
      }, updated);
      setCurrentStep('invoicing');
    } catch (err) {
      console.error('Error receiving PO:', err);
      alert(l10n('purchaseOrderEntry.failedToReceive'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvoicePO = async () => {
    if (!po) return;
    try {
      setSubmitting(true);
      const jsonData = po.jsonData || {};
      jsonData.invoiceNumber = invoiceNumber;
      jsonData.invoiceDate = invoiceDate;
      const invoiceDateObj = invoiceDate ? new Date(invoiceDate + 'T00:00:00').toISOString() : null;
      const updated = await updatePurchaseOrder(po.id!, {
        ...po,
        status: 'INVOICED',
        invoiceNumber: invoiceNumber,
        invoiceDate: invoiceDateObj,
        jsonData,
      });
      setPO(updated);
      await addHistoryRecord('invoicing', l10n('purchaseOrderEntry.history.step.invoicing'), undefined, 'INVOICED', {
        invoiceNumber,
        invoiceDate,
        total: updated.total,
      }, updated);
      setCurrentStep('history');
    } catch (err) {
      console.error('Error invoicing PO:', err);
      alert(l10n('purchaseOrderEntry.failedToInvoice'));
    } finally {
      setSubmitting(false);
    }
  };

  // Cleanup function to delete DRAFT PO when leaving the page
  const cleanupDraftPO = async (poToCleanup: PurchaseOrder | null) => {
    if (
      poToCleanup?.id &&
      poToCleanup.status === 'DRAFT' &&
      !poIdToEdit
    ) {
      try {
        console.log('Cleaning up DRAFT PO:', poToCleanup.id);
        await deletePurchaseOrder(poToCleanup.id);
        console.log('DRAFT PO deleted successfully');
      } catch (err) {
        console.error('Error deleting DRAFT PO:', err);
      }
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      const currentPO = poRef.current;
      if (currentPO?.id && currentPO.status === 'DRAFT' && !poIdToEdit) {
        fetch(`http://localhost:8080/api/purchase-orders/${currentPO.id}`, {
          method: 'DELETE',
          keepalive: true,
        }).catch((err) => {
          console.error('Error deleting DRAFT PO on unmount:', err);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle browser close/refresh with beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentPO = poRef.current;
      if (currentPO?.id && currentPO.status === 'DRAFT' && !poIdToEdit) {
        fetch(`http://localhost:8080/api/purchase-orders/${currentPO.id}`, {
          method: 'DELETE',
          keepalive: true,
        }).catch((err) => {
          console.error('Error deleting DRAFT PO on beforeunload:', err);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [poIdToEdit]);

  const handleNavigateBack = () => {
    if (po?.id && po.status === 'DRAFT' && !poIdToEdit) {
      cleanupDraftPO(po).then(() => {
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

  const getStepIndex = (step: PurchaseOrderStep) => {
    return steps.findIndex(s => s.key === step);
  };

  const isStepCompleted = (step: PurchaseOrderStep) => {
    if (!po) return false;
    switch (step) {
      case 'entry':
        return po.status !== 'DRAFT' || (!!po.supplierId && po.items && po.items.length > 0 && !!po.shippingAddressId && !!po.billingAddressId);
      case 'approval':
        return po.status === 'APPROVED' || po.status === 'RECEIVED' || po.status === 'INVOICED' || po.status === 'PAID';
      case 'received':
        return po.status === 'RECEIVED' || po.status === 'INVOICED' || po.status === 'PAID';
      case 'invoicing':
        return po.status === 'INVOICED' || po.status === 'PAID';
      case 'history':
        return true;
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    if (currentStep === 'entry') {
      switch (currentEntrySubStep) {
        case 'supplier':
          return !!po?.supplierId;
        case 'products':
          return po?.items && po.items.length > 0;
        case 'shipping':
          return !!po?.shippingAddressId && !!po?.billingAddressId;
        case 'review':
          return true;
        default:
          return false;
      }
    }
    
    switch (currentStep) {
      case 'approval':
        return true;
      case 'received':
        return !!receivedDate;
      case 'invoicing':
        return !!invoiceNumber && !!invoiceDate;
      case 'history':
        return true;
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

  const handlePOUpdate = (updatedPO: PurchaseOrder) => {
    setPO(updatedPO);
  };

  const addHistoryRecord = async (step: string, stepLabel: string, notes?: string, status?: string, data?: Record<string, any>, poToUse?: PurchaseOrder) => {
    const targetPO = poToUse || po;
    if (!targetPO?.id) return;
    try {
      const jsonData = targetPO.jsonData || {};
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
      const updated = await updatePurchaseOrder(targetPO.id, {
        ...targetPO,
        jsonData,
      });
      setPO(updated);
    } catch (err) {
      console.error('Error adding history record:', err);
    }
  };

  const handleAddNote = async (note: string) => {
    if (!po?.id) return;
    try {
      const updatedNotes = po.notes ? `${po.notes}\n\n${note}` : note;
      const updated = await updatePurchaseOrder(po.id, {
        ...po,
        notes: updatedNotes,
      });
      setPO(updated);
      await addHistoryRecord('note', l10n('purchaseOrderEntry.history.step.note'), note, undefined, undefined, updated);
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  };

  const renderStepContent = () => {
    const selectedVendor = vendors.find(v => v.id === po?.supplierId);
    
    switch (currentStep) {
      case 'entry':
        return (
          <PurchaseOrderEntryStepPage
            po={po}
            onPOUpdate={handlePOUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            readOnly={readOnly}
            vendors={vendors}
            products={products}
            addresses={addresses}
            selectedProduct={selectedProduct}
            quantity={quantity}
            shippingId={shippingId}
            billingId={billingId}
            expectedDeliveryDate={expectedDeliveryDate}
            currentSubStep={currentEntrySubStep}
            onSupplierSelect={handleSupplierSelect}
            onAddProduct={handleAddProduct}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onShippingInfoUpdate={handleShippingInfo}
            onExpectedDeliveryDateUpdate={handleExpectedDeliveryDateUpdate}
            onSubStepChange={setCurrentEntrySubStep}
            onSetSelectedProduct={setSelectedProduct}
            onSetQuantity={setQuantity}
            onSetShippingId={setShippingId}
            onSetBillingId={setBillingId}
            onSetExpectedDeliveryDate={setExpectedDeliveryDate}
            onAddressesRefresh={async () => {
              if (po?.supplierId) {
                await loadAddresses(po.supplierId);
              }
            }}
          />
        );
      case 'approval':
        return (
          <PurchaseOrderApprovalStepPage
            po={po}
            onPOUpdate={handlePOUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            readOnly={readOnly}
            approvalNotes={approvalNotes}
            onApprovalNotesChange={setApprovalNotes}
          />
        );
      case 'received':
        return (
          <PurchaseOrderReceivedStepPage
            po={po}
            onPOUpdate={handlePOUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            readOnly={readOnly}
            receivedDate={receivedDate}
            onReceivedDateChange={setReceivedDate}
          />
        );
      case 'invoicing':
        return (
          <PurchaseOrderInvoicingStepPage
            po={po}
            onPOUpdate={handlePOUpdate}
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
          <PurchaseOrderHistoryStepPage
            po={po}
            onPOUpdate={handlePOUpdate}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onNavigateBack={onNavigateBack}
            loading={loading}
            submitting={submitting}
            readOnly={readOnly}
            onAddNote={handleAddNote}
            vendors={vendors}
          />
        );
      default:
        return null;
    }
  };

  const selectedVendor = vendors.find(v => v.id === po?.supplierId);

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={handleNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                {l10n('purchaseOrderEntry.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {title || l10n('purchaseOrderEntry.title')}
              </AxHeading3>
              {subtitle && (
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {subtitle}
                </AxParagraph>
              )}
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            {(() => {
              if (po?.id && selectedVendor) {
                const shippingAddress = addresses.find(a => a.id === po.shippingAddressId);
                const billingAddress = addresses.find(a => a.id === po.billingAddressId);
                return (
                  <>
                    {shippingAddress && (
                      <div style={{ 
                        padding: 'var(--spacing-md)', 
                        backgroundColor: 'var(--color-background-secondary)', 
                        borderRadius: 'var(--radius-md)',
                        minWidth: '200px',
                        maxWidth: '250px'
                      }}>
                        <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                          {l10n('purchaseOrderEntry.shippingAddress')}
                        </AxParagraph>
                        <AxParagraph style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-tight)' }}>
                          {shippingAddress.streetAddress1}
                          {shippingAddress.streetAddress2 && `, ${shippingAddress.streetAddress2}`}
                          <br />
                          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                          {shippingAddress.country && (
                            <>
                              <br />
                              {shippingAddress.country}
                            </>
                          )}
                        </AxParagraph>
                      </div>
                    )}
                    {billingAddress && (
                      <div style={{ 
                        padding: 'var(--spacing-md)', 
                        backgroundColor: 'var(--color-background-secondary)', 
                        borderRadius: 'var(--radius-md)',
                        minWidth: '200px',
                        maxWidth: '250px'
                      }}>
                        <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                          {l10n('purchaseOrderEntry.billingAddress')}
                        </AxParagraph>
                        <AxParagraph style={{ fontSize: 'var(--font-size-sm)', lineHeight: 'var(--line-height-tight)' }}>
                          {billingAddress.streetAddress1}
                          {billingAddress.streetAddress2 && `, ${billingAddress.streetAddress2}`}
                          <br />
                          {billingAddress.city}, {billingAddress.state} {billingAddress.postalCode}
                          {billingAddress.country && (
                            <>
                              <br />
                              {billingAddress.country}
                            </>
                          )}
                        </AxParagraph>
                      </div>
                    )}
                  </>
                );
              }
              return null;
            })()}
            {po?.id && (
              <>
                <div style={{ 
                  padding: 'var(--spacing-md)', 
                  backgroundColor: 'var(--color-background-secondary)', 
                  borderRadius: 'var(--radius-md)',
                  minWidth: '200px'
                }}>
                  <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--font-size-sm)' }}>
                    {l10n('purchaseOrderEntry.orderStatus')}
                  </AxParagraph>
                  <AxListbox
                    key={`status-${po.id}-${po.status || 'null'}`}
                    options={[
                      { value: 'DRAFT', label: l10n('purchaseOrder.status.draft') },
                      { value: 'PENDING_APPROVAL', label: l10n('purchaseOrder.status.pendingApproval') },
                      { value: 'APPROVED', label: l10n('purchaseOrder.status.approved') },
                      { value: 'RECEIVED', label: l10n('purchaseOrder.status.received') },
                      { value: 'INVOICED', label: l10n('purchaseOrder.status.invoiced') },
                      { value: 'PAID', label: l10n('purchaseOrder.status.paid') },
                      { value: 'CANCELLED', label: l10n('purchaseOrder.status.cancelled') },
                    ]}
                    value={po?.status || null}
                    onChange={(value: string | null) => {
                      if (value && po?.id) {
                        const oldStatus = po.status;
                        const updated = updatePurchaseOrder(po.id, { ...po, status: value as any });
                        updated.then((updatedPO) => {
                          setPO(updatedPO);
                          addHistoryRecord('status_change', l10n('purchaseOrderEntry.history.step.statusChange'), undefined, value || undefined, {
                            oldStatus,
                            newStatus: value,
                          }, updatedPO);
                        }).catch((err) => {
                          console.error('Error updating status:', err);
                          alert(l10n('purchaseOrderEntry.failedToUpdateStatus'));
                        });
                      }
                    }}
                    placeholder={l10n('purchaseOrderEntry.selectStatus')}
                    fullWidth
                    disabled={loading || !po?.id || readOnly}
                  />
                </div>
              </>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <ContentCard padding="large" {...debugProps(COMPONENT_NAME, 'ContentCard')}>
        <StepIndicator {...debugProps(COMPONENT_NAME, 'StepIndicator')}>
          <StepScrollContainer {...debugProps(COMPONENT_NAME, 'StepScrollContainer')}>
            {steps
              .filter(step => {
                if (readOnly) {
                  return step.key !== 'history' && isStepCompleted(step.key);
                }
                return step.key !== 'history';
              })
              .map((step, index) => {
                const isActive = currentStep === step.key;
                const isCompleted = isStepCompleted(step.key);
                const originalIndex = steps.findIndex(s => s.key === step.key);
                return (
                  <Step
                    key={step.key}
                    $active={isActive}
                    $completed={isCompleted}
                    {...debugProps(COMPONENT_NAME, 'Step')}
                    onClick={() => {
                      if (readOnly) {
                        if (isCompleted) {
                          setCurrentStep(step.key);
                          if (step.key === 'entry') {
                            setCurrentEntrySubStep('review');
                          }
                        }
                      } else {
                        if (isCompleted || isActive) {
                          setCurrentStep(step.key);
                          if (step.key === 'entry') {
                            setCurrentEntrySubStep('review');
                          }
                        }
                      }
                    }}
                    title={step.description}
                  >
                    {originalIndex + 1}. {step.label}
                  </Step>
                );
              })}
          </StepScrollContainer>
          <HistoryStepContainer {...debugProps(COMPONENT_NAME, 'HistoryStepContainer')}>
            {(() => {
              const historyStep = steps.find(s => s.key === 'history');
              if (!historyStep) return null;
              const isActive = currentStep === 'history';
              const isCompleted = isStepCompleted('history');
              return (
                <Step
                  key="history"
                  $active={isActive}
                  $completed={isCompleted}
                  {...debugProps(COMPONENT_NAME, 'Step')}
                  onClick={() => {
                    setCurrentStep('history');
                  }}
                  title={historyStep.description}
                >
                  {historyStep.label}
                </Step>
              );
            })()}
          </HistoryStepContainer>
        </StepIndicator>

        <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
          {renderStepContent()}
        </StepContent>

        {!readOnly && (
          <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
            <AxButton
              variant="secondary"
              onClick={handlePrevious}
              disabled={(currentStep === 'entry' && currentEntrySubStep === 'supplier') || submitting}
            >
              {l10n('purchaseOrderEntry.previous')}
            </AxButton>
            {currentStep === 'entry' && currentEntrySubStep === 'review' ? (
              <AxButton
                variant="primary"
                onClick={handleCompleteEntry}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('purchaseOrderEntry.saving') : (poIdToEdit ? l10n('purchaseOrderEntry.saveOrder') : l10n('purchaseOrderEntry.completeOrder'))}
              </AxButton>
            ) : currentStep === 'approval' ? (
              <AxButton
                variant="primary"
                onClick={handleApprovePO}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('purchaseOrderEntry.approving') : l10n('purchaseOrderEntry.approveOrder')}
              </AxButton>
            ) : currentStep === 'received' ? (
              <AxButton
                variant="primary"
                onClick={handleReceivePO}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('purchaseOrderEntry.receiving') : l10n('purchaseOrderEntry.receiveOrder')}
              </AxButton>
            ) : currentStep === 'invoicing' ? (
              <AxButton
                variant="primary"
                onClick={handleInvoicePO}
                disabled={!canProceedToNext() || submitting}
              >
                {submitting ? l10n('purchaseOrderEntry.invoicing') : l10n('purchaseOrderEntry.createInvoice')}
              </AxButton>
            ) : currentStep === 'history' ? (
              <AxButton
                variant="secondary"
                onClick={() => {
                  if (onNavigateToPOs) {
                    onNavigateToPOs();
                  } else {
                    handlePrevious();
                  }
                }}
                disabled={submitting}
              >
                {onNavigateToPOs ? l10n('purchaseOrderEntry.backToPOs') : l10n('purchaseOrderEntry.previous')}
              </AxButton>
            ) : (
              <AxButton
                variant="primary"
                onClick={handleNext}
                disabled={!canProceedToNext() || submitting}
              >
                {l10n('purchaseOrderEntry.next')}
              </AxButton>
            )}
          </ButtonGroup>
        )}
        {readOnly && currentStep === 'history' && (
          <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
            <AxButton
              variant="secondary"
              onClick={() => {
                if (onNavigateToPOs) {
                  onNavigateToPOs();
                } else if (onNavigateBack) {
                  onNavigateBack();
                }
              }}
            >
              {onNavigateToPOs ? l10n('purchaseOrderEntry.backToPOs') : l10n('purchaseOrderEntry.previous')}
            </AxButton>
          </ButtonGroup>
        )}
        {readOnly && currentStep !== 'history' && (
          <ButtonGroup {...debugProps(COMPONENT_NAME, 'ButtonGroup')}>
            <AxButton
              variant="secondary"
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                for (let i = currentIndex - 1; i >= 0; i--) {
                  if (isStepCompleted(steps[i].key)) {
                    setCurrentStep(steps[i].key);
                    if (steps[i].key === 'entry') {
                      setCurrentEntrySubStep('review');
                    }
                    return;
                  }
                }
              }}
              disabled={(() => {
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                return currentIndex === 0 || !steps.slice(0, currentIndex).some(s => isStepCompleted(s.key));
              })()}
            >
              {l10n('purchaseOrderEntry.previous')}
            </AxButton>
            <AxButton
              variant="primary"
              onClick={() => {
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                for (let i = currentIndex + 1; i < steps.length; i++) {
                  if (steps[i].key !== 'history' && isStepCompleted(steps[i].key)) {
                    setCurrentStep(steps[i].key);
                    if (steps[i].key === 'entry') {
                      setCurrentEntrySubStep('review');
                    }
                    return;
                  }
                }
              }}
              disabled={(() => {
                const currentIndex = steps.findIndex(s => s.key === currentStep);
                const remainingSteps = steps.slice(currentIndex + 1).filter(s => s.key !== 'history');
                return remainingSteps.length === 0 || !remainingSteps.some(s => isStepCompleted(s.key));
              })()}
            >
              {l10n('purchaseOrderEntry.next')}
            </AxButton>
          </ButtonGroup>
        )}
      </ContentCard>
    </PageContainer>
  );
}
