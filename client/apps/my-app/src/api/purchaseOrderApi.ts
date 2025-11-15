import { createResourceApi, httpRequest } from './httpApi';

export interface PurchaseOrderItem {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface PurchaseOrder {
  id?: string;
  orderNumber?: string;
  supplierId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RECEIVED' | 'INVOICED' | 'PAID' | 'CANCELLED';
  invoiceNumber?: string; // Invoice number from supplier for A/P processing
  invoiceDate?: string; // Invoice date
  items?: PurchaseOrderItem[];
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
  notes?: string;
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/purchase-orders';

const purchaseOrderApi = createResourceApi<PurchaseOrder>(API_BASE_URL);

export const fetchPurchaseOrders = purchaseOrderApi.fetchAll;
export const fetchPurchaseOrderById = purchaseOrderApi.fetchById;
export const createPurchaseOrder = purchaseOrderApi.create;
export const updatePurchaseOrder = purchaseOrderApi.update;
export const deletePurchaseOrder = purchaseOrderApi.remove;

export const fetchPurchaseOrdersBySupplierId = async (supplierId: string): Promise<PurchaseOrder[]> => {
  const response = await fetch(`${API_BASE_URL}/supplier/${supplierId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const fetchPurchaseOrdersByStatus = async (status: string): Promise<PurchaseOrder[]> => {
  const response = await fetch(`${API_BASE_URL}/status/${status}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const addPurchaseOrderItem = async (
  poId: string,
  productId: string,
  quantity: number
): Promise<PurchaseOrder> => {
  return httpRequest<PurchaseOrder>(`${API_BASE_URL}/${poId}/items`, {
    method: 'POST',
    body: { productId, quantity },
  });
};

export const updatePurchaseOrderItemQuantity = async (
  poId: string,
  itemId: string,
  quantity: number
): Promise<PurchaseOrder> => {
  return httpRequest<PurchaseOrder>(`${API_BASE_URL}/${poId}/items/${itemId}/quantity`, {
    method: 'PUT',
    body: { quantity },
  });
};

export const removePurchaseOrderItem = async (
  poId: string,
  itemId: string
): Promise<PurchaseOrder> => {
  return httpRequest<PurchaseOrder>(`${API_BASE_URL}/${poId}/items/${itemId}`, {
    method: 'DELETE',
  });
};

export const getNextInvoiceNumber = async (): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/invoice/next-number`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const data = await response.json();
  return data.invoiceNumber;
};

