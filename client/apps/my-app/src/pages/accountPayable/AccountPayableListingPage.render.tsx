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
  AxFormGroup,
  AxListbox,
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
  FormGroupNoMargin,
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

const LISTING_TABLE_COLUMNS = [
  { 
    key: 'accountsPayable.invoiceNumber',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: PurchaseOrder, context: ListingRenderContext) => invoice.invoiceNumber || 'N/A'
  },
  { 
    key: 'accountsPayable.orderNumber',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: PurchaseOrder, context: ListingRenderContext) => invoice.orderNumber || invoice.id?.substring(0, 8) || 'N/A'
  },
  { 
    key: 'accountsPayable.supplier',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: PurchaseOrder, context: ListingRenderContext) => context.getSupplierName(invoice.supplierId)
  },
  { 
    key: 'accountsPayable.invoiceDate',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: PurchaseOrder, context: ListingRenderContext) => context.formatDate(invoice.invoiceDate)
  },
  { 
    key: 'accountsPayable.dueDate',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: PurchaseOrder, context: ListingRenderContext) => context.formatDate(invoice.invoiceDate)
  },
  { 
    key: 'accountsPayable.total',
    align: 'right' as const,
    render: (invoice: PurchaseOrder) => `$${(invoice.total?.toFixed(2) || '0.00')}`
  },
  { 
    key: 'accountsPayable.paid',
    align: 'right' as const,
    render: (invoice: PurchaseOrder) => `$${((invoice.jsonData?.paymentAmount || 0).toFixed(2))}`
  },
  { 
    key: 'accountsPayable.outstanding',
    align: 'right' as const,
    render: (invoice: PurchaseOrder, context: ListingRenderContext) => {
      const outstanding = context.calculateOutstandingAmount(invoice);
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
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: PurchaseOrder, context: ListingRenderContext) => (
      <StatusBadge $status={invoice.status as 'PAID' | 'INVOICED'}>
        {invoice.status === 'PAID' ? context.l10n('accountsPayable.status.paid') : context.l10n('accountsPayable.status.invoiced')}
      </StatusBadge>
    )
  },
  { 
    key: 'accountsPayable.actions',
    align: undefined as 'left' | 'right' | 'center' | undefined,
    render: (invoice: PurchaseOrder, context: ListingRenderContext) => {
      if (context.onViewInvoice && invoice.id) {
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
    invoices,
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
            <FormGroupNoMargin>
              <AxListbox
                value={statusFilter || ''}
                onChange={(value: string | null) => onStatusFilterChange(value || null)}
                options={[
                  { value: '', label: l10n('accountsPayable.filter.all') },
                  { value: 'INVOICED', label: l10n('accountsPayable.status.invoiced') },
                  { value: 'PAID', label: l10n('accountsPayable.status.paid') },
                ]}
                placeholder={l10n('accountsPayable.filter.placeholder')}
              />
            </FormGroupNoMargin>
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
            <AxTable fullWidth stickyHeader>
            <AxTableHead>
              <AxTableRow>
                {LISTING_TABLE_COLUMNS.map((column) => (
                  <AxTableHeader key={column.key} align={column.align}>
                    {l10n(column.key)}
                  </AxTableHeader>
                ))}
              </AxTableRow>
            </AxTableHead>
            <AxTableBody>
              {filteredInvoices.map((invoice) => {
                const context: ListingRenderContext = {
                  getSupplierName,
                  formatDate,
                  calculateOutstandingAmount,
                  l10n,
                  onViewInvoice,
                };
                return (
                  <AxTableRow key={invoice.id}>
                    {LISTING_TABLE_COLUMNS.map((column) => (
                      <AxTableCell key={column.key} align={column.align}>
                        {column.render(invoice, context)}
                      </AxTableCell>
                    ))}
                  </AxTableRow>
                );
              })}
            </AxTableBody>
          </AxTable>
          )}
        </TableContainer>
      </TableCard>
    </PageContainer>
  );
}

