import { PurchaseOrder, PurchaseOrderItem } from '../../api/purchaseOrderApi';
import { Vendor } from '../../api/vendorApi';
import { Address } from '../../api/addressApi';
import { Product } from '../../api/productApi';

export type PurchaseOrderStep = 'entry' | 'approval' | 'received' | 'invoicing' | 'history';
export type EntrySubStep = 'supplier' | 'products' | 'shipping' | 'review';

export interface PurchaseOrderStepProps {
  po: PurchaseOrder | null;
  onPOUpdate: (po: PurchaseOrder) => void;
  onNext: () => void;
  onPrevious: () => void;
  onNavigateBack?: () => void;
  loading?: boolean;
  submitting?: boolean;
  readOnly?: boolean; // If true, all fields are read-only
}

export interface PurchaseOrderEntryStepProps extends PurchaseOrderStepProps {
  vendors: Vendor[];
  products: Product[];
  addresses: Address[];
  selectedProduct: string | null;
  quantity: number;
  shippingId: string | null;
  billingId: string | null;
  expectedDeliveryDate: string;
  currentSubStep: EntrySubStep;
  onSupplierSelect: (supplierId: string) => Promise<void>;
  onAddProduct: (productId: string, quantity: number) => Promise<void>;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onShippingInfoUpdate: (shippingAddressId: string, billingAddressId: string) => Promise<void>;
  onExpectedDeliveryDateUpdate: (expectedDeliveryDate: string) => Promise<void>;
  onSubStepChange: (subStep: EntrySubStep) => void;
  onSetSelectedProduct: (productId: string | null) => void;
  onSetQuantity: (quantity: number) => void;
  onSetShippingId: (id: string | null) => void;
  onSetBillingId: (id: string | null) => void;
  onSetExpectedDeliveryDate: (date: string) => void;
}

export interface PurchaseOrderApprovalStepProps extends PurchaseOrderStepProps {
  approvalNotes: string;
  onApprovalNotesChange: (notes: string) => void;
}

export interface PurchaseOrderReceivedStepProps extends PurchaseOrderStepProps {
  receivedDate: string;
  onReceivedDateChange: (date: string) => void;
}

export interface PurchaseOrderInvoicingStepProps extends PurchaseOrderStepProps {
  invoiceNumber: string;
  invoiceDate: string;
  onInvoiceNumberChange: (number: string) => void;
  onInvoiceDateChange: (date: string) => void;
}

export interface PurchaseOrderHistoryStepProps extends PurchaseOrderStepProps {
  onAddNote: (note: string) => Promise<void>;
  vendors: Vendor[];
}

