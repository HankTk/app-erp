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
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import { Vendor } from '../../api/vendorApi';
import { Address } from '../../api/addressApi';
import { VendorAddressAssociation } from '../../components/VendorAddressAssociation';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './VendorListingPage.styles';

const COMPONENT_NAME = 'VendorListingPage';

type DialogMode = 'add' | 'edit' | null;

interface VendorListingPageRenderProps {
  vendors: Vendor[];
  addresses: Address[];
  loading: boolean;
  error: string | null;
  dialogMode: DialogMode;
  deleteDialogOpen: boolean;
  selectedVendor: Vendor | null;
  formData: Partial<Vendor>;
  submitting: boolean;
  showAddressDialog: boolean;
  addressDialogVendorId: string | null;
  onNavigateBack?: () => void;
  onAdd: () => void;
  onEdit: (vendor: Vendor) => void;
  onDeleteClick: (vendor: Vendor) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onSave: () => void;
  onDialogClose: () => void;
  onFormDataChange: (data: Partial<Vendor>) => void;
  onManageAddresses: () => void;
  onAddressDialogClose: () => void;
  onAddressesUpdated: () => void;
  onRetry: () => void;
  formatAddress: (address: Address) => string;
  getVendorAddresses: (vendorId: string | undefined) => Address[];
}

export function VendorListingPageRender(props: VendorListingPageRenderProps) {
  const {
    vendors,
    addresses,
    loading,
    error,
    dialogMode,
    deleteDialogOpen,
    selectedVendor,
    formData,
    submitting,
    showAddressDialog,
    addressDialogVendorId,
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
    getVendorAddresses,
  } = props;
  
  const { l10n } = useI18n();

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
              <AxButton variant="primary" onClick={onAdd}>{l10n('vendor.addNew')}</AxButton>
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
              <AxButton variant="primary" onClick={onAdd}>{l10n('vendor.addNew')}</AxButton>
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
            <AxButton variant="primary" onClick={onAdd}>{l10n('vendor.addNew')}</AxButton>
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
                              onClick={() => onEdit(vendor)}
                              style={{ minWidth: '80px' }}
                            >
                              {l10n('vendor.edit')}
                            </AxButton>
                            <AxButton 
                              variant="danger" 
                              size="small"
                              onClick={() => onDeleteClick(vendor)}
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
        onClose={onDialogClose}
        title={dialogMode === 'add' ? l10n('vendor.addTitle') : l10n('vendor.editTitle')}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'space-between' }}>
            <div>
              {selectedVendor?.id && (
                <AxButton 
                  variant="secondary" 
                  onClick={onManageAddresses}
                  disabled={submitting}
                >
                  {l10n('vendor.manageAddresses')}
                </AxButton>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <AxButton 
                variant="secondary" 
                onClick={onDialogClose}
                disabled={submitting}
              >
                {l10n('vendor.cancel')}
              </AxButton>
              <AxButton 
                variant="primary" 
                onClick={onSave}
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
              onChange={(e) => onFormDataChange({ ...formData, vendorNumber: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, companyName: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
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
              onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
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
        onClose={onDeleteCancel}
        title={l10n('vendor.deleteTitle')}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              {l10n('vendor.cancel')}
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={onDeleteConfirm}
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
          onClose={onAddressDialogClose}
          title={l10n('vendor.manageAddresses')}
          size="large"
          footer={
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <AxButton 
                variant="secondary" 
                onClick={onAddressDialogClose}
              >
                {l10n('vendor.close')}
              </AxButton>
            </div>
          }
        >
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <VendorAddressAssociation 
              vendorId={addressDialogVendorId}
              onAddressesUpdated={onAddressesUpdated}
            />
          </div>
        </AxDialog>
      )}
    </PageContainer>
  );
}

