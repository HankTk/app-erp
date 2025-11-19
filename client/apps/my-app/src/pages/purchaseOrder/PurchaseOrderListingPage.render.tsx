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
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import { PurchaseOrder } from '../../api/purchaseOrderApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './PurchaseOrderListingPage.styles';

const COMPONENT_NAME = 'PurchaseOrderListingPage';

type ListingRenderContext = {
  getSupplierName: (supplierId?: string) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
  onViewPO?: (poId: string) => void;
  onEditPO?: (poId: string) => void;
  onDeleteClick: (po: PurchaseOrder) => void;
  l10n: (key: string) => string;
};

const createColumns = (l10n: (key: string) => string): ColumnDefinition<PurchaseOrder, ListingRenderContext>[] => [
  { 
    key: 'purchaseOrder.orderNumber',
    header: l10n('purchaseOrder.orderNumber'),
    align: undefined,
    render: (po: PurchaseOrder) => po.orderNumber || po.id?.substring(0, 8) || 'N/A'
  },
  { 
    key: 'purchaseOrder.supplier',
    header: l10n('purchaseOrder.supplier'),
    align: undefined,
    render: (po: PurchaseOrder, context) => context?.getSupplierName(po.supplierId) || 'N/A'
  },
  { 
    key: 'purchaseOrder.status',
    header: l10n('purchaseOrder.status'),
    align: undefined,
    render: (po: PurchaseOrder, context) => (
      <span 
        style={{ 
          color: context?.getStatusColor(po.status) || 'var(--color-text-primary)', 
          fontWeight: 600,
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: (context?.getStatusColor(po.status) || 'var(--color-text-primary)') + '20',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {context?.getStatusLabel(po.status) || po.status || 'N/A'}
      </span>
    )
  },
  { 
    key: 'purchaseOrder.orderDate',
    header: l10n('purchaseOrder.orderDate'),
    align: undefined,
    render: (po: PurchaseOrder, context) => context?.formatDate(po.orderDate) || 'N/A'
  },
  { 
    key: 'purchaseOrder.expectedDeliveryDate',
    header: l10n('purchaseOrder.expectedDeliveryDate'),
    align: undefined,
    render: (po: PurchaseOrder, context) => context?.formatDate(po.expectedDeliveryDate) || 'N/A'
  },
  { 
    key: 'purchaseOrder.total',
    header: l10n('purchaseOrder.total'),
    align: 'right',
    render: (po: PurchaseOrder) => `$${(po.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'purchaseOrder.actions',
    header: l10n('purchaseOrder.actions'),
    align: 'center',
    render: (po: PurchaseOrder, context) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
        {context?.onViewPO && (
          <AxButton variant="secondary" size="small" onClick={() => context.onViewPO!(po.id!)}>
            {context.l10n('purchaseOrder.view')}
          </AxButton>
        )}
        {context?.onEditPO && (
          <AxButton variant="secondary" size="small" onClick={() => context.onEditPO!(po.id!)}>
            {context.l10n('purchaseOrder.edit')}
          </AxButton>
        )}
        <AxButton variant="danger" size="small" onClick={() => context?.onDeleteClick(po)}>
          {context?.l10n('purchaseOrder.delete')}
        </AxButton>
      </div>
    )
  },
];

interface PurchaseOrderListingPageRenderProps {
  pos: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredPOs: PurchaseOrder[];
  deleteDialogOpen: boolean;
  submitting: boolean;
  selectedPO: PurchaseOrder | null;
  statusOptions: Array<{ value: string; label: string }>;
  onNavigateToPOEntry?: () => void;
  onEditPO?: (poId: string) => void;
  onViewPO?: (poId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  onDeleteClick: (po: PurchaseOrder) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  getSupplierName: (supplierId?: string) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
}

export function PurchaseOrderListingPageRender(props: PurchaseOrderListingPageRenderProps) {
  const {
    pos,
    loading,
    error,
    statusFilter,
    filteredPOs,
    deleteDialogOpen,
    submitting,
    selectedPO,
    statusOptions,
    onNavigateToPOEntry,
    onEditPO,
    onViewPO,
    onNavigateBack,
    onStatusFilterChange,
    onDeleteClick,
    onDeleteConfirm,
    onDeleteCancel,
    getSupplierName,
    formatDate,
    getStatusColor,
    getStatusLabel,
  } = props;
  
  const { l10n } = useI18n();
  const columns = createColumns(l10n);
  const tableContext: ListingRenderContext = {
    getSupplierName,
    formatDate,
    getStatusColor,
    getStatusLabel,
    onViewPO,
    onEditPO,
    onDeleteClick,
    l10n,
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
                  {l10n('purchaseOrder.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('module.purchaseOrder')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('purchaseOrder.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('purchaseOrder.loading')}</AxParagraph>
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
                  {l10n('purchaseOrder.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('module.purchaseOrder')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('purchaseOrder.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">{l10n('purchaseOrder.error')}: {error}</AxParagraph>
            {error.includes('404') && (
              <AxParagraph color="secondary" size="sm" textAlign="center">
                {l10n('purchaseOrder.error.serverRestart')}
              </AxParagraph>
            )}
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
                {l10n('purchaseOrder.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('module.purchaseOrder')}
              </AxHeading3>
              <AxParagraph color="secondary">
                {l10n('purchaseOrder.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                value={statusFilter}
                onChange={(value: string | null) => onStatusFilterChange(value)}
                options={statusOptions}
                placeholder={l10n('purchaseOrder.filter.placeholder')}
              />
            </AxFormGroup>
            {onNavigateToPOEntry && (
              <AxButton variant="primary" onClick={onNavigateToPOEntry}>
                {l10n('purchaseOrder.createOrder')}
              </AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        {filteredPOs.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('purchaseOrder.noData')}</AxParagraph>
          </div>
        ) : (
          <AxTable
            fullWidth
            stickyHeader
            data={filteredPOs}
            columns={columns}
            context={tableContext}
            getRowKey={(po) => po.id || ''}
          />
        )}
      </TableCard>

      <AxDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        title={l10n('purchaseOrder.deleteConfirm')}
      >
        <AxParagraph>{l10n('purchaseOrder.deleteMessage')}</AxParagraph>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end', marginTop: 'var(--spacing-lg)' }}>
          <AxButton
            variant="secondary"
            onClick={onDeleteCancel}
          >
            {l10n('purchaseOrder.cancel')}
          </AxButton>
          <AxButton variant="danger" onClick={onDeleteConfirm} disabled={submitting}>
            {submitting ? l10n('purchaseOrder.deleting') : l10n('purchaseOrder.confirm')}
          </AxButton>
        </div>
      </AxDialog>
    </PageContainer>
  );
}

