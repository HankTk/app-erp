import { createResourceApi, httpRequest } from './httpApi';

export interface Inventory {
  id?: string;
  productId?: string;
  warehouseId?: string;
  quantity?: number;
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/inventory';

const inventoryApi = createResourceApi<Inventory>(API_BASE_URL);

export const fetchInventory = inventoryApi.fetchAll;
export const fetchInventoryById = inventoryApi.fetchById;
export const createInventory = inventoryApi.create;
export const updateInventory = inventoryApi.update;
export const deleteInventory = inventoryApi.remove;

export const fetchInventoryByProductId = async (productId: string): Promise<Inventory[]> => {
  const response = await fetch(`${API_BASE_URL}/product/${productId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const fetchInventoryByWarehouseId = async (warehouseId: string): Promise<Inventory[]> => {
  const response = await fetch(`${API_BASE_URL}/warehouse/${warehouseId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const fetchInventoryByProductAndWarehouse = async (
  productId: string,
  warehouseId: string
): Promise<Inventory | null> => {
  const response = await fetch(`${API_BASE_URL}/product/${productId}/warehouse/${warehouseId}`);
  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const adjustInventory = async (
  productId: string,
  warehouseId: string,
  quantityChange: number
): Promise<Inventory> => {
  return httpRequest<Inventory>(`${API_BASE_URL}/adjust`, {
    method: 'POST',
    body: { productId, warehouseId, quantityChange },
  });
};

