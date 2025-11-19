import {
  AxTable,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxListbox,
  ColumnDefinition,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { Order } from '../../api/orderApi';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
} from './AccountReceivableListingPage.styles';

const COMPONENT_NAME = 'AccountReceivableListingPage';

type ListingRenderContext = {
  getCustomerName: (customerId?: string) => string;
  formatDate: (dateString?: string) => string;
  calculateOutstandingAmount: (invoice: Order) => number;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
  onViewInvoice?: (orderId: string) => void;
};

const createColumns = (t: (key: string, params?: Record<string, string | number | undefined>) => string): ColumnDefinition<Order, ListingRenderContext>[] => [
  { 
    key: 'accountsReceivable.invoiceNumber',
    header: t('accountsReceivable.table.invoiceNumber'),
    align: undefined,
    render: (invoice: Order) => invoice.invoiceNumber || t('generalLedger.notAvailable')
  },
  { 
    key: 'accountsReceivable.orderNumber',
    header: t('accountsReceivable.table.orderNumber'),
    align: undefined,
    render: (invoice: Order) => invoice.orderNumber || invoice.id?.substring(0, 8) || t('generalLedger.notAvailable')
  },
  { 
    key: 'accountsReceivable.customer',
    header: t('accountsReceivable.customer'),
    align: undefined,
    render: (invoice: Order, context) => context?.getCustomerName(invoice.customerId) || t('generalLedger.notAvailable')
  },
  { 
    key: 'accountsReceivable.invoiceDate',
    header: t('accountsReceivable.table.invoiceDate'),
    align: undefined,
    render: (invoice: Order, context) => context?.formatDate(invoice.invoiceDate) || t('generalLedger.notAvailable')
  },
  { 
    key: 'accountsReceivable.dueDate',
    header: t('accountsReceivable.table.dueDate'),
    align: undefined,
    render: (invoice: Order, context) => context?.formatDate(invoice.invoiceDate) || t('generalLedger.notAvailable')
  },
  { 
    key: 'accountsReceivable.invoiceAmount',
    header: t('accountsReceivable.table.invoiceAmount'),
    align: 'right',
    render: (invoice: Order) => `$${(invoice.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'accountsReceivable.paidAmount',
    header: t('accountsReceivable.table.paidAmount'),
    align: 'right',
    render: (invoice: Order) => `$${((invoice.jsonData?.paymentAmount || 0).toFixed(2))}`
  },
  { 
    key: 'accountsReceivable.outstanding',
    header: t('accountsReceivable.outstanding'),
    align: 'right',
    render: (invoice: Order, context) => {
      const outstanding = context?.calculateOutstandingAmount(invoice) || 0;
      return (
        <span style={{ 
          color: outstanding > 0 ? 'var(--color-warning)' : 'var(--color-success)',
          fontWeight: outstanding > 0 ? 'var(--font-weight-bold)' : 'normal'
        }}>
          ${outstanding.toFixed(2)}
        </span>
      );
    }
  },
  { 
    key: 'accountsReceivable.status',
    header: t('accountsReceivable.table.status'),
    align: undefined,
    render: (invoice: Order, context) => (
      <span 
        style={{ 
          color: context?.getStatusColor(invoice.status) || 'var(--color-text-primary)', 
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: context?.getStatusBackgroundColor(invoice.status) || 'transparent',
          display: 'inline-block',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {context?.getStatusLabel(invoice.status) || invoice.status || t('generalLedger.notAvailable')}
      </span>
    )
  },
  { 
    key: 'accountsReceivable.actions',
    header: t('generalLedger.table.actions'),
    align: 'center',
    render: (invoice: Order, context) => {
      if (context?.onViewInvoice && invoice.id) {
        return (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onViewInvoice!(invoice.id!)}
            style={{ minWidth: '80px' }}
          >
            {t('accountsReceivable.table.view')}
          </AxButton>
        );
      }
      return null;
    }
  },
];

interface AccountReceivableListingPageRenderProps {
  invoices: Order[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredInvoices: Order[];
  onViewInvoice?: (orderId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  getCustomerName: (customerId?: string) => string;
  formatDate: (dateString?: string) => string;
  calculateOutstandingAmount: (invoice: Order) => number;
  getStatusColor: (status?: string) => string;
  getStatusBackgroundColor: (status?: string) => string;
  getStatusLabel: (status?: string) => string;
}

export function AccountReceivableListingPageRender(props: AccountReceivableListingPageRenderProps) {
  const {
    loading,
    error,
    statusFilter,
    filteredInvoices,
    onViewInvoice,
    onNavigateBack,
    onStatusFilterChange,
    getCustomerName,
    formatDate,
    calculateOutstandingAmount,
    getStatusColor,
    getStatusBackgroundColor,
    getStatusLabel,
  } = props;

  const { l10n } = useI18n();
  const columns = createColumns(l10n);
  const tableContext: ListingRenderContext = {
    getCustomerName,
    formatDate,
    calculateOutstandingAmount,
    getStatusColor,
    getStatusBackgroundColor,
    getStatusLabel,
    onViewInvoice,
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
                  {l10n('accountsReceivable.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('accountsReceivable.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('accountsReceivable.manageInvoices')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('accountsReceivable.loading')}</AxParagraph>
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
                  {l10n('accountsReceivable.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('accountsReceivable.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('accountsReceivable.manageInvoices')}
                </AxParagraph>
              </div>
            </HeaderLeft>
            <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            </HeaderRight>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">{l10n('accountsReceivable.error')}: {error}</AxParagraph>
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
                Account Receivable
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                View and manage invoices
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <div style={{ margin: 0, minWidth: '200px' }}>
              <AxListbox
                options={[
                  { value: '', label: l10n('accountsReceivable.filter.allStatuses') },
                  { value: 'INVOICED', label: l10n('accountsReceivable.filter.invoiced') },
                  { value: 'PAID', label: l10n('accountsReceivable.filter.paid') },
                ]}
                value={statusFilter || ''}
                onChange={(value: string | string[]) => onStatusFilterChange(Array.isArray(value) ? value[0] || null : value || null)}
                placeholder={l10n('accountsReceivable.filter.byStatus')}
              />
            </div>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredInvoices.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('accountsReceivable.noInvoices')}</AxParagraph>
            </div>
          ) : (
            <AxTable
              fullWidth
              stickyHeader
              data={filteredInvoices}
              columns={columns}
              context={tableContext}
              getRowKey={(invoice) => invoice.id || ''}
            />
          )}
        </div>
      </TableCard>
    </PageContainer>
  );
}

