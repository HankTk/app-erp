import {
  AxTable,
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxDialog,
  AxFormGroup,
  AxListbox,
  ColumnDefinition,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { RMA } from '../../api/rmaApi';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './RMAListingPage.styles';

const COMPONENT_NAME = 'RMAListingPage';

type ListingRenderContext = {
  getCustomerName: (rma: RMA) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
  onViewRMA?: (rmaId: string) => void;
  onEditRMA?: (rmaId: string) => void;
  onDeleteClick: (rma: RMA) => void;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
};

const createColumns = (t: (key: string, params?: Record<string, string | number | undefined>) => string): ColumnDefinition<RMA, ListingRenderContext>[] => [
  { 
    key: 'rma.rmaNumber',
    header: t('rma.table.rmaNumber'),
    align: undefined,
    render: (rma: RMA) => rma.rmaNumber || rma.id?.substring(0, 8) || t('generalLedger.notAvailable')
  },
  { 
    key: 'rma.orderNumber',
    header: t('rma.table.orderNumber'),
    align: undefined,
    render: (rma: RMA) => rma.orderNumber || t('generalLedger.notAvailable')
  },
  { 
    key: 'rma.customer',
    header: t('rma.table.customer'),
    align: undefined,
    render: (rma: RMA, context) => context?.getCustomerName(rma) || t('generalLedger.notAvailable')
  },
  { 
    key: 'rma.status',
    header: t('rma.table.status'),
    align: undefined,
    render: (rma: RMA, context) => (
      <span 
        style={{ 
          color: context?.getStatusColor(rma.status) || 'var(--color-text-primary)', 
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: context?.getStatusBackgroundColor(rma.status) || 'transparent',
          display: 'inline-block',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {context?.getStatusLabel(rma.status) || rma.status || t('generalLedger.notAvailable')}
      </span>
    )
  },
  { 
    key: 'rma.rmaDate',
    header: t('rma.table.rmaDate'),
    align: undefined,
    render: (rma: RMA, context) => context?.formatDate(rma.rmaDate) || t('generalLedger.notAvailable')
  },
  { 
    key: 'rma.receivedDate',
    header: t('rma.table.receivedDate'),
    align: undefined,
    render: (rma: RMA, context) => context?.formatDate(rma.receivedDate) || t('generalLedger.notAvailable')
  },
  { 
    key: 'rma.total',
    header: t('rma.table.total'),
    align: 'right',
    render: (rma: RMA) => `$${(rma.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'rma.items',
    header: t('rma.table.items'),
    align: 'center',
    render: (rma: RMA) => rma.items?.length || 0
  },
  { 
    key: 'rma.actions',
    header: t('generalLedger.table.actions'),
    align: 'center',
    render: (rma: RMA, context) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center', flexWrap: 'wrap' }}>
        {context?.onViewRMA && (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onViewRMA!(rma.id!)}
            style={{ minWidth: '80px' }}
          >
            {t('rma.table.view')}
          </AxButton>
        )}
        {context?.onEditRMA && (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onEditRMA!(rma.id!)}
            disabled={rma.status === 'PROCESSED' || rma.status === 'CANCELLED'}
            style={{ minWidth: '80px' }}
          >
            {t('rma.table.edit')}
          </AxButton>
        )}
        {rma.id && context?.onNavigateToShopFloorControl && (
          <AxButton 
            variant="primary" 
            size="small"
            onClick={() => context.onNavigateToShopFloorControl!(rma.id!)}
            style={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
          >
            {t('rma.table.shopFloor')}
          </AxButton>
        )}
        <AxButton 
          variant="danger" 
          size="small"
          onClick={() => context?.onDeleteClick(rma)}
          style={{ minWidth: '80px' }}
        >
          {t('rma.table.delete')}
        </AxButton>
      </div>
    )
  },
];

interface RMAListingPageRenderProps {
  rmas: RMA[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredRMAs: RMA[];
  deleteDialogOpen: boolean;
  submitting: boolean;
  selectedRMA: RMA | null;
  onNavigateToRMAEntry?: () => void;
  onEditRMA?: (rmaId: string) => void;
  onViewRMA?: (rmaId: string) => void;
  onNavigateBack?: () => void;
  onNavigateToShopFloorControl?: (rmaId: string) => void;
  onStatusFilterChange: (value: string | null) => void;
  onDeleteClick: (rma: RMA) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  getCustomerName: (rma: RMA) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
}

export function RMAListingPageRender(props: RMAListingPageRenderProps) {
  const {
    rmas,
    loading,
    error,
    statusFilter,
    filteredRMAs,
    deleteDialogOpen,
    submitting,
    selectedRMA,
    onNavigateToRMAEntry,
    onEditRMA,
    onViewRMA,
    onNavigateBack,
    onNavigateToShopFloorControl,
    onStatusFilterChange,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteCancel,
    getCustomerName,
    formatDate,
    getStatusColor,
    getStatusBackgroundColor,
    getStatusLabel,
  } = props;

  const { l10n } = useI18n();
  const columns = createColumns(l10n);
  const tableContext: ListingRenderContext = {
    getCustomerName,
    formatDate,
    getStatusColor,
    getStatusBackgroundColor,
    getStatusLabel,
    onViewRMA,
    onEditRMA,
    onDeleteClick,
    onNavigateToShopFloorControl,
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
                  {l10n('rma.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('rma.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('rma.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('rma.loading')}</AxParagraph>
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
                  {l10n('rma.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('rma.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('rma.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">{l10n('rma.error')}: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={() => window.location.reload()}>
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
                RMAs
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                View and manage all return merchandise authorizations
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={[
                  { value: null, label: l10n('rma.filter.allStatuses') },
                  { value: 'DRAFT', label: l10n('rma.status.draft') },
                  { value: 'PENDING_APPROVAL', label: l10n('rma.status.pendingApproval') },
                  { value: 'APPROVED', label: l10n('rma.status.approved') },
                  { value: 'RECEIVED', label: l10n('rma.status.received') },
                  { value: 'PROCESSED', label: l10n('rma.status.processed') },
                  { value: 'CANCELLED', label: l10n('rma.status.cancelled') },
                ]}
                value={statusFilter}
                onChange={(value) => onStatusFilterChange(value)}
                placeholder={l10n('rma.filter.byStatus')}
              />
            </AxFormGroup>
            {onNavigateToRMAEntry && (
              <AxButton variant="primary" onClick={onNavigateToRMAEntry}>
                {l10n('rma.createRMA')}
              </AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredRMAs.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('rma.noRMAs')}</AxParagraph>
            </div>
          ) : (
            <AxTable
              fullWidth
              stickyHeader
              data={filteredRMAs}
              columns={columns}
              context={tableContext}
              getRowKey={(rma) => rma.id || ''}
            />
          )}
        </div>
      </TableCard>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        title={l10n('rma.deleteTitle')}
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
              {submitting ? l10n('rma.deleting') : l10n('common.delete')}
            </AxButton>
          </div>
        }
      >
        <AxParagraph marginBottom="md">
          {l10n('rma.deleteConfirm')}
        </AxParagraph>
        <AxParagraph color="secondary" size="sm">
          {l10n('rma.deleteWarning')}
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

