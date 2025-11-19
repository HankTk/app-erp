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
import { useI18n } from '../../i18n/I18nProvider';
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
  SummaryItemContainer,
  SummaryItemLabel,
  SummaryItemValue,
} from './GeneralLedgerListingPage.styles';

const COMPONENT_NAME = 'GeneralLedgerListingPage';

interface SummaryItemProps {
  label: string;
  value: number;
  color?: 'error' | 'success' | 'primary' | 'text-primary' | 'text-secondary';
}

function SummaryItem({ label, value, color = 'text-primary' }: SummaryItemProps) {
  return (
    <SummaryItemContainer>
      <SummaryItemLabel>{label}</SummaryItemLabel>
      <SummaryItemValue $color={color}>${value.toFixed(2)}</SummaryItemValue>
    </SummaryItemContainer>
  );
}

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

const createColumns = (t: (key: string, params?: Record<string, string | number | undefined>) => string): ColumnDefinition<GLEntry, ListingRenderContext>[] => [
  { 
    key: 'gl.date',
    header: t('generalLedger.table.date'),
    align: undefined,
    render: (entry: GLEntry, context) => context?.formatDate(entry.date) || t('generalLedger.notAvailable')
  },
  { 
    key: 'gl.type',
    header: t('generalLedger.table.type'),
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
    header: t('generalLedger.table.orderPoInvoice'),
    align: undefined,
    render: (entry: GLEntry) => {
      const orderOrPO = entry.poNumber ? `${t('generalLedger.poPrefix')} ${entry.poNumber}` : entry.orderNumber ? `${t('generalLedger.orderPrefix')} ${entry.orderNumber}` : t('generalLedger.notAvailable');
      return entry.invoiceNumber ? `${orderOrPO} / ${entry.invoiceNumber}` : orderOrPO;
    }
  },
  { 
    key: 'gl.customerSupplier',
    header: t('generalLedger.table.customerSupplier'),
    align: undefined,
    width: '150px',
    render: (entry: GLEntry) => entry.customerName || entry.supplierName || t('generalLedger.notAvailable')
  },
  { 
    key: 'gl.description',
    header: t('generalLedger.table.description'),
    align: undefined,
    render: (entry: GLEntry) => entry.description
  },
  { 
    key: 'gl.quantity',
    header: t('generalLedger.table.quantity'),
    align: 'right',
    width: '100px',
    render: (entry: GLEntry) => entry.quantity
  },
  { 
    key: 'gl.debit',
    header: t('generalLedger.table.debit'),
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
    header: t('generalLedger.table.credit'),
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
    header: t('generalLedger.table.actions'),
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
            {t('generalLedger.table.view')}
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

  const { l10n } = useI18n();
  const columns = createColumns(l10n);
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
                  {l10n('generalLedger.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('generalLedger.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('generalLedger.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <AxParagraph>{l10n('generalLedger.loading')}</AxParagraph>
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
                  {l10n('generalLedger.back')}
                </AxButton>
              )}
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                  {l10n('generalLedger.title')}
                </AxHeading3>
                <AxParagraph color="secondary">
                  {l10n('generalLedger.subtitle')}
                </AxParagraph>
              </div>
            </HeaderLeft>
          </HeaderSection>
        </HeaderCard>
        <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <AxParagraph color="error">{l10n('generalLedger.error')}: {error}</AxParagraph>
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
                {l10n('generalLedger.title')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('generalLedger.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup style={{ margin: 0 }}>
              <AxInput
                type="date"
                value={dateFrom}
                onChange={e => onDateFromChange(e.target.value)}
                placeholder={l10n('generalLedger.filter.fromDate')}
              />
            </AxFormGroup>
            <AxFormGroup style={{ margin: 0 }}>
              <AxInput
                type="date"
                value={dateTo}
                onChange={e => onDateToChange(e.target.value)}
                placeholder={l10n('generalLedger.filter.toDate')}
              />
            </AxFormGroup>
            <AxFormGroup style={{ margin: 0 }}>
              <AxListbox
                options={[
                  { value: '', label: l10n('generalLedger.filter.allTypes') },
                  { value: 'REVENUE', label: l10n('generalLedger.type.revenue') },
                  { value: 'COST', label: l10n('generalLedger.type.cost') },
                  { value: 'EXPENSE', label: l10n('generalLedger.type.expense') },
                  { value: 'ACCOUNTS_PAYABLE', label: l10n('generalLedger.type.accountsPayable') },
                  { value: 'PAYMENT', label: l10n('generalLedger.type.payment') },
                ]}
                value={typeFilter || ''}
                onChange={(value: string | string[]) => onTypeFilterChange(Array.isArray(value) ? value[0] || null : value || null)}
                placeholder={l10n('generalLedger.filter.byType')}
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
              <AxParagraph>{l10n('generalLedger.noEntries')}</AxParagraph>
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
            <SummaryItem label={l10n('generalLedger.summary.totalDebit')} value={totalDebit} color="error" />
            <SummaryItem label={l10n('generalLedger.summary.totalCredit')} value={totalCredit} color="success" />
            <SummaryItem label={l10n('generalLedger.summary.totalRevenue')} value={totalRevenue} color="success" />
            <SummaryItem label={l10n('generalLedger.summary.totalCost')} value={totalCost} color="error" />
            <SummaryItem label={l10n('generalLedger.summary.totalExpense')} value={totalExpense} color="error" />
            <SummaryItem label={l10n('generalLedger.summary.totalAccountsPayable')} value={totalAccountsPayable} color="error" />
            <SummaryItem label={l10n('generalLedger.summary.totalPayments')} value={totalPayment} color="primary" />
            <SummaryItem label={l10n('generalLedger.summary.netIncome')} value={netIncome} color={netIncome >= 0 ? 'success' : 'error'} 
            />
          </SummarySection>
        )}
      </TableCard>
    </PageContainer>
  );
}

