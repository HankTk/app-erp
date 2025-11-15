import { createResourceApi } from './httpApi';

export interface Warehouse {
  id?: string;
  warehouseCode?: string;
  warehouseName?: string;
  address?: string;
  description?: string;
  active?: boolean;
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/warehouses';

const warehouseApi = createResourceApi<Warehouse>(API_BASE_URL);

export const fetchWarehouses = warehouseApi.fetchAll;
export const fetchWarehouseById = warehouseApi.fetchById;
export const createWarehouse = warehouseApi.create;
export const updateWarehouse = warehouseApi.update;
export const deleteWarehouse = warehouseApi.remove;

export const fetchActiveWarehouses = async (): Promise<Warehouse[]> => {
  const response = await fetch(`${API_BASE_URL}/active`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

