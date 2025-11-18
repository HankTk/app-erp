import { useState, useEffect } from 'react';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchAddresses, createAddress, updateAddress, deleteAddress, Address } from '../../api/addressApi';
import { AddressListingPageRender } from './AddressListingPage.render';

type DialogMode = 'add' | 'edit' | null;

interface AddressListingPageProps {
  customerId?: string;
  onAddressCreated?: (address: Address) => void;
  onClose?: () => void;
  onNavigateBack?: () => void;
}

export function AddressListingPage({ customerId, onAddressCreated, onClose, onNavigateBack }: AddressListingPageProps) {
  const { l10n } = useI18n();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({});
  const [submitting, setSubmitting] = useState(false);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const addressesData = await fetchAddresses();
      setAddresses(addressesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
      console.error('Error fetching addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const filteredAddresses = customerId
    ? addresses.filter(addr => addr.customerId === customerId)
    : addresses;

  const handleAdd = () => {
    setFormData({
      addressType: null,
    });
    setSelectedAddress(null);
    setDialogMode('add');
  };

  const handleEdit = (address: Address) => {
    setFormData(address);
    setSelectedAddress(address);
    setDialogMode('edit');
  };

  const handleDeleteClick = (address: Address) => {
    setSelectedAddress(address);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAddress?.id) return;

    try {
      setSubmitting(true);
      await deleteAddress(selectedAddress.id);
      await loadAddresses();
      setDeleteDialogOpen(false);
      setSelectedAddress(null);
    } catch (err) {
      console.error('Error deleting address:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      if (dialogMode === 'edit' && selectedAddress?.id) {
        const updated = await updateAddress(selectedAddress.id, formData);
        if (onAddressCreated) {
          onAddressCreated(updated);
        }
      } else {
        const created = await createAddress(formData);
        if (onAddressCreated) {
          onAddressCreated(created);
        }
      }

      await loadAddresses();
      setDialogMode(null);
      setFormData({});
      setSelectedAddress(null);
    } catch (err) {
      console.error('Error saving address:', err);
      alert(err instanceof Error ? err.message : `Failed to ${dialogMode === 'edit' ? 'update' : 'create'} address`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedAddress(null);
  };

  const handleDialogClose = () => {
    setDialogMode(null);
    setFormData({});
    setSelectedAddress(null);
  };

  const handleFormDataChange = (data: Partial<Address>) => {
    setFormData(data);
  };


  return (
    <AddressListingPageRender
      addresses={addresses}
      loading={loading}
      error={error}
      customerId={customerId}
      filteredAddresses={filteredAddresses}
      dialogMode={dialogMode}
      deleteDialogOpen={deleteDialogOpen}
      selectedAddress={selectedAddress}
      formData={formData}
      submitting={submitting}
      onAddressCreated={onAddressCreated}
      onClose={onClose}
      onNavigateBack={onNavigateBack}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDeleteClick={handleDeleteClick}
      onDeleteConfirm={handleDelete}
      onDeleteCancel={handleDeleteCancel}
      onSave={handleSave}
      onDialogClose={handleDialogClose}
      onFormDataChange={handleFormDataChange}
      onRetry={() => window.location.reload()}
    />
  );
}

