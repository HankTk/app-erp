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
import { useI18n } from '../i18n/I18nProvider';

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
  const { l10n } = useI18n();
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
      alert(err instanceof Error ? err.message : l10n('address.failedToCreate'));
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
      title={l10n('address.createTitle')}
      size="large"
      footer={
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
          <AxButton 
            variant="secondary" 
            onClick={handleClose}
            disabled={submitting}
          >
            {l10n('common.cancel')}
          </AxButton>
          <AxButton 
            variant="primary" 
            onClick={handleSave}
            disabled={submitting}
          >
            {submitting ? l10n('address.creating') : l10n('address.create')}
          </AxButton>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('address.addressType')}</AxLabel>
          <AxListbox
            options={[
              { value: null, label: l10n('customer.addressType.both') },
              { value: 'SHIPPING', label: l10n('customer.addressType.shipping') },
              { value: 'BILLING', label: l10n('customer.addressType.billing') },
            ]}
            value={formData.addressType || null}
            onChange={(value) => {
              setFormData({ ...formData, addressType: value as 'SHIPPING' | 'BILLING' | null | undefined });
            }}
            placeholder={l10n('address.addressTypePlaceholder')}
            fullWidth
            disabled={submitting}
          />
          <AxParagraph marginTop="xs" color="secondary" size="sm">
            {l10n('address.addressTypeDescription')}
          </AxParagraph>
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('address.streetAddress1')}</AxLabel>
          <AxInput
            type="text"
            value={formData.streetAddress1 || ''}
            onChange={(e) => {
              setFormData({ ...formData, streetAddress1: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting}
            fullWidth
            placeholder={l10n('address.streetAddress1Placeholder')}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('address.streetAddress2')}</AxLabel>
          <AxInput
            type="text"
            value={formData.streetAddress2 || ''}
            onChange={(e) => {
              setFormData({ ...formData, streetAddress2: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting}
            fullWidth
            placeholder={l10n('address.streetAddress2Placeholder')}
          />
        </AxFormGroup>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
          <AxFormGroup>
            <AxLabel>{l10n('address.city')}</AxLabel>
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
            <AxLabel>{l10n('address.state')}</AxLabel>
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
            <AxLabel>{l10n('address.postalCode')}</AxLabel>
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
            <AxLabel>{l10n('address.country')}</AxLabel>
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

