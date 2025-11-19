import { Fragment } from 'react';
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
import { debugProps } from '../../utils/emotionCache';
import { Customer } from '../../api/customerApi';
import { Address } from '../../api/addressApi';
import { CustomerAddressAssociation } from '../../components/CustomerAddressAssociation';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './CustomerListingPage.styles';

const COMPONENT_NAME = 'CustomerListingPage';

type DialogMode = 'add' | 'edit' | null;

type ListingRenderContext = {
  onEdit: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
};

const LISTING_TABLE_COLUMNS = [
  { 
    key: 'customer.customerNumber',
    label: 'Customer Number',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (customer: Customer) => customer.customerNumber || ''
  },
  { 
    key: 'customer.companyName',
    label: 'Company Name',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (customer: Customer) => customer.companyName || ''
  },
  { 
    key: 'customer.firstName',
    label: 'First Name',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (customer: Customer) => customer.firstName || ''
  },
  { 
    key: 'customer.lastName',
    label: 'Last Name',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (customer: Customer) => customer.lastName || ''
  },
  { 
    key: 'customer.email',
    label: 'Email',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (customer: Customer) => customer.email || ''
  },
  { 
    key: 'customer.phone',
    label: 'Phone',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (customer: Customer) => customer.phone || ''
  },
  { 
    key: 'customer.actions',
    label: 'Actions',
    align: 'center' as const,
    render: (customer: Customer, context: ListingRenderContext) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
        <AxButton 
          variant="secondary" 
          size="small"
          onClick={() => context.onEdit(customer)}
          style={{ minWidth: '80px' }}
        >
          Edit
        </AxButton>
        <AxButton 
          variant="danger" 
          size="small"
          onClick={() => context.onDeleteClick(customer)}
          style={{ minWidth: '80px' }}
        >
          Delete
        </AxButton>
      </div>
    )
  },
];

interface CustomerListingPageRenderProps {
  customers: Customer[];
  addresses: Address[];
  loading: boolean;
  error: string | null;
  dialogMode: DialogMode;
  deleteDialogOpen: boolean;
  selectedCustomer: Customer | null;
  formData: Partial<Customer>;
  submitting: boolean;
  showAddressDialog: boolean;
  addressDialogCustomerId: string | null;
  onNavigateBack?: () => void;
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onDeleteClick: (customer: Customer) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onSave: () => void;
  onDialogClose: () => void;
  onFormDataChange: (data: Partial<Customer>) => void;
  onManageAddresses: () => void;
  onAddressDialogClose: () => void;
  onAddressesUpdated: () => void;
  onRetry: () => void;
  formatAddress: (address: Address) => string;
  getCustomerAddresses: (customerId: string | undefined) => Address[];
}

export function CustomerListingPageRender(props: CustomerListingPageRenderProps) {
  const {
    customers,
    addresses,
    loading,
    error,
    dialogMode,
    deleteDialogOpen,
    selectedCustomer,
    formData,
    submitting,
    showAddressDialog,
    addressDialogCustomerId,
    onNavigateBack,
    onAdd,
    onEdit,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteCancel,
    onSave,
    onDialogClose,
    onFormDataChange,
    onManageAddresses,
    onAddressDialogClose,
    onAddressesUpdated,
    onRetry,
    formatAddress,
    getCustomerAddresses,
  } = props;

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
              <AxButton variant="primary" onClick={onAdd}>Add New</AxButton>
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
              <AxButton variant="primary" onClick={onAdd}>Add New</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={onRetry}>
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
            <AxButton variant="primary" onClick={onAdd}>Add New</AxButton>
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
            <AxTable fullWidth stickyHeader>
              <AxTableHead>
                <AxTableRow>
                  {LISTING_TABLE_COLUMNS.map((column) => (
                    <AxTableHeader key={column.key} align={column.align}>
                      {column.label}
                    </AxTableHeader>
                  ))}
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {customers.map((customer) => {
                  const customerAddresses = getCustomerAddresses(customer.id);
                  const context: ListingRenderContext = {
                    onEdit,
                    onDeleteClick,
                  };
                  return (
                    <Fragment key={customer.id}>
                      <AxTableRow>
                        {LISTING_TABLE_COLUMNS.map((column) => (
                          <AxTableCell key={column.key} align={column.align}>
                            {column.render(customer, context)}
                          </AxTableCell>
                        ))}
                      </AxTableRow>
                      {customerAddresses.length > 0 && (
                        <AxTableRow key={`${customer.id}-addresses`}>
                          <AxTableCell colSpan={LISTING_TABLE_COLUMNS.length} style={{ paddingTop: 0, paddingBottom: 'var(--spacing-md)' }}>
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
        onClose={onDialogClose}
        title={dialogMode === 'add' ? 'Add Customer' : 'Edit Customer'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between' }}>
            <div>
              {selectedCustomer?.id && (
                <AxButton 
                  variant="secondary" 
                  onClick={onManageAddresses}
                  disabled={submitting}
                >
                  Manage Addresses
                </AxButton>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <AxButton 
                variant="secondary" 
                onClick={onDialogClose}
                disabled={submitting}
              >
                Cancel
              </AxButton>
              <AxButton 
                variant="primary" 
                onClick={onSave}
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
              onChange={(e) => onFormDataChange({ ...formData, customerNumber: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, companyName: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
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
        onClose={onDeleteCancel}
        title="Delete Customer"
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              Cancel
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={onDeleteConfirm}
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
          onClose={onAddressDialogClose}
          title="Manage Addresses"
          size="large"
          footer={
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <AxButton 
                variant="secondary" 
                onClick={onAddressDialogClose}
              >
                Close
              </AxButton>
            </div>
          }
        >
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <CustomerAddressAssociation 
              customerId={addressDialogCustomerId}
              onAddressesUpdated={onAddressesUpdated}
            />
          </div>
        </AxDialog>
      )}
    </PageContainer>
  );
}

