import {
  AxTable,
  AxCard,
  AxParagraph,
  AxButton,
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
  BackButton,
  HeaderTitleContainer,
  HeadingWithMargin,
  ParagraphSecondary,
  ParagraphDanger,
  TableContainer,
  LoadingContainer,
  StatusBadge,
} from './AccountPayableListingPage.styles';

const COMPONENT_NAME = 'AccountPayableListingPage';

type ListingRenderContext = {
  getSupplierName: (supplierId?: string) => string;
  formatDate: (dateString?: string) => string;
  calculateOutstandingAmount: (invoice: PurchaseOrder) => number;
  l10n: (key: string) => string;
  onViewInvoice?: (prId: string) => void;
};

const createColumns = (l10n: (key: string) => string): ColumnDefinition<PurchaseOrder, ListingRenderContext>[] => [
  { 
    key: 'accountsPayable.invoiceNumber',
    header: l10n('accountsPayable.invoiceNumber'),
    align: undefined,
    render: (invoice: PurchaseOrder) => invoice.invoiceNumber || l10n('generalLedger.notAvailable')
  },
  { 
    key: 'accountsPayable.orderNumber',
    header: l10n('accountsPayable.orderNumber'),
    align: undefined,
    render: (invoice: PurchaseOrder) => invoice.orderNumber || invoice.id?.substring(0, 8) || l10n('generalLedger.notAvailable')
  },
  { 
    key: 'accountsPayable.supplier',
    header: l10n('accountsPayable.supplier'),
    align: undefined,
    render: (invoice: PurchaseOrder, context) => context?.getSupplierName(invoice.supplierId) || l10n('generalLedger.notAvailable')
  },
  { 
    key: 'accountsPayable.invoiceDate',
    header: l10n('accountsPayable.invoiceDate'),
    align: undefined,
    render: (invoice: PurchaseOrder, context) => context?.formatDate(invoice.invoiceDate) || l10n('generalLedger.notAvailable')
  },
  { 
    key: 'accountsPayable.dueDate',
    header: l10n('accountsPayable.dueDate'),
    align: undefined,
    render: (invoice: PurchaseOrder, context) => context?.formatDate(invoice.invoiceDate) || l10n('generalLedger.notAvailable')
  },
  { 
    key: 'accountsPayable.total',
    header: l10n('accountsPayable.total'),
    align: 'right',
    render: (invoice: PurchaseOrder) => `$${(invoice.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'accountsPayable.paid',
    header: l10n('accountsPayable.paid'),
    align: 'right',
    render: (invoice: PurchaseOrder) => `$${((invoice.jsonData?.paymentAmount || 0).toFixed(2))}`
  },
  { 
    key: 'accountsPayable.outstanding',
    header: l10n('accountsPayable.outstanding'),
    align: 'right',
    render: (invoice: PurchaseOrder, context) => {
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
    key: 'accountsPayable.status',
    header: l10n('accountsPayable.status'),
    align: undefined,
    render: (invoice: PurchaseOrder, context) => (
      <StatusBadge $status={invoice.status as 'PAID' | 'INVOICED'}>
        {invoice.status === 'PAID' ? context?.l10n('accountsPayable.status.paid') : context?.l10n('accountsPayable.status.invoiced')}
      </StatusBadge>
    )
  },
  { 
    key: 'accountsPayable.actions',
    header: l10n('accountsPayable.actions'),
    align: undefined,
    render: (invoice: PurchaseOrder, context) => {
      if (context?.onViewInvoice && invoice.id) {
        return (
          <AxButton variant="secondary" size="small" onClick={() => context.onViewInvoice!(invoice.id!)}>
            {context.l10n('accountsPayable.view')}
          </AxButton>
        );
      }
      return null;
    }
  },
];

interface AccountPayableListingPageRenderProps {
  invoices: PurchaseOrder[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  filteredInvoices: PurchaseOrder[];
  onViewInvoice?: (prId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  getSupplierName: (supplierId?: string) => string;
  formatDate: (dateString?: string) => string;
  calculateOutstandingAmount: (invoice: PurchaseOrder) => number;
}

export function AccountPayableListingPageRender(props: AccountPayableListingPageRenderProps) {
  const {
    loading,
    error,
    statusFilter,
    filteredInvoices,
    onViewInvoice,
    onNavigateBack,
    onStatusFilterChange,
    getSupplierName,
    formatDate,
    calculateOutstandingAmount,
  } = props;
  
  const { l10n } = useI18n();
  const columns = createColumns(l10n);
  const tableContext: ListingRenderContext = {
    getSupplierName,
    formatDate,
    calculateOutstandingAmount,
    l10n,
    onViewInvoice,
  };

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <BackButton 
                variant="secondary" 
                onClick={onNavigateBack}
              >
                {l10n('accountsPayable.back')}
              </BackButton>
            )}
            <HeaderTitleContainer>
              <HeadingWithMargin>
                {l10n('module.accountsPayable')}
              </HeadingWithMargin>
              <ParagraphSecondary>
                {l10n('accountsPayable.subtitle')}
              </ParagraphSecondary>
            </HeaderTitleContainer>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <div style={{ margin: 0 }}>
              <AxListbox
                value={statusFilter || ''}
                onChange={(value: string | string[]) => onStatusFilterChange(Array.isArray(value) ? value[0] || null : value || null)}
                options={[
                  { value: '', label: l10n('accountsPayable.filter.all') },
                  { value: 'INVOICED', label: l10n('accountsPayable.status.invoiced') },
                  { value: 'PAID', label: l10n('accountsPayable.status.paid') },
                ]}
                placeholder={l10n('accountsPayable.filter.placeholder')}
              />
            </div>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      {error && (
        <AxCard padding="large">
          <ParagraphDanger>{error}</ParagraphDanger>
        </AxCard>
      )}

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <TableContainer>
          {loading ? (
            <LoadingContainer>
              <AxParagraph>{l10n('accountsPayable.loading')}</AxParagraph>
            </LoadingContainer>
          ) : filteredInvoices.length === 0 ? (
            <LoadingContainer>
              <AxParagraph>{l10n('accountsPayable.noData')}</AxParagraph>
            </LoadingContainer>
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
        </TableContainer>
      </TableCard>
    </PageContainer>
  );
}

