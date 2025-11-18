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
import { debugProps } from '../../utils/emotionCache';
import { Address } from '../../api/addressApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './AddressListingPage.styles';

const COMPONENT_NAME = 'AddressListingPage';

type DialogMode = 'add' | 'edit' | null;

interface AddressListingPageRenderProps {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  customerId?: string;
  filteredAddresses: Address[];
  dialogMode: DialogMode;
  deleteDialogOpen: boolean;
  selectedAddress: Address | null;
  formData: Partial<Address>;
  submitting: boolean;
  onAddressCreated?: (address: Address) => void;
  onClose?: () => void;
  onNavigateBack?: () => void;
  onAdd: () => void;
  onEdit: (address: Address) => void;
  onDeleteClick: (address: Address) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onSave: () => void;
  onDialogClose: () => void;
  onFormDataChange: (data: Partial<Address>) => void;
  onRetry: () => void;
}

export function AddressListingPageRender(props: AddressListingPageRenderProps) {
  const {
    addresses,
    loading,
    error,
    customerId,
    filteredAddresses,
    dialogMode,
    deleteDialogOpen,
    selectedAddress,
    formData,
    submitting,
    onAddressCreated,
    onClose,
    onNavigateBack,
    onAdd,
    onEdit,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteCancel,
    onSave,
    onDialogClose,
    onFormDataChange,
    onRetry,
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
                  Addresses
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Manage shipping and billing addresses
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
                Addresses
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Manage shipping and billing addresses
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxButton variant="primary" onClick={onAdd}>Add New</AxButton>
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
            <AxTable fullWidth stickyHeader>
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
                          onClick={() => onEdit(address)}
                          style={{ minWidth: '80px' }}
                        >
                          Edit
                        </AxButton>
                        <AxButton 
                          variant="danger" 
                          size="small"
                          onClick={() => onDeleteClick(address)}
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
        onClose={onDialogClose}
        title={dialogMode === 'add' ? 'Add Address' : 'Edit Address'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
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
                onFormDataChange({ ...formData, addressType: value as 'SHIPPING' | 'BILLING' | null | undefined });
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
              onChange={(e) => onFormDataChange({ ...formData, streetAddress1: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, streetAddress2: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, state: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, postalCode: e.target.value })}
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
                onChange={(e) => onFormDataChange({ ...formData, country: e.target.value })}
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
        onClose={onDeleteCancel}
        title="Delete Address"
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
          Are you sure you want to delete this address?
        </AxParagraph>
        <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          This action cannot be undone.
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

