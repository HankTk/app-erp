import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchVendors, createVendor, updateVendor, deleteVendor, Vendor } from '../../api/vendorApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import { useWebSocket } from '../../hooks/useWebSocket';
import { VendorListingPageRender } from './VendorListingPage.render';

type DialogMode = 'add' | 'edit' | null;

interface VendorListingPageProps {
  onNavigateBack?: () => void;
}

export function VendorListingPage({ onNavigateBack }: VendorListingPageProps = {}) {
  const { l10n } = useI18n();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressDialogVendorId, setAddressDialogVendorId] = useState<string | null>(null);

  const loadVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const vendorsData = await fetchVendors();
      setVendors(vendorsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection for real-time updates
  useWebSocket({
    onVendorUpdate: (updatedVendor: Vendor) => {
      console.log('WebSocket: Vendor updated, refreshing list', updatedVendor);
      setVendors((prev) => {
        const index = prev.findIndex((v) => v.id === updatedVendor.id);
        if (index >= 0) {
          // Update existing vendor
          const updated = [...prev];
          updated[index] = updatedVendor;
          return updated;
        } else {
          // Add new vendor
          return [...prev, updatedVendor];
        }
      });
    },
    onVendorDelete: (vendorId: string) => {
      console.log('WebSocket: Vendor deleted, removing from list', vendorId);
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
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
    loadVendors();
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

  const getVendorAddresses = (vendorId: string | undefined): Address[] => {
    if (!vendorId) return [];
    // Find vendor and get their addressIds
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return [];
    
    // Get addressIds from vendor
    const addressIds: string[] = vendor.addressIds && Array.isArray(vendor.addressIds)
      ? vendor.addressIds
      : (vendor.jsonData?.addressIds && Array.isArray(vendor.jsonData.addressIds)
        ? vendor.jsonData.addressIds
        : []);
    
    // Filter addresses by IDs
    return addresses.filter(addr => addressIds.includes(addr.id || ''));
  };

  const handleAdd = () => {
    setFormData({});
    setSelectedVendor(null);
    setDialogMode('add');
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData(vendor);
    setSelectedVendor(vendor);
    setDialogMode('edit');
  };

  const handleDeleteClick = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedVendor?.id) return;

    try {
      setSubmitting(true);
      await deleteVendor(selectedVendor.id);
      await loadVendors();
      setDeleteDialogOpen(false);
      setSelectedVendor(null);
    } catch (err) {
      console.error('Error deleting vendor:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      let savedVendor: Vendor;
      if (dialogMode === 'edit' && selectedVendor?.id) {
        savedVendor = await updateVendor(selectedVendor.id, formData);
      } else {
        savedVendor = await createVendor(formData);
      }

      await loadVendors();
      
      // Close dialog after save
      setDialogMode(null);
      setFormData({});
      setSelectedVendor(null);
    } catch (err) {
      console.error('Error saving vendor:', err);
      alert(err instanceof Error ? err.message : `Failed to ${dialogMode === 'edit' ? 'update' : 'create'} vendor`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleManageAddresses = () => {
    if (selectedVendor?.id) {
      setAddressDialogVendorId(selectedVendor.id);
      setShowAddressDialog(true);
    }
  };

  const handleAddressDialogClose = () => {
    setShowAddressDialog(false);
    setAddressDialogVendorId(null);
    loadAddresses(); // Reload addresses when dialog closes
    if (dialogMode === 'add') {
      // Close vendor dialog after address management
      setDialogMode(null);
      setFormData({});
      setSelectedVendor(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedVendor(null);
  };

  const handleDialogClose = () => {
    setDialogMode(null);
    setFormData({});
    setSelectedVendor(null);
  };

  const handleFormDataChange = (data: Partial<Vendor>) => {
    setFormData(data);
  };

  const handleAddressesUpdated = () => {
    loadVendors();
  };

  return (
    <VendorListingPageRender
      vendors={vendors}
      addresses={addresses}
      loading={loading}
      error={error}
      dialogMode={dialogMode}
      deleteDialogOpen={deleteDialogOpen}
      selectedVendor={selectedVendor}
      formData={formData}
      submitting={submitting}
      showAddressDialog={showAddressDialog}
      addressDialogVendorId={addressDialogVendorId}
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
      getVendorAddresses={getVendorAddresses}
    />
  );
}

