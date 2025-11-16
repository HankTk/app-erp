import { createResourceApi, httpRequest } from './httpApi';

export interface SFC {
  id?: string;
  sfcNumber?: string;
  rmaId?: string;
  rmaNumber?: string;
  orderId?: string;
  orderNumber?: string;
  customerId?: string;
  customerName?: string;
  createdDate?: string;
  startedDate?: string;
  completedDate?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedTo?: string;
  notes?: string;
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/sfcs';

const sfcApi = createResourceApi<SFC>(API_BASE_URL);

export const fetchSFCs = sfcApi.fetchAll;
export const fetchSFCById = sfcApi.fetchById;
export const createSFC = sfcApi.create;
export const updateSFC = sfcApi.update;
export const deleteSFC = sfcApi.remove;

export const fetchSFCsByRMAId = async (rmaId: string): Promise<SFC[]> => {
  const response = await fetch(`${API_BASE_URL}/rma/${rmaId}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const fetchSFCsByStatus = async (status: string): Promise<SFC[]> => {
  const response = await fetch(`${API_BASE_URL}/status/${status}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const createSFCFromRMA = async (rmaId: string): Promise<SFC> => {
  return httpRequest<SFC>(`${API_BASE_URL}/from-rma/${rmaId}`, {
    method: 'POST',
  });
};

