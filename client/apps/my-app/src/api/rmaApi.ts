import { createResourceApi, httpRequest } from './httpApi';

export interface RMAItem {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  returnedQuantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  reason?: string;
  condition?: string;
}

export interface RMA {
  id?: string;
  rmaNumber?: string;
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  rmaDate?: string;
  receivedDate?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'RECEIVED' | 'PROCESSED' | 'CANCELLED';
  items?: RMAItem[];
  subtotal?: number;
  tax?: number;
  restockingFee?: number;
  total?: number;
  notes?: string;
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/rmas';

const rmaApi = createResourceApi<RMA>(API_BASE_URL);

export const fetchRMAs = rmaApi.fetchAll;
export const fetchRMAById = rmaApi.fetchById;
export const createRMA = rmaApi.create;
export const updateRMA = rmaApi.update;
export const deleteRMA = rmaApi.remove;

export const fetchRMAsByOrderId = async (orderId: string): Promise<RMA[]> => {
  const response = await fetch(`${API_BASE_URL}/order/${orderId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const fetchRMAsByCustomerId = async (customerId: string): Promise<RMA[]> => {
  const response = await fetch(`${API_BASE_URL}/customer/${customerId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const fetchRMAsByStatus = async (status: string): Promise<RMA[]> => {
  const response = await fetch(`${API_BASE_URL}/status/${status}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const addRMAItem = async (
  rmaId: string,
  productId: string,
  quantity: number,
  reason?: string
): Promise<RMA> => {
  return httpRequest<RMA>(`${API_BASE_URL}/${rmaId}/items`, {
    method: 'POST',
    body: { productId, quantity, reason },
  });
};

export const updateRMAItemQuantity = async (
  rmaId: string,
  itemId: string,
  quantity: number
): Promise<RMA> => {
  return httpRequest<RMA>(`${API_BASE_URL}/${rmaId}/items/${itemId}/quantity`, {
    method: 'PUT',
    body: { quantity },
  });
};

export const updateRMAItemReturnedQuantity = async (
  rmaId: string,
  itemId: string,
  returnedQuantity: number
): Promise<RMA> => {
  return httpRequest<RMA>(`${API_BASE_URL}/${rmaId}/items/${itemId}/returned-quantity`, {
    method: 'PUT',
    body: { quantity: returnedQuantity },
  });
};

export const removeRMAItem = async (
  rmaId: string,
  itemId: string
): Promise<RMA> => {
  return httpRequest<RMA>(`${API_BASE_URL}/${rmaId}/items/${itemId}`, {
    method: 'DELETE',
  });
};

