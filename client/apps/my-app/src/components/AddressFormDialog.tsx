import { useState } from 'react';
import {
  AxDialog,
  AxButton,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxListbox,
  AxParagraph,
} from '@ui/components';
import { createAddress, Address } from '../api/addressApi';

interface AddressFormDialogProps {
  open: boolean;
  onClose: () => void;
  onAddressCreated: (address: Address) => void;
  customerId?: string;
  vendorId?: string;
}

export function AddressFormDialog({
  open,
  onClose,
  onAddressCreated,
  customerId,
  vendorId,
}: AddressFormDialogProps) {
  const [formData, setFormData] = useState<Partial<Address>>({
    addressType: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setSubmitting(true);
      
      // Prepare address data
      const addressData: Partial<Address> = {
        ...formData,
        // If customerId or vendorId is provided, we'll associate it after creation
        // The association will be handled by the parent component
      };

      const created = await createAddress(addressData);
      
      // If customerId or vendorId is provided, associate the address
      if (created.id && (customerId || vendorId)) {
        if (customerId) {
          const { fetchCustomerById, updateCustomer } = await import('../api/customerApi');
          const customer = await fetchCustomerById(customerId);
          if (customer) {
            const addressIds = customer.addressIds && Array.isArray(customer.addressIds)
              ? customer.addressIds
              : (customer.jsonData?.addressIds && Array.isArray(customer.jsonData.addressIds)
                ? customer.jsonData.addressIds
                : []);
            
            if (!addressIds.includes(created.id)) {
              await updateCustomer(customerId, {
                ...customer,
                addressIds: [...addressIds, created.id],
                jsonData: {
                  ...(customer.jsonData || {}),
                  addressIds: [...addressIds, created.id],
                },
              });
            }
          }
        } else if (vendorId) {
          const { fetchVendorById, updateVendor } = await import('../api/vendorApi');
          const vendor = await fetchVendorById(vendorId);
          if (vendor) {
            const addressIds = vendor.addressIds && Array.isArray(vendor.addressIds)
              ? vendor.addressIds
              : (vendor.jsonData?.addressIds && Array.isArray(vendor.jsonData.addressIds)
                ? vendor.jsonData.addressIds
                : []);
            
            if (!addressIds.includes(created.id)) {
              await updateVendor(vendorId, {
                ...vendor,
                addressIds: [...addressIds, created.id],
                jsonData: {
                  ...(vendor.jsonData || {}),
                  addressIds: [...addressIds, created.id],
                },
              });
            }
          }
        }
      }

      onAddressCreated(created);
      
      // Reset form and close
      setFormData({ addressType: null });
      onClose();
    } catch (err) {
      console.error('Error creating address:', err);
      alert(err instanceof Error ? err.message : 'Failed to create address');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({ addressType: null });
      onClose();
    }
  };

  return (
    <AxDialog
      open={open}
      onClose={handleClose}
      title="Create New Address"
      size="large"
      footer={
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
          <AxButton 
            variant="secondary" 
            onClick={handleClose}
            disabled={submitting}
          >
            Cancel
          </AxButton>
          <AxButton 
            variant="primary" 
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create'}
          </AxButton>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <AxFormGroup>
          <AxLabel>Address Type (Optional)</AxLabel>
          <AxListbox
            options={[
              { value: null, label: 'Both (Shipping & Billing)' },
              { value: 'SHIPPING', label: 'Shipping Only' },
              { value: 'BILLING', label: 'Billing Only' },
            ]}
            value={formData.addressType || null}
            onChange={(value) => {
              setFormData({ ...formData, addressType: value as 'SHIPPING' | 'BILLING' | null | undefined });
            }}
            placeholder="Select address type (optional)"
            fullWidth
            disabled={submitting}
          />
          <AxParagraph style={{ marginTop: 'var(--spacing-xs)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
            Select "Both" to allow this address to be used for both shipping and billing. Leave as "Both" if not specified.
          </AxParagraph>
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>Street Address 1</AxLabel>
          <AxInput
            type="text"
            value={formData.streetAddress1 || ''}
            onChange={(e) => {
              setFormData({ ...formData, streetAddress1: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting}
            fullWidth
            placeholder="Street address line 1"
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>Street Address 2</AxLabel>
          <AxInput
            type="text"
            value={formData.streetAddress2 || ''}
            onChange={(e) => {
              setFormData({ ...formData, streetAddress2: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting}
            fullWidth
            placeholder="Street address line 2 (optional)"
          />
        </AxFormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>City</AxLabel>
            <AxInput
              type="text"
              value={formData.city || ''}
              onChange={(e) => {
                setFormData({ ...formData, city: e.target.value });
              }}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>State/Province</AxLabel>
            <AxInput
              type="text"
              value={formData.state || ''}
              onChange={(e) => {
                setFormData({ ...formData, state: e.target.value });
              }}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
            />
          </AxFormGroup>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>Postal Code</AxLabel>
            <AxInput
              type="text"
              value={formData.postalCode || ''}
              onChange={(e) => {
                setFormData({ ...formData, postalCode: e.target.value });
              }}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>Country</AxLabel>
            <AxInput
              type="text"
              value={formData.country || ''}
              onChange={(e) => {
                setFormData({ ...formData, country: e.target.value });
              }}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
            />
          </AxFormGroup>
        </div>
      </div>
    </AxDialog>
  );
}

