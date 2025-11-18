import { useState, useEffect, Fragment } from 'react';
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
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { fetchVendors, createVendor, updateVendor, deleteVendor, Vendor } from '../../api/vendorApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import { VendorAddressAssociation } from '../../components/VendorAddressAssociation';
import { useWebSocket } from '../../hooks/useWebSocket';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'VendorListingPage';

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
                  {l10n('vendor.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('module.vendor')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('vendor.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={handleAdd}>{l10n('vendor.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('vendor.loading')}</AxParagraph>
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
                  {l10n('vendor.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('module.vendor')}
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  {l10n('vendor.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={handleAdd}>{l10n('vendor.addNew')}</AxButton>
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
                {l10n('vendor.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('module.vendor')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('vendor.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxButton variant="primary" onClick={handleAdd}>{l10n('vendor.addNew')}</AxButton>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {vendors.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('vendor.noData')}</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth stickyHeader>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>{l10n('vendor.vendorNumber')}</AxTableHeader>
                  <AxTableHeader>{l10n('vendor.companyName')}</AxTableHeader>
                  <AxTableHeader>{l10n('vendor.firstName')}</AxTableHeader>
                  <AxTableHeader>{l10n('vendor.lastName')}</AxTableHeader>
                  <AxTableHeader>{l10n('vendor.email')}</AxTableHeader>
                  <AxTableHeader>{l10n('vendor.phone')}</AxTableHeader>
                  <AxTableHeader align="center">{l10n('vendor.actions')}</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {vendors.map((vendor) => {
                  const vendorAddresses = getVendorAddresses(vendor.id);
                  return (
                    <Fragment key={vendor.id}>
                      <AxTableRow>
                        <AxTableCell>{vendor.vendorNumber || ''}</AxTableCell>
                        <AxTableCell>{vendor.companyName || ''}</AxTableCell>
                        <AxTableCell>{vendor.firstName || ''}</AxTableCell>
                        <AxTableCell>{vendor.lastName || ''}</AxTableCell>
                        <AxTableCell>{vendor.email || ''}</AxTableCell>
                        <AxTableCell>{vendor.phone || ''}</AxTableCell>
                        <AxTableCell align="center">
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                            <AxButton 
                              variant="secondary" 
                              size="small"
                              onClick={() => handleEdit(vendor)}
                              style={{ minWidth: '80px' }}
                            >
                              {l10n('vendor.edit')}
                            </AxButton>
                            <AxButton 
                              variant="danger" 
                              size="small"
                              onClick={() => handleDeleteClick(vendor)}
                              style={{ minWidth: '80px' }}
                            >
                              {l10n('vendor.delete')}
                            </AxButton>
                          </div>
                        </AxTableCell>
                      </AxTableRow>
                      {vendorAddresses.length > 0 && (
                        <AxTableRow key={`${vendor.id}-addresses`}>
                          <AxTableCell colSpan={7} style={{ paddingTop: 0, paddingBottom: 'var(--spacing-md)' }}>
                            <div style={{ paddingLeft: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                              <strong style={{ color: 'var(--color-text-primary)', marginRight: 'var(--spacing-sm)' }}>Addresses:</strong>
                              {vendorAddresses.map((addr, index) => (
                                <span key={addr.id}>
                                  {index > 0 && <span style={{ margin: '0 var(--spacing-xs)' }}>|</span>}
                                  <span style={{ marginRight: 'var(--spacing-xs)' }}>
                                    {addr.addressType ? `[${addr.addressType}]` : '[Both]'} {formatAddress(addr)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </AxTableCell>
                        </AxTableRow>
                      )}
                    </Fragment>
                  );
                })}
              </AxTableBody>
            </AxTable>
          )}
        </div>
      </TableCard>

      {/* Add/Edit Vendor Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setFormData({});
          setSelectedVendor(null);
        }}
        title={dialogMode === 'add' ? l10n('vendor.addTitle') : l10n('vendor.editTitle')}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between' }}>
            <div>
              {selectedVendor?.id && (
                <AxButton 
                  variant="secondary" 
                  onClick={handleManageAddresses}
                  disabled={submitting}
                >
                  {l10n('vendor.manageAddresses')}
                </AxButton>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <AxButton 
                variant="secondary" 
                onClick={() => {
                  setDialogMode(null);
                  setFormData({});
                  setSelectedVendor(null);
                }}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
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
              disabled={submitting}
              fullWidth
            />
          </AxFormGroup>
          {dialogMode === 'edit' && selectedVendor?.id && (
            <AxFormGroup>
              <AxLabel>{l10n('vendor.associatedAddresses')}</AxLabel>
              <div style={{ marginTop: 'var(--spacing-xs)' }}>
                {(() => {
                  const vendorAddresses = getVendorAddresses(selectedVendor.id);
                  if (vendorAddresses.length === 0) {
                    return (
                      <AxParagraph style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
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
                            {addr.addressType || 'Both (Shipping & Billing)'}
                          </div>
                          <div>{formatAddress(addr)}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </AxFormGroup>
          )}
        </div>
      </AxDialog>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedVendor(null);
        }}
        title={l10n('vendor.deleteTitle')}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedVendor(null);
              }}
              disabled={submitting}
            >
              {l10n('vendor.cancel')}
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={handleDelete}
              disabled={submitting}
            >
              {submitting ? l10n('vendor.deleting') : l10n('vendor.delete')}
            </AxButton>
          </div>
        }
      >
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          {l10n('vendor.deleteMessage')}
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          {l10n('vendor.deleteWarning')}
        </AxParagraph>
      </AxDialog>

      {/* Address Management Dialog */}
      {showAddressDialog && addressDialogVendorId && (
        <AxDialog
          open={showAddressDialog}
          onClose={handleAddressDialogClose}
          title={l10n('vendor.manageAddresses')}
          size="large"
          footer={
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <AxButton 
                variant="secondary" 
                onClick={handleAddressDialogClose}
              >
                {l10n('vendor.close')}
              </AxButton>
            </div>
          }
        >
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <VendorAddressAssociation 
              vendorId={addressDialogVendorId}
              onAddressesUpdated={() => {
                // Optionally refresh vendor data or show notification
                loadVendors();
              }}
            />
          </div>
        </AxDialog>
      )}
    </PageContainer>
  );
}

