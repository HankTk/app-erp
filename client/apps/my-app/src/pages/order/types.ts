import { Order, OrderItem } from '../../api/orderApi';
import { Customer } from '../../api/customerApi';
import { Address } from '../../api/addressApi';
import { Product } from '../../api/productApi';

export type OrderStep = 'entry' | 'approval' | 'confirmation' | 'shipping_instruction' | 'shipping' | 'invoicing' | 'history';
export type EntrySubStep = 'customer' | 'products' | 'shipping' | 'review';

export interface OrderStepProps {
  order: Order | null;
  onOrderUpdate: (order: Order) => void;
  onNext: () => void;
  onPrevious: () => void;
  onNavigateBack?: () => void;
  loading?: boolean;
  submitting?: boolean;
  readOnly?: boolean; // If true, all fields are read-only
}

export interface OrderEntryStepProps extends OrderStepProps {
  customers: Customer[];
  products: Product[];
  addresses: Address[];
  selectedProduct: string | null;
  quantity: number;
  shippingId: string | null;
  billingId: string | null;
  currentSubStep: EntrySubStep;
  onCustomerSelect: (customerId: string) => Promise<void>;
  onAddProduct: (productId: string, quantity: number) => Promise<void>;
  onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
  onRemoveItem: (itemId: string) => Promise<void>;
  onShippingInfoUpdate: (shippingAddressId: string, billingAddressId: string) => Promise<void>;
  onSubStepChange: (subStep: EntrySubStep) => void;
  onSetSelectedProduct: (productId: string | null) => void;
  onSetQuantity: (quantity: number) => void;
  onSetShippingId: (id: string | null) => void;
  onSetBillingId: (id: string | null) => void;
}

export interface OrderApprovalStepProps extends OrderStepProps {
  approvalNotes: string;
  creditCheckPassed: boolean;
  inventoryConfirmed: boolean;
  priceApproved: boolean;
  onApprovalNotesChange: (notes: string) => void;
  onCreditCheckChange: (passed: boolean) => void;
  onInventoryConfirmChange: (confirmed: boolean) => void;
  onPriceApproveChange: (approved: boolean) => void;
}

export interface OrderConfirmationStepProps extends OrderStepProps {
  customer: Customer | undefined;
}

export interface OrderShippingInstructionStepProps extends OrderStepProps {
  shippingInstructions: string;
  requestedShipDate: string;
  onShippingInstructionsChange: (instructions: string) => void;
  onRequestedShipDateChange: (date: string) => void;
}

export interface OrderShippingStepProps extends OrderStepProps {
  actualShipDate: string;
  trackingNumber: string;
  onActualShipDateChange: (date: string) => void;
  onTrackingNumberChange: (number: string) => void;
}

export interface OrderInvoicingStepProps extends OrderStepProps {
  invoiceNumber: string;
  invoiceDate: string;
  onInvoiceNumberChange: (number: string) => void;
  onInvoiceDateChange: (date: string) => void;
}

export interface OrderHistoryStepProps extends OrderStepProps {
  onAddNote: (note: string) => Promise<void>;
  customers: Customer[];
}

