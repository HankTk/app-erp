import { createResourceApi, httpRequest } from './httpApi';

export interface Customer {
  id?: string;
  customerNumber?: string;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  addressIds?: string[]; // Array of address IDs associated with this customer
  jsonData?: Record<string, any>;
}

const API_BASE_URL = 'http://localhost:8080/api/customers';

const customerApi = createResourceApi<Customer>(API_BASE_URL);

export const fetchCustomers = customerApi.fetchAll;
export const fetchCustomerById = customerApi.fetchById;
export const createCustomer = customerApi.create;
export const updateCustomer = customerApi.update;
export const deleteCustomer = customerApi.remove;

export const fetchCustomerByEmail = async (email: string): Promise<Customer> => {
  return httpRequest<Customer>(`${API_BASE_URL}/email/${encodeURIComponent(email)}`);
};

