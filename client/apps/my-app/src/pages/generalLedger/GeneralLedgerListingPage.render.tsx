import {
  AxTable,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxFormGroup,
  AxListbox,
  AxInput,
  ColumnDefinition,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
  TableWrapper,
  SummarySection,
} from './GeneralLedgerListingPage.styles';

const COMPONENT_NAME = 'GeneralLedgerListingPage';

interface GLEntry {
  id: string;
  date: string;
  type: 'REVENUE' | 'COST' | 'PAYMENT' | 'EXPENSE' | 'ACCOUNTS_PAYABLE';
  orderId?: string;
  orderNumber?: string;
  poId?: string;
  poNumber?: string;
  invoiceNumber?: string;
  customerId?: string;
  customerName?: string;
  supplierId?: string;
  supplierName?: string;
  description: string;
  quantity: number;
  amount: number;
  cost?: number;
  status: string;
}

type ListingRenderContext = {
  formatDate: (dateString: string) => string;
  getTypeColor: (type: string) => string;
  getTypeBackgroundColor: (type: string) => string;
  getTypeLabel: (type: string) => string;
  onViewEntry?: (orderId: string) => void;
};

const createColumns = (): ColumnDefinition<GLEntry, ListingRenderContext>[] => [
  { 
    key: 'gl.date',
    header: 'Date',
    align: undefined,
    render: (entry: GLEntry, context) => context?.formatDate(entry.date) || 'N/A'
  },
  { 
    key: 'gl.type',
    header: 'Type',
    align: undefined,
    render: (entry: GLEntry, context) => (
      <span 
        style={{ 
          color: context?.getTypeColor(entry.type) || 'var(--color-text-primary)', 
          fontWeight: 600,
          padding: '4px 12px',
          borderRadius: '12px',
          backgroundColor: context?.getTypeBackgroundColor(entry.type) || 'transparent',
          display: 'inline-block',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        {context?.getTypeLabel(entry.type) || entry.type}
      </span>
    )
  },
  { 
    key: 'gl.orderPoInvoice',
    header: 'Order/PO/Invoice',
    align: undefined,
    render: (entry: GLEntry) => {
      const orderOrPO = entry.poNumber ? `PO: ${entry.poNumber}` : entry.orderNumber ? `Order: ${entry.orderNumber}` : 'N/A';
      return entry.invoiceNumber ? `${orderOrPO} / ${entry.invoiceNumber}` : orderOrPO;
    }
  },
  { 
    key: 'gl.customerSupplier',
    header: 'Customer/Supplier',
    align: undefined,
    render: (entry: GLEntry) => entry.customerName || entry.supplierName || 'N/A'
  },
  { 
    key: 'gl.description',
    header: 'Description',
    align: undefined,
    render: (entry: GLEntry) => entry.description
  },
  { 
    key: 'gl.quantity',
    header: 'Quantity',
    align: 'right',
    render: (entry: GLEntry) => entry.quantity
  },
  { 
    key: 'gl.debit',
    header: 'Debit',
    align: 'right',
    render: (entry: GLEntry) => {
      const debitAmount = entry.type === 'COST' || entry.type === 'EXPENSE' || entry.type === 'ACCOUNTS_PAYABLE' ? entry.amount : 0;
      return (
        <span style={{ 
          color: debitAmount > 0 ? 'var(--color-error)' : 'var(--color-text-secondary)',
          fontWeight: debitAmount > 0 ? 'var(--font-weight-bold)' : 'normal'
        }}>
          {debitAmount > 0 ? `$${debitAmount.toFixed(2)}` : '-'}
        </span>
      );
    }
  },
  { 
    key: 'gl.credit',
    header: 'Credit',
    align: 'right',
    render: (entry: GLEntry) => {
      const creditAmount = entry.type === 'REVENUE' || entry.type === 'PAYMENT' ? entry.amount : 0;
      return (
        <span style={{ 
          color: creditAmount > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)',
          fontWeight: creditAmount > 0 ? 'var(--font-weight-bold)' : 'normal'
        }}>
          {creditAmount > 0 ? `$${creditAmount.toFixed(2)}` : '-'}
        </span>
      );
    }
  },
  { 
    key: 'gl.actions',
    header: 'Actions',
    align: 'center',
    render: (entry: GLEntry, context) => {
      if (context?.onViewEntry && (entry.orderId || entry.poId)) {
        return (
          <AxButton 
            variant="secondary" 
            size="small"
            onClick={() => context.onViewEntry!(entry.orderId || entry.poId || '')}
            style={{ minWidth: '80px' }}
          >
            View
          </AxButton>
        );
      }
      return null;
    }
  },
];

interface GeneralLedgerListingPageRenderProps {
  glEntries: GLEntry[];
  loading: boolean;
  error: string | null;
  typeFilter: string | null;
  dateFrom: string;
  dateTo: string;
  filteredEntries: GLEntry[];
  onViewEntry?: (orderId: string) => void;
  onNavigateBack?: () => void;
  onTypeFilterChange: (value: string | null) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  formatDate: (dateString: string) => string;
  getTypeColor: (type: string) => string;
  getTypeBackgroundColor: (type: string) => string;
  getTypeLabel: (type: string) => string;
  totalDebit: number;
  totalCredit: number;
  totalRevenue: number;
  totalCost: number;
  totalExpense: number;
  totalAccountsPayable: number;
  totalPayment: number;
  netIncome: number;
}

export function GeneralLedgerListingPageRender(props: GeneralLedgerListingPageRenderProps) {
  const {
    loading,
    error,
    typeFilter,
    dateFrom,
    dateTo,
    filteredEntries,
    onViewEntry,
    onNavigateBack,
    onTypeFilterChange,
    onDateFromChange,
    onDateToChange,
    formatDate,
    getTypeColor,
    getTypeBackgroundColor,
    getTypeLabel,
    totalDebit,
    totalCredit,
    totalRevenue,
    totalCost,
    totalExpense,
    totalAccountsPayable,
    totalPayment,
    netIncome,
  } = props;

  const columns = createColumns();
  const tableContext: ListingRenderContext = {
    formatDate,
    getTypeColor,
    getTypeBackgroundColor,
    getTypeLabel,
    onViewEntry,
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
                  General Ledger
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Financial transactions based on shipping and payments
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>Loading general ledger entries...</AxParagraph>
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
                  General Ledger
                </AxHeading3>
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                  Financial transactions based on shipping and payments
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            <AxButton variant="secondary" onClick={() => window.location.reload()}>
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
                General Ledger
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                Financial transactions based on shipping and payments
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup style={{ margin: 0 }}>
              <AxInput
                type="date"
                value={dateFrom}
                onChange={e => onDateFromChange(e.target.value)}
                placeholder="From Date"
              />
            </AxFormGroup>
            <AxFormGroup style={{ margin: 0 }}>
              <AxInput
                type="date"
                value={dateTo}
                onChange={e => onDateToChange(e.target.value)}
                placeholder="To Date"
              />
            </AxFormGroup>
            <AxFormGroup style={{ margin: 0 }}>
              <AxListbox
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'REVENUE', label: 'Revenue' },
                  { value: 'COST', label: 'Cost' },
                  { value: 'EXPENSE', label: 'Expense' },
                  { value: 'ACCOUNTS_PAYABLE', label: 'Accounts Payable' },
                  { value: 'PAYMENT', label: 'Payment' },
                ]}
                value={typeFilter || ''}
                onChange={(value: string | string[]) => onTypeFilterChange(Array.isArray(value) ? value[0] || null : value || null)}
                placeholder="Filter by type"
                style={{ width: '200px' }}
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        <TableWrapper {...debugProps(COMPONENT_NAME, 'TableWrapper')}>
          {filteredEntries.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>No general ledger entries found</AxParagraph>
            </div>
          ) : (
            <AxTable
              fullWidth
              stickyHeader
              data={filteredEntries}
              columns={columns}
              context={tableContext}
              getRowKey={(entry) => entry.id}
            />
          )}
        </TableWrapper>
        
        {/* Summary - Always visible outside scrollable area */}
        {filteredEntries.length > 0 && (
          <SummarySection {...debugProps(COMPONENT_NAME, 'SummarySection')}>
            <div>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Total Debit
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
                ${totalDebit.toFixed(2)}
              </AxParagraph>
            </div>
            <div>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Total Credit
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                ${totalCredit.toFixed(2)}
              </AxParagraph>
            </div>
            <div>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Total Revenue
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success)' }}>
                ${totalRevenue.toFixed(2)}
              </AxParagraph>
            </div>
            <div>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Total Cost
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
                ${totalCost.toFixed(2)}
              </AxParagraph>
            </div>
            <div>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Total Expense
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
                ${totalExpense.toFixed(2)}
              </AxParagraph>
            </div>
            <div>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Total A/P
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-error)' }}>
                ${totalAccountsPayable.toFixed(2)}
              </AxParagraph>
            </div>
            <div>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Total Payments
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>
                ${totalPayment.toFixed(2)}
              </AxParagraph>
            </div>
            <div>
              <AxParagraph style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-xs)' }}>
                Net Income
              </AxParagraph>
              <AxParagraph style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-bold)', color: netIncome >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                ${netIncome.toFixed(2)}
              </AxParagraph>
            </div>
          </SummarySection>
        )}
      </TableCard>
    </PageContainer>
  );
}

