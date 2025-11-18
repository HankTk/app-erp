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
  AxInput,
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
    glEntries,
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
                  { value: null, label: 'All Types' },
                  { value: 'REVENUE', label: 'Revenue' },
                  { value: 'COST', label: 'Cost' },
                  { value: 'EXPENSE', label: 'Expense' },
                  { value: 'ACCOUNTS_PAYABLE', label: 'Accounts Payable' },
                  { value: 'PAYMENT', label: 'Payment' },
                ]}
                value={typeFilter}
                onChange={(value) => onTypeFilterChange(value)}
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
            <AxTable fullWidth stickyHeader>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Date</AxTableHeader>
                  <AxTableHeader>Type</AxTableHeader>
                  <AxTableHeader>Order/PO/Invoice</AxTableHeader>
                  <AxTableHeader>Customer/Supplier</AxTableHeader>
                  <AxTableHeader>Description</AxTableHeader>
                  <AxTableHeader align="right">Quantity</AxTableHeader>
                  <AxTableHeader align="right">Debit</AxTableHeader>
                  <AxTableHeader align="right">Credit</AxTableHeader>
                  <AxTableHeader align="center">Actions</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {filteredEntries.map((entry) => {
                  // Debit for COST, EXPENSE, ACCOUNTS_PAYABLE; Credit for REVENUE and PAYMENT
                  const debitAmount = entry.type === 'COST' || entry.type === 'EXPENSE' || entry.type === 'ACCOUNTS_PAYABLE' ? entry.amount : 0;
                  const creditAmount = entry.type === 'REVENUE' || entry.type === 'PAYMENT' ? entry.amount : 0;
                  
                  // Determine order/PO number and customer/supplier name
                  const orderOrPONumber = entry.orderNumber || entry.poNumber || 'N/A';
                  const customerOrSupplierName = entry.customerName || entry.supplierName || 'N/A';
                  
                  return (
                    <AxTableRow key={entry.id}>
                      <AxTableCell>{formatDate(entry.date)}</AxTableCell>
                      <AxTableCell>
                        <span 
                          style={{ 
                            color: getTypeColor(entry.type), 
                            fontWeight: 600,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            backgroundColor: getTypeBackgroundColor(entry.type),
                            display: 'inline-block',
                            fontSize: 'var(--font-size-sm)',
                          }}
                        >
                          {getTypeLabel(entry.type)}
                        </span>
                      </AxTableCell>
                      <AxTableCell>
                        {entry.poNumber ? `PO: ${entry.poNumber}` : entry.orderNumber ? `Order: ${entry.orderNumber}` : 'N/A'}
                        {entry.invoiceNumber && ` / ${entry.invoiceNumber}`}
                      </AxTableCell>
                      <AxTableCell>{customerOrSupplierName}</AxTableCell>
                      <AxTableCell>{entry.description}</AxTableCell>
                      <AxTableCell align="right">{entry.quantity}</AxTableCell>
                      <AxTableCell align="right" style={{ 
                        color: debitAmount > 0 ? 'var(--color-error)' : 'var(--color-text-secondary)',
                        fontWeight: debitAmount > 0 ? 'var(--font-weight-bold)' : 'normal'
                      }}>
                        {debitAmount > 0 ? `$${debitAmount.toFixed(2)}` : '-'}
                      </AxTableCell>
                      <AxTableCell align="right" style={{ 
                        color: creditAmount > 0 ? 'var(--color-success)' : 'var(--color-text-secondary)',
                        fontWeight: creditAmount > 0 ? 'var(--font-weight-bold)' : 'normal'
                      }}>
                        {creditAmount > 0 ? `$${creditAmount.toFixed(2)}` : '-'}
                      </AxTableCell>
                      <AxTableCell align="center">
                        {onViewEntry && (entry.orderId || entry.poId) && (
                          <AxButton 
                            variant="secondary" 
                            size="small"
                            onClick={() => onViewEntry(entry.orderId || entry.poId || '')}
                            style={{ minWidth: '80px' }}
                          >
                            View
                          </AxButton>
                        )}
                      </AxTableCell>
                    </AxTableRow>
                  );
                })}
              </AxTableBody>
            </AxTable>
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

