import {
  AxTable,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxInput,
  AxLabel,
  AxFormGroup,
  ColumnDefinition,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { Customer } from '../../api/customerApi';
import { Address } from '../../api/addressApi';
import { CustomerAddressAssociation } from '../../components/CustomerAddressAssociation';
import { useI18n } from '../../i18n/I18nProvider';
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
  getCustomerAddresses: (customerId: string | undefined) => Address[];
  formatAddress: (address: Address) => string;
};

const createColumns = (t: (key: string, params?: Record<string, string | number | undefined>) => string): ColumnDefinition<Customer, ListingRenderContext>[] => [
  { 
    key: 'customer.customerNumber',
    header: t('customerListing.table.customerNumber'),
    align: undefined,
    render: (customer: Customer) => customer.customerNumber || ''
  },
  { 
    key: 'customer.companyName',
    header: t('customerListing.table.companyName'),
    align: undefined,
    render: (customer: Customer) => customer.companyName || ''
  },
  { 
    key: 'customer.firstName',
    header: t('customerListing.table.firstName'),
    align: undefined,
    render: (customer: Customer) => customer.firstName || ''
  },
  { 
    key: 'customer.lastName',
    header: t('customerListing.table.lastName'),
    align: undefined,
    render: (customer: Customer) => customer.lastName || ''
  },
  { 
    key: 'customer.email',
    header: t('customerListing.table.email'),
    align: undefined,
    render: (customer: Customer) => customer.email || ''
  },
  { 
    key: 'customer.phone',
    header: t('customerListing.table.phone'),
    align: undefined,
    render: (customer: Customer) => customer.phone || ''
  },
  { 
    key: 'customer.actions',
    header: t('generalLedger.table.actions'),
    align: 'center',
    render: (customer: Customer, context) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
        <AxButton 
          variant="secondary" 
          size="small"
          onClick={() => context?.onEdit(customer)}
          style={{ minWidth: '80px' }}
        >
          {t('customerListing.table.edit')}
        </AxButton>
        <AxButton 
          variant="danger" 
          size="small"
          onClick={() => context?.onDeleteClick(customer)}
          style={{ minWidth: '80px' }}
        >
          {t('common.delete')}
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

  const { l10n } = useI18n();
  const columns = createColumns(l10n);
  const tableContext: ListingRenderContext = {
    onEdit,
    onDeleteClick,
    getCustomerAddresses,
    formatAddress,
  };

  const renderExpandedRow = (customer: Customer, context?: ListingRenderContext) => {
    const customerAddresses = context?.getCustomerAddresses(customer.id) || [];
    if (customerAddresses.length === 0) {
      return null;
    }
    return (
      <div style={{ paddingLeft: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
        <strong style={{ color: 'var(--color-text-primary)', marginRight: 'var(--spacing-sm)' }}>{l10n('customerListing.expandedRow.addresses')}</strong>
        {customerAddresses.map((addr, index) => (
          <span key={addr.id}>
            {index > 0 && <span style={{ margin: '0 var(--spacing-xs)' }}>|</span>}
            <span style={{ marginRight: 'var(--spacing-xs)' }}>
              {addr.addressType ? `[${addr.addressType}]` : '[Both]'} {context?.formatAddress(addr)}
            </span>
          </span>
        ))}
      </div>
    );
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
                  {l10n('customerListing.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('customerListing.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('customerListing.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>{l10n('customerListing.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('customerListing.loading')}</AxParagraph>
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
                  {l10n('customerListing.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('customerListing.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('customerListing.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>{l10n('customerListing.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">{l10n('customerListing.error')}: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={onRetry}>
              {l10n('common.retry')}
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
        {customers.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('customerListing.noCustomers')}</AxParagraph>
          </div>
        ) : (
          <AxTable
            fullWidth
            stickyHeader
            data={customers}
            columns={columns}
            context={tableContext}
            getRowKey={(customer) => customer.id || ''}
            renderExpandedRow={renderExpandedRow}
          />
        )}
      </TableCard>

      {/* Add/Edit Customer Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={onDialogClose}
        title={dialogMode === 'add' ? l10n('customerListing.dialog.addTitle') : l10n('customerListing.dialog.editTitle')}
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
                  {l10n('customerListing.dialog.manageAddresses')}
                </AxButton>
              )}
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <AxButton 
                variant="secondary" 
                onClick={onDialogClose}
                disabled={submitting}
              >
                {l10n('common.cancel')}
              </AxButton>
              <AxButton 
                variant="primary" 
                onClick={onSave}
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
            <AxLabel>{l10n('customerListing.form.customerNumber')}</AxLabel>
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
            <AxLabel>{l10n('customerListing.form.companyName')}</AxLabel>
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
            <AxLabel>{l10n('customerListing.form.firstName')}</AxLabel>
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
            <AxLabel>{l10n('customerListing.form.lastName')}</AxLabel>
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
            <AxLabel>{l10n('customerListing.form.email')}</AxLabel>
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
            <AxLabel>{l10n('customerListing.form.phone')}</AxLabel>
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
              <AxLabel>{l10n('customerListing.form.associatedAddresses')}</AxLabel>
              <div style={{ marginTop: 'var(--spacing-xs)' }}>
                {(() => {
                  const customerAddresses = getCustomerAddresses(selectedCustomer.id);
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
                            {addr.addressType ? 
                              (addr.addressType === 'SHIPPING' ? l10n('customer.addressType.shipping') :
                               addr.addressType === 'BILLING' ? l10n('customer.addressType.billing') :
                               l10n('customer.addressType.both')) :
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
          )}
        </div>
      </AxDialog>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        title={l10n('customerListing.dialog.deleteTitle')}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              {l10n('common.cancel')}
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={onDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? l10n('common.deleting') : l10n('common.delete')}
            </AxButton>
          </div>
        }
      >
        <AxParagraph marginBottom="md">
          {l10n('customerListing.dialog.deleteConfirm')}
        </AxParagraph>
        <AxParagraph color="secondary" size="sm">
          {l10n('customerListing.dialog.deleteWarning')}
        </AxParagraph>
      </AxDialog>

      {/* Address Management Dialog */}
      {showAddressDialog && addressDialogCustomerId && (
        <AxDialog
          open={showAddressDialog}
          onClose={onAddressDialogClose}
          title={l10n('customerListing.dialog.manageAddresses')}
          size="large"
          footer={
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <AxButton 
                variant="secondary" 
                onClick={onAddressDialogClose}
              >
                {l10n('customer.close')}
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

