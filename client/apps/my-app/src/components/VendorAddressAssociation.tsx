import { useState, useEffect } from 'react';
import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxListbox,
  AxLabel,
  AxFormGroup,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
  AxDialog,
} from '@ui/components';
import { fetchAddresses, deleteAddress, Address } from '../api/addressApi';
import { fetchVendorById, updateVendor, Vendor } from '../api/vendorApi';
import styled from '@emotion/styled';
import { debugProps } from '../utils/emotionCache';
import { AddressFormDialog } from './AddressFormDialog';

const COMPONENT_NAME = 'VendorAddressAssociation';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const AddressCard = styled(AxCard)`
  padding: var(--spacing-md) !important;
`;

interface VendorAddressAssociationProps {
  vendorId: string;
  onAddressesUpdated?: () => void;
}

export function VendorAddressAssociation({ vendorId, onAddressesUpdated }: VendorAddressAssociationProps) {
  const [allAddresses, setAllAddresses] = useState<Address[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [associatedAddresses, setAssociatedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [vendorId]);

  const getVendorAddressIds = (vendor: Vendor | null): string[] => {
    if (!vendor) return [];
    // Check addressIds array first
    if (vendor.addressIds && Array.isArray(vendor.addressIds)) {
      return vendor.addressIds;
    }
    // Fallback to jsonData for backward compatibility
    if (vendor.jsonData && vendor.jsonData.addressIds && Array.isArray(vendor.jsonData.addressIds)) {
      return vendor.jsonData.addressIds;
    }
    return [];
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Load vendor and addresses in parallel
      const [vendorData, addressesData] = await Promise.all([
        fetchVendorById(vendorId),
        fetchAddresses(),
      ]);
      
      setVendor(vendorData);
      setAllAddresses(addressesData);
      
      // Get address IDs from vendor
      const addressIds = getVendorAddressIds(vendorData);
      
      // Filter addresses associated with this vendor
      const associated = addressesData.filter(addr => addressIds.includes(addr.id || ''));
      setAssociatedAddresses(associated);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressCreated = async (address: Address) => {
    // Reload data to include the new address
    await loadData();
    // Automatically associate the new address with the vendor
    if (address.id && vendor) {
      try {
        setLoading(true);
        let addressIds = getVendorAddressIds(vendor);
        if (!addressIds.includes(address.id)) {
          addressIds = [...addressIds, address.id];
          await updateVendor(vendorId, {
            ...vendor,
            addressIds: addressIds,
            jsonData: {
              ...(vendor.jsonData || {}),
              addressIds: addressIds,
            },
          });
          await loadData();
        }
      } catch (err) {
        console.error('Error associating new address:', err);
        alert('Address created but failed to associate with vendor');
      } finally {
        setLoading(false);
      }
    }
    setAddressDialogOpen(false);
    if (onAddressesUpdated) {
      onAddressesUpdated();
    }
  };

  const handleAssociateAddress = async () => {
    if (!selectedAddressId || !vendor) return;

    try {
      setLoading(true);
      
      // Get existing addressIds array from vendor
      let addressIds = getVendorAddressIds(vendor);
      
      // Add selected address ID if not already present
      if (!addressIds.includes(selectedAddressId)) {
        addressIds = [...addressIds, selectedAddressId];
      }

      // Update vendor with new addressIds
      await updateVendor(vendorId, {
        ...vendor,
        addressIds: addressIds,
        jsonData: {
          ...(vendor.jsonData || {}),
          addressIds: addressIds, // Store in jsonData for persistence
        },
      });

      await loadData();
      setSelectedAddressId(null);
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
    } catch (err) {
      console.error('Error associating address:', err);
      alert('Failed to associate address');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssociation = async (addressId: string) => {
    if (!vendor) return;

    try {
      setLoading(true);
      
      // Get existing addressIds array from vendor
      let addressIds = getVendorAddressIds(vendor);
      
      // Remove address ID from array
      addressIds = addressIds.filter(id => id !== addressId);

      // Update vendor with updated addressIds
      await updateVendor(vendorId, {
        ...vendor,
        addressIds: addressIds,
        jsonData: {
          ...(vendor.jsonData || {}),
          addressIds: addressIds, // Store in jsonData for persistence
        },
      });

      await loadData();
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
    } catch (err) {
      console.error('Error removing address association:', err);
      alert('Failed to remove address association');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (address: Address) => {
    setAddressToDelete(address);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!addressToDelete?.id) return;

    try {
      setDeleting(true);
      // Delete the address (backend will automatically remove it from all vendors)
      await deleteAddress(addressToDelete.id);
      
      // Reload data to reflect changes
      await loadData();
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
      if (onAddressesUpdated) {
        onAddressesUpdated();
      }
    } catch (err) {
      console.error('Error deleting address:', err);
      alert('Failed to delete address');
    } finally {
      setDeleting(false);
    }
  };

  // Get addresses not already associated with this vendor
  const vendorAddressIds = getVendorAddressIds(vendor);
  const availableAddresses = allAddresses.filter(addr => 
    !vendorAddressIds.includes(addr.id || '')
  );

  const addressOptions = availableAddresses.map(addr => {
    return {
      value: addr.id!,
      label: `${addr.streetAddress1 || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.postalCode || ''}${addr.addressType ? ` (${addr.addressType})` : ' (Both)'}`,
    };
  });

  const formatAddress = (address: Address) => {
    const parts = [
      address.streetAddress1,
      address.streetAddress2,
      `${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Container {...debugProps(COMPONENT_NAME, 'Container')}>
      <Section {...debugProps(COMPONENT_NAME, 'Section')}>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>Associate Address</AxHeading3>
        <AddressCard padding="medium">
          <AxFormGroup>
            <AxLabel>Select Address to Associate</AxLabel>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <AxListbox
                  options={addressOptions}
                  value={selectedAddressId}
                  onChange={setSelectedAddressId}
                  placeholder="Select an unassociated address"
                  fullWidth
                  disabled={loading || addressOptions.length === 0}
                />
              </div>
              <AxButton
                onClick={() => setAddressDialogOpen(true)}
                disabled={loading}
                title="Create new address"
                style={{ 
                  width: '44px',
                  height: '44px',
                  minWidth: '44px',
                  padding: 0,
                  whiteSpace: 'nowrap', 
                  flexShrink: 0, 
                  overflow: 'visible', 
                  textOverflow: 'clip',
                  backgroundColor: 'var(--color-background-secondary)',
                  color: 'var(--color-text-primary)',
                  border: '2px solid var(--color-border-default)',
                  alignSelf: 'flex-start'
                }}
              >
                ...
              </AxButton>
              <AxButton
                variant="primary"
                onClick={handleAssociateAddress}
                disabled={!selectedAddressId || loading || addressOptions.length === 0}
              >
                Associate
              </AxButton>
            </div>
            {addressOptions.length === 0 && (
              <AxParagraph marginTop="xs" color="secondary" size="sm">
                No addresses available to associate. Click ... to create a new address.
              </AxParagraph>
            )}
          </AxFormGroup>
        </AddressCard>
      </Section>

      <Section>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}>Associated Addresses</AxHeading3>
        {associatedAddresses.length === 0 ? (
          <AddressCard padding="medium">
            <AxParagraph color="secondary" textAlign="center">
              No addresses associated with this vendor
            </AxParagraph>
          </AddressCard>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Type</AxTableHeader>
                  <AxTableHeader>Address</AxTableHeader>
                  <AxTableHeader>Contact</AxTableHeader>
                  <AxTableHeader align="center">Default</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {associatedAddresses.map((address) => (
                  <AxTableRow key={address.id}>
                    <AxTableCell>
                      {address.addressType 
                        ? address.addressType 
                        : <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>Both</span>}
                    </AxTableCell>
                    <AxTableCell>{formatAddress(address)}</AxTableCell>
                    <AxTableCell>
                      {address.contactName && (
                        <div>
                          <div>{address.contactName}</div>
                          {address.contactPhone && (
                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                              {address.contactPhone}
                            </div>
                          )}
                        </div>
                      )}
                    </AxTableCell>
                    <AxTableCell align="center">
                      {address.defaultAddress ? (
                        <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Yes</span>
                      ) : (
                        <span style={{ color: 'var(--color-text-secondary)' }}>No</span>
                      )}
                    </AxTableCell>
                    <AxTableCell align="center">
                      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                        <AxButton
                          variant="secondary"
                          size="small"
                          onClick={() => handleRemoveAssociation(address.id!)}
                          disabled={loading}
                        >
                          Remove
                        </AxButton>
                        <AxButton
                          variant="danger"
                          size="small"
                          onClick={() => handleDeleteClick(address)}
                          disabled={loading}
                        >
                          Delete
                        </AxButton>
                      </div>
                    </AxTableCell>
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          </div>
        )}
      </Section>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAddressToDelete(null);
        }}
        title="Delete Address"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setAddressToDelete(null);
              }}
              disabled={deleting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AxButton>
          </div>
        }
      >
        <AxParagraph marginBottom="md">
          Are you sure you want to delete this address?
        </AxParagraph>
        {addressToDelete && (
          <AxParagraph color="secondary" size="sm" marginBottom="md">
            {formatAddress(addressToDelete)}
          </AxParagraph>
        )}
        <AxParagraph color="secondary" size="sm">
          This action cannot be undone. The address will be permanently deleted.
        </AxParagraph>
      </AxDialog>

      <AddressFormDialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        onAddressCreated={handleAddressCreated}
        vendorId={vendorId}
      />
    </Container>
  );
}

