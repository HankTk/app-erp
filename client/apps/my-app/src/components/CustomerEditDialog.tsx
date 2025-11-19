import { useState, useEffect } from 'react';
import {
  AxDialog,
  AxButton,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxParagraph,
} from '@ui/components';
import { fetchCustomerById, updateCustomer, Customer } from '../api/customerApi';
import { fetchAddresses, Address } from '../api/addressApi';
import { CustomerAddressAssociation } from './CustomerAddressAssociation';
import { useI18n } from '../i18n/I18nProvider';

interface CustomerEditDialogProps {
  open: boolean;
  onClose: () => void;
  customerId: string;
  onCustomerUpdated?: (customer: Customer) => void;
  onAddressesUpdated?: () => void;
}

export function CustomerEditDialog({
  open,
  onClose,
  customerId,
  onCustomerUpdated,
  onAddressesUpdated,
}: CustomerEditDialogProps) {
  const { l10n } = useI18n();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAddressManagement, setShowAddressManagement] = useState(false);

  useEffect(() => {
    if (open && customerId) {
      loadCustomer();
      loadAddresses();
    }
  }, [open, customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const customerData = await fetchCustomerById(customerId);
      setCustomer(customerData);
      setFormData(customerData);
    } catch (err) {
      console.error('Error loading customer:', err);
      alert(l10n('customer.failedToLoad'));
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

  const getCustomerAddresses = (customerId: string): Address[] => {
    if (!customer) return [];
    const addressIds: string[] = customer.addressIds && Array.isArray(customer.addressIds)
      ? customer.addressIds
      : (customer.jsonData?.addressIds && Array.isArray(customer.jsonData.addressIds)
        ? customer.jsonData.addressIds
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
    if (!customer?.id) return;

    try {
      setSubmitting(true);
      const updated = await updateCustomer(customer.id, formData);
      // Reload customer and addresses to get latest data including address associations
      await loadCustomer();
      await loadAddresses();
      setCustomer(updated);
      if (onCustomerUpdated) {
        onCustomerUpdated(updated);
      }
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      alert(err instanceof Error ? err.message : l10n('customer.failedToUpdate'));
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

  if (!customer) {
    return null;
  }

  return (
    <AxDialog
      open={open}
      onClose={handleClose}
      title={l10n('customer.editTitle')}
      size="large"
      footer={
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between' }}>
          <div>
            <AxButton 
              variant="secondary" 
              onClick={() => setShowAddressManagement(true)}
              disabled={submitting}
            >
              {l10n('customer.manageAddresses')}
            </AxButton>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
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
              {submitting ? l10n('common.saving') : l10n('common.save')}
            </AxButton>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <AxFormGroup>
          <AxLabel>{l10n('customer.customerNumber')}</AxLabel>
          <AxInput
            type="text"
            value={formData.customerNumber || ''}
            onChange={(e) => {
              setFormData({ ...formData, customerNumber: e.target.value });
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
            disabled={submitting || loading}
            fullWidth
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxLabel>{l10n('customer.companyName')}</AxLabel>
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
          <AxLabel>{l10n('customer.firstName')}</AxLabel>
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
          <AxLabel>{l10n('customer.lastName')}</AxLabel>
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
          <AxLabel>{l10n('customer.email')}</AxLabel>
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
          <AxLabel>{l10n('customer.phone')}</AxLabel>
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
          <AxLabel>{l10n('customer.associatedAddresses')}</AxLabel>
          <div style={{ marginTop: 'var(--spacing-xs)' }}>
            {(() => {
              const customerAddresses = getCustomerAddresses(customerId);
              if (customerAddresses.length === 0) {
                return (
                  <AxParagraph color="secondary" italic>
                    {l10n('customer.noAddresses')}
                  </AxParagraph>
                );
              }
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {customerAddresses.map((addr) => (
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
                        {addr.addressType === 'SHIPPING' ? l10n('customer.addressType.shipping') :
                         addr.addressType === 'BILLING' ? l10n('customer.addressType.billing') :
                         l10n('customer.addressType.both')}
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
            loadCustomer();
            if (onAddressesUpdated) {
              onAddressesUpdated();
            }
          }}
          title={l10n('customer.manageAddresses')}
          size="large"
          footer={
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <AxButton 
                variant="secondary" 
                onClick={() => {
                  setShowAddressManagement(false);
                  loadAddresses();
                  loadCustomer();
                  if (onAddressesUpdated) {
                    onAddressesUpdated();
                  }
                }}
              >
                {l10n('customer.close')}
              </AxButton>
            </div>
          }
        >
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <CustomerAddressAssociation 
              customerId={customerId}
              onAddressesUpdated={() => {
                loadAddresses();
                loadCustomer();
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

