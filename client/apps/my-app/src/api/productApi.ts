import { createResourceApi } from './httpApi';

export interface Product {
  id?: string;
  productCode?: string;
  productName?: string;
  description?: string;
  unitPrice?: number;
  cost?: number; // Product cost for General Ledger
  unitOfMeasure?: string;
  active?: boolean;
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/products';

const productApi = createResourceApi<Product>(API_BASE_URL);

export const fetchProducts = productApi.fetchAll;
export const fetchProductById = productApi.fetchById;
export const createProduct = productApi.create;
export const updateProduct = productApi.update;
export const deleteProduct = productApi.remove;

export const fetchActiveProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_BASE_URL}/active`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

