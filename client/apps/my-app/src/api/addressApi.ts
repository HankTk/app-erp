import { createResourceApi } from './httpApi';

export interface Address {
  id?: string;
  customerId?: string; // For backward compatibility, but we'll use customerIds in jsonData
  customerIds?: string[]; // Array of customer IDs that can use this address
  addressType?: 'SHIPPING' | 'BILLING';
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  contactName?: string;
  contactPhone?: string;
  defaultAddress?: boolean;
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/addresses';

const addressApi = createResourceApi<Address>(API_BASE_URL);

export const fetchAddresses = addressApi.fetchAll;
export const fetchAddressById = addressApi.fetchById;
export const createAddress = addressApi.create;
export const updateAddress = addressApi.update;
export const deleteAddress = addressApi.remove;

export const fetchAddressesByCustomerId = async (customerId: string): Promise<Address[]> => {
  // Import customerApi to get customer data
  const { fetchCustomerById } = await import('./customerApi');
  const customer = await fetchCustomerById(customerId);
  
  if (!customer) return [];
  
  // Get addressIds from customer
  const addressIds: string[] = customer.addressIds && Array.isArray(customer.addressIds) 
    ? customer.addressIds 
    : (customer.jsonData?.addressIds && Array.isArray(customer.jsonData.addressIds)
      ? customer.jsonData.addressIds
      : []);
  
  if (addressIds.length === 0) return [];
  
  // Fetch all addresses and filter by IDs
  const allAddresses = await addressApi.fetchAll();
  return allAddresses.filter(addr => addressIds.includes(addr.id || ''));
};

export const fetchAddressesByVendorId = async (vendorId: string): Promise<Address[]> => {
  // Import vendorApi to get vendor data
  const { fetchVendorById } = await import('./vendorApi');
  const vendor = await fetchVendorById(vendorId);
  
  if (!vendor) return [];
  
  // Get addressIds from vendor
  const addressIds: string[] = vendor.addressIds && Array.isArray(vendor.addressIds) 
    ? vendor.addressIds 
    : (vendor.jsonData?.addressIds && Array.isArray(vendor.jsonData.addressIds)
      ? vendor.jsonData.addressIds
      : []);
  
  if (addressIds.length === 0) return [];
  
  // Fetch all addresses and filter by IDs
  const allAddresses = await addressApi.fetchAll();
  return allAddresses.filter(addr => addressIds.includes(addr.id || ''));
};

export const fetchAddressesByCustomerIdAndType = async (
  customerId: string,
  addressType: 'SHIPPING' | 'BILLING'
): Promise<Address[]> => {
  // Get addresses by customer ID first
  const addresses = await fetchAddressesByCustomerId(customerId);
  
  // Filter by address type if specified
  if (!addressType) return addresses;
  
  return addresses.filter(addr => addr.addressType === addressType);
};

