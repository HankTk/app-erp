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
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer, Customer } from '../../api/customerApi';
import { fetchAddresses, Address } from '../../api/addressApi';
import { CustomerAddressAssociation } from '../../components/CustomerAddressAssociation';
import { useWebSocket } from '../../hooks/useWebSocket';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'CustomerListingPage';

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
                  Customers
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Manage customer accounts
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
            <AxParagraph>Loading customers...</AxParagraph>
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
                  Customers
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Manage customer accounts
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
                Customers
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Manage customer accounts
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxButton variant="primary" onClick={handleAdd}>Add New</AxButton>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {customers.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No customers found</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Customer Number</AxTableHeader>
                  <AxTableHeader>Company Name</AxTableHeader>
                  <AxTableHeader>First Name</AxTableHeader>
                  <AxTableHeader>Last Name</AxTableHeader>
                  <AxTableHeader>Email</AxTableHeader>
                  <AxTableHeader>Phone</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {customers.map((customer) => {
                  const customerAddresses = getCustomerAddresses(customer.id);
                  return (
                    <Fragment key={customer.id}>
                      <AxTableRow>
                        <AxTableCell>{customer.customerNumber || ''}</AxTableCell>
                        <AxTableCell>{customer.companyName || ''}</AxTableCell>
                        <AxTableCell>{customer.firstName || ''}</AxTableCell>
                        <AxTableCell>{customer.lastName || ''}</AxTableCell>
                        <AxTableCell>{customer.email || ''}</AxTableCell>
                        <AxTableCell>{customer.phone || ''}</AxTableCell>
                        <AxTableCell align="center">
                          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
                            <AxButton 
                              variant="secondary" 
                              size="small"
                              onClick={() => handleEdit(customer)}
                              style={{ minWidth: '80px' }}
                            >
                              Edit
                            </AxButton>
                            <AxButton 
                              variant="danger" 
                              size="small"
                              onClick={() => handleDeleteClick(customer)}
                              style={{ minWidth: '80px' }}
                            >
                              Delete
                            </AxButton>
                          </div>
                        </AxTableCell>
                      </AxTableRow>
                      {customerAddresses.length > 0 && (
                        <AxTableRow key={`${customer.id}-addresses`}>
                          <AxTableCell colSpan={7} style={{ paddingTop: 0, paddingBottom: 'var(--spacing-md)' }}>
                            <div style={{ paddingLeft: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                              <strong style={{ color: 'var(--color-text-primary)', marginRight: 'var(--spacing-sm)' }}>Addresses:</strong>
                              {customerAddresses.map((addr, index) => (
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

      {/* Add/Edit Customer Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={() => {
          setDialogMode(null);
          setFormData({});
          setSelectedCustomer(null);
        }}
        title={dialogMode === 'add' ? 'Add Customer' : 'Edit Customer'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between' }}>
            <div>
              {selectedCustomer?.id && (
                <AxButton 
                  variant="secondary" 
                  onClick={handleManageAddresses}
                  disabled={submitting}
                >
                  Manage Addresses
                </AxButton>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <AxButton 
                variant="secondary" 
                onClick={() => {
                  setDialogMode(null);
                  setFormData({});
                  setSelectedCustomer(null);
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
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <AxFormGroup>
            <AxLabel>Customer Number</AxLabel>
            <AxInput
              type="text"
              value={formData.customerNumber || ''}
              onChange={(e) => {
                setFormData({ ...formData, customerNumber: e.target.value });
              }}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>Company Name</AxLabel>
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
            <AxLabel>First Name</AxLabel>
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
            <AxLabel>Last Name</AxLabel>
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
            <AxLabel>Email</AxLabel>
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
            <AxLabel>Phone</AxLabel>
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
          {dialogMode === 'edit' && selectedCustomer?.id && (
            <AxFormGroup>
              <AxLabel>Associated Addresses</AxLabel>
              <div style={{ marginTop: 'var(--spacing-xs)' }}>
                {(() => {
                  const customerAddresses = getCustomerAddresses(selectedCustomer.id);
                  if (customerAddresses.length === 0) {
                    return (
                      <AxParagraph style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        No addresses associated with this customer
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
          setSelectedCustomer(null);
        }}
        title="Delete Customer"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={() => {
                setDeleteDialogOpen(false);
                setSelectedCustomer(null);
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
          Are you sure you want to delete this customer?
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          This action cannot be undone.
        </AxParagraph>
      </AxDialog>

      {/* Address Management Dialog */}
      {showAddressDialog && addressDialogCustomerId && (
        <AxDialog
          open={showAddressDialog}
          onClose={handleAddressDialogClose}
          title="Manage Addresses"
          size="large"
          footer={
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <AxButton 
                variant="secondary" 
                onClick={handleAddressDialogClose}
              >
                Close
              </AxButton>
            </div>
          }
        >
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <CustomerAddressAssociation 
              customerId={addressDialogCustomerId}
              onAddressesUpdated={() => {
                // Optionally refresh customer data or show notification
              }}
            />
          </div>
        </AxDialog>
      )}
    </PageContainer>
  );
}

