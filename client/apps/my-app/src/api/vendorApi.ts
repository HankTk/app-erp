import { createResourceApi, httpRequest } from './httpApi';

export interface Vendor {
  id?: string;
  vendorNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressIds?: string[]; // Array of address IDs associated with this vendor
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/vendors';

const vendorApi = createResourceApi<Vendor>(API_BASE_URL);

export const fetchVendors = vendorApi.fetchAll;
export const fetchVendorById = vendorApi.fetchById;
export const createVendor = vendorApi.create;
export const updateVendor = vendorApi.update;
export const deleteVendor = vendorApi.remove;

export const fetchVendorByEmail = async (email: string): Promise<Vendor> => {
  return httpRequest<Vendor>(`${API_BASE_URL}/email/${encodeURIComponent(email)}`);
};

