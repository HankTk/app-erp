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
import { Order } from '../../api/orderApi';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './OrderListingPage.styles';
import { useI18n } from '../../i18n/I18nProvider';

const COMPONENT_NAME = 'OrderListingPage';

type ListingRenderContext = {
  getCustomerName: (customerId?: string) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
  onViewOrder?: (orderId: string) => void;
  onEditOrder?: (orderId: string) => void;
  onDeleteClick: (order: Order) => void;
};

const createColumns = (l10n: (key: string) => string): ColumnDefinition<Order, ListingRenderContext>[] => [
  { 
    key: 'order.orderNumber',
    header: l10n('order.table.orderNumber'),
    align: undefined,
    render: (order: Order) => order.orderNumber || order.id?.substring(0, 8) || 'N/A'
  },
  { 
    key: 'order.customer',
    header: l10n('order.table.customer'),
    align: undefined,
    render: (order: Order, context) => context?.getCustomerName(order.customerId) || 'N/A'
  },
  { 
    key: 'order.status',
    header: l10n('order.table.status'),
    align: undefined,
    render: (order: Order, context) => (
      <span 
        style={{ 
          color: context?.getStatusColor(order.status) || 'var(--color-text-primary)', 
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: context?.getStatusBackgroundColor(order.status) || 'transparent',
          display: 'inline-block',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {context?.getStatusLabel(order.status) || order.status || 'N/A'}
      </span>
    )
  },
  { 
    key: 'order.orderDate',
    header: l10n('order.table.orderDate'),
    align: undefined,
    render: (order: Order, context) => context?.formatDate(order.orderDate) || 'N/A'
  },
  { 
    key: 'order.shipDate',
    header: l10n('order.table.shipDate'),
    align: undefined,
    render: (order: Order, context) => context?.formatDate(order.shipDate) || 'N/A'
  },
  { 
    key: 'order.total',
    header: l10n('order.table.total'),
    align: 'right',
    render: (order: Order) => `$${(order.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'order.items',
    header: l10n('order.table.items'),
    align: 'center',
    render: (order: Order) => order.items?.length || 0
  },
  { 
    key: 'order.actions',
    header: l10n('order.table.actions'),
    align: 'center',
    render: (order: Order, context) => (
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'center' }}>
        {context?.onViewOrder && (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onViewOrder!(order.id!)}
            style={{ minWidth: '80px' }}
          >
            {l10n('order.actions.view')}
          </AxButton>
        )}
        {context?.onEditOrder && (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onEditOrder!(order.id!)}
            disabled={order.status === 'PAID' || order.status === 'CANCELLED'}
            style={{ minWidth: '80px' }}
          >
            {l10n('order.actions.edit')}
          </AxButton>
        )}
        <AxButton 
          variant="danger" 
          size="small"
          onClick={() => context?.onDeleteClick(order)}
          disabled={order.status === 'PAID' || order.status === 'CANCELLED'}
          style={{ minWidth: '80px' }}
        >
          {l10n('order.actions.delete')}
        </AxButton>
      </div>
    )
  },
];

interface OrderListingPageRenderProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredOrders: Order[];
  deleteDialogOpen: boolean;
  submitting: boolean;
  selectedOrder: Order | null;
  onNavigateToOrderEntry?: () => void;
  onEditOrder?: (orderId: string) => void;
  onViewOrder?: (orderId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  onDeleteClick: (order: Order) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  getCustomerName: (customerId?: string) => string;
  formatDate: (dateString?: string) => string;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
}

export function OrderListingPageRender(props: OrderListingPageRenderProps) {
  const {
    orders,
    loading,
    error,
    statusFilter,
    filteredOrders,
    deleteDialogOpen,
    submitting,
    selectedOrder,
    onNavigateToOrderEntry,
    onEditOrder,
    onViewOrder,
    onNavigateBack,
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
    onViewOrder,
    onEditOrder,
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
                  ← Back
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  Orders
                </AxHeading3>
                <AxParagraph color="secondary">
                  View and manage all orders
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('order.loading')}</AxParagraph>
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
                  {l10n('order.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('order.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('order.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">{l10n('order.error')}: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={() => window.location.reload()}>
              {l10n('order.retry')}
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
                {l10n('order.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('order.title')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('order.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <div style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={[
                  { value: '', label: l10n('order.filter.allStatuses') },
                  { value: 'DRAFT', label: l10n('order.status.draft') },
                  { value: 'PENDING_APPROVAL', label: l10n('order.status.pendingApproval') },
                  { value: 'APPROVED', label: l10n('order.status.approved') },
                  { value: 'SHIPPING_INSTRUCTED', label: l10n('order.status.shippingInstructed') },
                  { value: 'SHIPPED', label: l10n('order.status.shipped') },
                  { value: 'INVOICED', label: l10n('order.status.invoiced') },
                  { value: 'PAID', label: l10n('order.status.paid') },
                  { value: 'CANCELLED', label: l10n('order.status.cancelled') },
                ]}
                value={statusFilter || ''}
                onChange={(value: string | string[]) => onStatusFilterChange(Array.isArray(value) ? value[0] || null : value || null)}
                placeholder={l10n('order.filter.byStatus')}
              />
            </div>
            {onNavigateToOrderEntry && (
              <AxButton variant="primary" onClick={onNavigateToOrderEntry}>
                {l10n('order.create')}
              </AxButton>
            )}
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredOrders.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('order.noOrders')}</AxParagraph>
            </div>
          ) : (
            <AxTable
              fullWidth
              stickyHeader
              data={filteredOrders}
              columns={columns}
              context={tableContext}
              getRowKey={(order) => order.id || ''}
            />
          )}
        </div>
      </TableCard>

      {/* Delete Confirmation Dialog */}
      <AxDialog
        open={deleteDialogOpen}
        onClose={onDeleteCancel}
        title={l10n('order.dialog.deleteTitle')}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
            <AxButton 
              variant="secondary" 
              onClick={onDeleteCancel}
              disabled={submitting}
            >
              {l10n('order.dialog.cancel')}
            </AxButton>
            <AxButton 
              variant="danger" 
              onClick={onDeleteConfirm}
              disabled={submitting}
            >
              {submitting ? l10n('order.dialog.deleting') : l10n('order.dialog.delete')}
            </AxButton>
          </div>
        }
      >
        <AxParagraph marginBottom="md">
          {l10n('order.dialog.deleteConfirm')}
        </AxParagraph>
        <AxParagraph color="secondary" size="sm">
          {l10n('order.dialog.deleteWarning')}
        </AxParagraph>
      </AxDialog>
    </PageContainer>
  );
}

