import {
  AxTable,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxInput,
  AxLabel,
  AxFormGroup,
  AxListbox,
  ColumnDefinition,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { Address } from '../../api/addressApi';
import { useI18n } from '../../i18n/I18nProvider';
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

type ListingRenderContext = {
  onEdit: (address: Address) => void;
  onDeleteClick: (address: Address) => void;
};

const createColumns = (t: (key: string, params?: Record<string, string | number | undefined>) => string): ColumnDefinition<Address, ListingRenderContext>[] => [
  { 
    key: 'address.type',
    header: t('addressListing.table.type'),
    align: undefined,
    render: (address: Address) => address.addressType 
      ? address.addressType 
      : <span style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{t('customer.addressType.both')}</span>
  },
  { 
    key: 'address.streetAddress',
    header: t('addressListing.table.streetAddress'),
    align: undefined,
    render: (address: Address) => address.streetAddress1 || ''
  },
  { 
    key: 'address.city',
    header: t('addressListing.table.city'),
    align: undefined,
    render: (address: Address) => address.city || ''
  },
  { 
    key: 'address.state',
    header: t('addressListing.table.state'),
    align: undefined,
    render: (address: Address) => address.state || ''
  },
  { 
    key: 'address.postalCode',
    header: t('addressListing.table.postalCode'),
    align: undefined,
    render: (address: Address) => address.postalCode || ''
  },
  { 
    key: 'address.country',
    header: t('addressListing.table.country'),
    align: undefined,
    render: (address: Address) => address.country || ''
  },
  { 
    key: 'address.actions',
    header: t('generalLedger.table.actions'),
    align: 'center',
    render: (address: Address, context) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
        <AxButton 
          variant="secondary" 
          size="small"
          onClick={() => context?.onEdit(address)}
          style={{ minWidth: '80px' }}
        >
          {t('addressListing.table.edit')}
        </AxButton>
        <AxButton 
          variant="danger" 
          size="small"
          onClick={() => context?.onDeleteClick(address)}
          style={{ minWidth: '80px' }}
        >
          {t('common.delete')}
        </AxButton>
      </div>
    )
  },
];

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

  const { l10n } = useI18n();
  const columns = createColumns(l10n);
  const tableContext: ListingRenderContext = {
    onEdit,
    onDeleteClick,
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
                  {l10n('master.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('addressListing.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('addressListing.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>{l10n('addressListing.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('addressListing.loading')}</AxParagraph>
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
                  {l10n('master.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('addressListing.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('addressListing.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
              <AxButton variant="primary" onClick={onAdd}>{l10n('addressListing.addNew')}</AxButton>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">{l10n('addressListing.error')}: {error}</AxParagraph>
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
                Addresses
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Manage shipping and billing addresses
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxButton variant="primary" onClick={onAdd}>{l10n('addressListing.addNew')}</AxButton>
            {onClose && (
              <AxButton variant="secondary" onClick={onClose}>{l10n('addressListing.close')}</AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
          {filteredAddresses.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('addressListing.noAddresses')}</AxParagraph>
            </div>
          ) : (
            <AxTable
              fullWidth
              stickyHeader
              data={filteredAddresses}
              columns={columns}
              context={tableContext}
              getRowKey={(address) => address.id || ''}
            />
          )}
        </div>
      </TableCard>

      {/* Add/Edit Address Dialog */}
      <AxDialog
        open={dialogMode !== null}
        onClose={onDialogClose}
        title={dialogMode === 'add' ? l10n('addressListing.dialog.addTitle') : l10n('addressListing.dialog.editTitle')}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
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
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          <AxFormGroup>
            <AxLabel>{l10n('address.addressType')}</AxLabel>
            <AxListbox
              options={[
                { value: null, label: l10n('customer.addressType.both') },
                { value: 'SHIPPING', label: l10n('customer.addressType.shipping') },
                { value: 'BILLING', label: l10n('customer.addressType.billing') },
              ]}
              value={formData.addressType || null}
              onChange={(value) => {
                onFormDataChange({ ...formData, addressType: value as 'SHIPPING' | 'BILLING' | null | undefined });
              }}
              placeholder={l10n('address.addressTypePlaceholder')}
              fullWidth
              disabled={submitting}
            />
            <AxParagraph marginTop="xs" color="secondary" size="sm">
              {l10n('address.addressTypeDescription')}
            </AxParagraph>
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('address.streetAddress1')}</AxLabel>
            <AxInput
              type="text"
              value={formData.streetAddress1 || ''}
              onChange={(e) => onFormDataChange({ ...formData, streetAddress1: e.target.value })}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder={l10n('address.streetAddress1Placeholder')}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel>{l10n('address.streetAddress2')}</AxLabel>
            <AxInput
              type="text"
              value={formData.streetAddress2 || ''}
              onChange={(e) => onFormDataChange({ ...formData, streetAddress2: e.target.value })}
              style={{ marginTop: 'var(--spacing-xs)' }}
              disabled={submitting}
              fullWidth
              placeholder={l10n('address.streetAddress2Placeholder')}
            />
          </AxFormGroup>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <AxFormGroup>
              <AxLabel>{l10n('address.city')}</AxLabel>
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
              <AxLabel>{l10n('address.state')}</AxLabel>
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
              <AxLabel>{l10n('address.postalCode')}</AxLabel>
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
              <AxLabel>{l10n('address.country')}</AxLabel>
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
        title={l10n('addressListing.dialog.deleteTitle')}
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
          {l10n('addressListing.dialog.deleteConfirm')}
        </AxParagraph>
        <AxParagraph color="secondary" size="sm">
          {l10n('addressListing.dialog.deleteWarning')}
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

