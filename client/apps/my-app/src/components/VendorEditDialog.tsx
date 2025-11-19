import { useState, useEffect } from 'react';
import {
  AxDialog,
  AxButton,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxParagraph,
} from '@ui/components';
import { fetchVendorById, updateVendor, Vendor } from '../api/vendorApi';
import { fetchAddresses, Address } from '../api/addressApi';
import { VendorAddressAssociation } from './VendorAddressAssociation';
import { useI18n } from '../i18n/I18nProvider';

interface VendorEditDialogProps {
  open: boolean;
  onClose: () => void;
  vendorId: string;
  onVendorUpdated?: (vendor: Vendor) => void;
  onAddressesUpdated?: () => void;
}

export function VendorEditDialog({
  open,
  onClose,
  vendorId,
  onVendorUpdated,
  onAddressesUpdated,
}: VendorEditDialogProps) {
  const { l10n } = useI18n();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [formData, setFormData] = useState<Partial<Vendor>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddressManagement, setShowAddressManagement] = useState(false);

  useEffect(() => {
    if (open && vendorId) {
      loadVendor();
      loadAddresses();
    }
  }, [open, vendorId]);

  const loadVendor = async () => {
    try {
      setLoading(true);
      const vendorData = await fetchVendorById(vendorId);
      setVendor(vendorData);
      setFormData(vendorData);
    } catch (err) {
      console.error('Error loading vendor:', err);
      alert(l10n('vendor.failedToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const loadAddresses = async () => {
    try {
      const addressesData = await fetchAddresses();
      setAddresses(addressesData);
    } catch (err) {
      console.error('Error loading addresses:', err);
    }
  };

  const getVendorAddresses = (vendorId: string): Address[] => {
    if (!vendor) return [];
    const addressIds: string[] = vendor.addressIds && Array.isArray(vendor.addressIds)
      ? vendor.addressIds
      : (vendor.jsonData?.addressIds && Array.isArray(vendor.jsonData.addressIds)
        ? vendor.jsonData.addressIds
        : []);
    return addresses.filter(addr => addressIds.includes(addr.id || ''));
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.streetAddress1,
      address.streetAddress2,
      `${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleSave = async () => {
    if (!vendor?.id) return;

    try {
      setSubmitting(true);
      const updated = await updateVendor(vendor.id, formData);
      // Reload vendor and addresses to get latest data including address associations
      await loadVendor();
      await loadAddresses();
      setVendor(updated);
      if (onVendorUpdated) {
        onVendorUpdated(updated);
      }
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
    } catch (err) {
      console.error('Error updating vendor:', err);
      alert(err instanceof Error ? err.message : l10n('vendor.failedToUpdate'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setShowAddressManagement(false);
      // Refresh addresses when closing to ensure parent has latest data
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
      onClose();
    }
  };

  if (!vendor) {
    return null;
  }

  return (
    <AxDialog
      open={open}
      onClose={handleClose}
      title={l10n('vendor.editTitle')}
      size="large"
      footer={
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between' }}>
          <div>
            <AxButton 
              variant="secondary" 
              onClick={() => setShowAddressManagement(true)}
              disabled={submitting}
            >
              {l10n('vendor.manageAddresses')}
            </AxButton>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <AxButton 
              variant="secondary" 
              onClick={handleClose}
              disabled={submitting}
            >
              {l10n('vendor.cancel')}
            </AxButton>
            <AxButton 
              variant="primary" 
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? l10n('vendor.saving') : l10n('vendor.save')}
            </AxButton>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('vendor.vendorNumber')}</AxLabel>
          <AxInput
            type="text"
            value={formData.vendorNumber || ''}
            onChange={(e) => {
              setFormData({ ...formData, vendorNumber: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting || loading}
            fullWidth
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('vendor.companyName')}</AxLabel>
          <AxInput
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => {
              setFormData({ ...formData, companyName: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting || loading}
            fullWidth
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('vendor.firstName')}</AxLabel>
          <AxInput
            type="text"
            value={formData.firstName || ''}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting || loading}
            fullWidth
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('vendor.lastName')}</AxLabel>
          <AxInput
            type="text"
            value={formData.lastName || ''}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting || loading}
            fullWidth
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('vendor.email')}</AxLabel>
          <AxInput
            type="email"
            value={formData.email || ''}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting || loading}
            fullWidth
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('vendor.phone')}</AxLabel>
          <AxInput
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting || loading}
            fullWidth
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('vendor.associatedAddresses')}</AxLabel>
          <div style={{ marginTop: 'var(--spacing-xs)' }}>
            {(() => {
              const vendorAddresses = getVendorAddresses(vendorId);
              if (vendorAddresses.length === 0) {
                return (
                  <AxParagraph color="secondary" italic>
                    {l10n('vendor.noAddresses')}
                  </AxParagraph>
                );
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {vendorAddresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      style={{ 
                        padding: 'var(--spacing-sm)', 
                        backgroundColor: 'var(--color-background-secondary)', 
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--font-size-sm)'
                      }}
                    >
                      <div style={{ fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-xs)' }}>
                        {addr.addressType === 'SHIPPING' ? l10n('vendor.addressType.shipping') :
                         addr.addressType === 'BILLING' ? l10n('vendor.addressType.billing') :
                         l10n('vendor.addressType.both')}
                      </div>
                      <div>{formatAddress(addr)}</div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </AxFormGroup>
      </div>

      {/* Address Management Dialog */}
      {showAddressManagement && (
        <AxDialog
          open={showAddressManagement}
          onClose={() => {
            setShowAddressManagement(false);
            loadAddresses();
            loadVendor();
            if (onAddressesUpdated) {
              onAddressesUpdated();
            }
          }}
          title={l10n('vendor.manageAddresses')}
          size="large"
          footer={
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <AxButton 
                variant="secondary" 
                onClick={() => {
                  setShowAddressManagement(false);
                  loadAddresses();
                  loadVendor();
                  if (onAddressesUpdated) {
                    onAddressesUpdated();
                  }
                }}
              >
                {l10n('vendor.close')}
              </AxButton>
            </div>
          }
        >
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <VendorAddressAssociation 
              vendorId={vendorId}
              onAddressesUpdated={() => {
                loadAddresses();
                loadVendor();
                if (onAddressesUpdated) {
                  onAddressesUpdated();
                }
              }}
            />
          </div>
        </AxDialog>
      )}
    </AxDialog>
  );
}

