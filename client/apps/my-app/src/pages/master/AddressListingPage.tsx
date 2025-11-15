import { useState, useEffect } from 'react';
import {
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxListbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchAddresses, createAddress, updateAddress, deleteAddress, Address } from '../../api/addressApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'AddressListingPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1;
`;

const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: var(--spacing-md);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const TableCard = styled(AxCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(100% - 6rem);
  overflow: hidden;
`;

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


  if (loading) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
            <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  ← Back
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  Addresses
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Manage shipping and billing addresses
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={handleAdd}>Add New</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading addresses...</AxParagraph>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
        <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
          <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
            <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
              {onNavigateBack && (
                <AxButton 
                  variant="secondary" 
                  onClick={onNavigateBack}
                  style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
                >
                  ← Back
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  Addresses
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Manage shipping and billing addresses
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={handleAdd}>Add New</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={() => window.location.reload()}>
              Retry
            </AxButton>
          </div>
        </TableCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={onNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                ← Back
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                Addresses
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Manage shipping and billing addresses
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxButton variant="primary" onClick={handleAdd}>Add New</AxButton>
            {onClose && (
              <AxButton variant="secondary" onClick={onClose}>Close</AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {filteredAddresses.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No addresses found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Type</AxTableHeader>
                  <AxTableHeader>Street Address</AxTableHeader>
                  <AxTableHeader>City</AxTableHeader>
                  <AxTableHeader>State</AxTableHeader>
                  <AxTableHeader>Postal Code</AxTableHeader>
                  <AxTableHeader>Country</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {filteredAddresses.map((address) => (
                  <AxTableRow key={address.id}>
                    <AxTableCell>
                      {address.addressType 
                        ? address.addressType 
                        : <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Both</span>}
                    </AxTableCell>
                    <AxTableCell>{address.streetAddress1 || ''}</AxTableCell>
                    <AxTableCell>{address.city || ''}</AxTableCell>
                    <AxTableCell>{address.state || ''}</AxTableCell>
                    <AxTableCell>{address.postalCode || ''}</AxTableCell>
                    <AxTableCell>{address.country || ''}</AxTableCell>
                    <AxTableCell align="center">
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                        <AxButton 
                          variant="secondary" 
                          size="small"
                          onClick={() => handleEdit(address)}
                          style={{ minWidth: '80px' }}
                        >
                          Edit
                        </AxButton>
                        <AxButton 
                          variant="danger" 
                          size="small"
                          onClick={() => handleDeleteClick(address)}
                          style={{ minWidth: '80px' }}
                        >
                          Delete
                        </AxButton>
                      </div>
                    </AxTableCell>
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          )}
        </div>
      </TableCard>

      {/* Add/Edit Address Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setFormData({});
          setSelectedAddress(null);
        }}
        title={dialogMode === 'add' ? 'Add Address' : 'Edit Address'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDialogMode(null);
                setFormData({});
                setSelectedAddress(null);
              }}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="primary" 
              onClick={handleSave}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save'}
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

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedAddress(null);
        }}
        title="Delete Address"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedAddress(null);
              }}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? 'Deleting...' : 'Delete'}
            </AxButton>
          </div>
        }
      >
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          Are you sure you want to delete this address?
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          This action cannot be undone.
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

