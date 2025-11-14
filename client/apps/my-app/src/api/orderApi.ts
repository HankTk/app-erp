import { createResourceApi, httpRequest } from './httpApi';

export interface OrderItem {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface Order {
  id?: string;
  orderNumber?: string;
  customerId?: string;
  shippingAddressId?: string;
  billingAddressId?: string;
  orderDate?: string;
  shipDate?: string;
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SHIPPING_INSTRUCTED' | 'SHIPPED' | 'INVOICED' | 'PAID' | 'CANCELLED';
  items?: OrderItem[];
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
  notes?: string;
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/orders';

const orderApi = createResourceApi<Order>(API_BASE_URL);

export const fetchOrders = orderApi.fetchAll;
export const fetchOrderById = orderApi.fetchById;
export const createOrder = orderApi.create;
export const updateOrder = orderApi.update;
export const deleteOrder = orderApi.remove;

export const fetchOrdersByCustomerId = async (customerId: string): Promise<Order[]> => {
  const response = await fetch(`${API_BASE_URL}/customer/${customerId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const fetchOrdersByStatus = async (status: string): Promise<Order[]> => {
  const response = await fetch(`${API_BASE_URL}/status/${status}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const addOrderItem = async (
  orderId: string,
  productId: string,
  quantity: number
): Promise<Order> => {
  return httpRequest<Order>(`${API_BASE_URL}/${orderId}/items`, {
    method: 'POST',
    body: { productId, quantity },
  });
};

export const updateOrderItemQuantity = async (
  orderId: string,
  itemId: string,
  quantity: number
): Promise<Order> => {
  return httpRequest<Order>(`${API_BASE_URL}/${orderId}/items/${itemId}/quantity`, {
    method: 'PUT',
    body: { quantity },
  });
};

export const removeOrderItem = async (
  orderId: string,
  itemId: string
): Promise<Order> => {
  return httpRequest<Order>(`${API_BASE_URL}/${orderId}/items/${itemId}`, {
    method: 'DELETE',
  });
};

