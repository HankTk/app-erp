import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer, Customer } from '../../api/customerApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { CustomerListingPageRender } from './CustomerListingPage.render';

type DialogMode = 'add' | 'edit' | null;

interface CustomerListingPageProps {
  onNavigateBack?: () => void;
}

export function CustomerListingPage({ onNavigateBack }: CustomerListingPageProps = {}) {
  const { l10n } = useI18n();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressDialogCustomerId, setAddressDialogCustomerId] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const customersData = await fetchCustomers();
      setCustomers(customersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection for real-time updates
  useWebSocket({
    onCustomerUpdate: (updatedCustomer: Customer) => {
      console.log('WebSocket: Customer updated, refreshing list', updatedCustomer);
      setCustomers((prev) => {
        const index = prev.findIndex((c) => c.id === updatedCustomer.id);
        if (index >= 0) {
          // Update existing customer
          const updated = [...prev];
          updated[index] = updatedCustomer;
          return updated;
        } else {
          // Add new customer
          return [...prev, updatedCustomer];
        }
      });
    },
    onCustomerDelete: (customerId: string) => {
      console.log('WebSocket: Customer deleted, removing from list', customerId);
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    },
  });

  const loadAddresses = async () => {
    try {
      const addressesData = await fetchAddresses();
      setAddresses(addressesData);
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  useEffect(() => {
    loadCustomers();
    loadAddresses();
  }, []);

  const formatAddress = (address: Address): string => {
    const parts: string[] = [];
    if (address.streetAddress1) parts.push(address.streetAddress1);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);
    return parts.join(', ') || 'No address';
  };

  const getCustomerAddresses = (customerId: string | undefined): Address[] => {
    if (!customerId) return [];
    // Find customer and get their addressIds
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return [];
    
    // Get addressIds from customer
    const addressIds: string[] = customer.addressIds && Array.isArray(customer.addressIds)
      ? customer.addressIds
      : (customer.jsonData?.addressIds && Array.isArray(customer.jsonData.addressIds)
        ? customer.jsonData.addressIds
        : []);
    
    // Filter addresses by IDs
    return addresses.filter(addr => addressIds.includes(addr.id || ''));
  };

  const handleAdd = () => {
    setFormData({});
    setSelectedCustomer(null);
    setDialogMode('add');
  };

  const handleEdit = (customer: Customer) => {
    setFormData(customer);
    setSelectedCustomer(customer);
    setDialogMode('edit');
  };

  const handleDeleteClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCustomer?.id) return;

    try {
      setSubmitting(true);
      await deleteCustomer(selectedCustomer.id);
      await loadCustomers();
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      let savedCustomer: Customer;
      if (dialogMode === 'edit' && selectedCustomer?.id) {
        savedCustomer = await updateCustomer(selectedCustomer.id, formData);
      } else {
        savedCustomer = await createCustomer(formData);
      }

      await loadCustomers();
      
      // Close dialog after save
      setDialogMode(null);
      setFormData({});
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error saving customer:', err);
      alert(err instanceof Error ? err.message : `Failed to ${dialogMode === 'edit' ? 'update' : 'create'} customer`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManageAddresses = () => {
    if (selectedCustomer?.id) {
      setAddressDialogCustomerId(selectedCustomer.id);
      setShowAddressDialog(true);
    }
  };

  const handleAddressDialogClose = () => {
    setShowAddressDialog(false);
    setAddressDialogCustomerId(null);
    loadAddresses(); // Reload addresses when dialog closes
    if (dialogMode === 'add') {
      // Close customer dialog after address management
      setDialogMode(null);
      setFormData({});
      setSelectedCustomer(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleDialogClose = () => {
    setDialogMode(null);
    setFormData({});
    setSelectedCustomer(null);
  };

  const handleFormDataChange = (data: Partial<Customer>) => {
    setFormData(data);
  };

  const handleAddressesUpdated = () => {
    loadCustomers();
  };

  return (
    <CustomerListingPageRender
      customers={customers}
      addresses={addresses}
      loading={loading}
      error={error}
      dialogMode={dialogMode}
      deleteDialogOpen={deleteDialogOpen}
      selectedCustomer={selectedCustomer}
      formData={formData}
      submitting={submitting}
      showAddressDialog={showAddressDialog}
      addressDialogCustomerId={addressDialogCustomerId}
      onNavigateBack={onNavigateBack}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={handleDeleteCancel}
      onSave={handleSave}
      onDialogClose={handleDialogClose}
      onFormDataChange={handleFormDataChange}
      onManageAddresses={handleManageAddresses}
      onAddressDialogClose={handleAddressDialogClose}
      onAddressesUpdated={handleAddressesUpdated}
      onRetry={() => window.location.reload()}
      formatAddress={formatAddress}
      getCustomerAddresses={getCustomerAddresses}
    />
  );
}

