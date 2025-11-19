import {
  AxCard,
  AxHeading3,
  AxParagraph,
  AxButton,
  AxTable,
  AxListbox,
  AxFormGroup,
  AxLabel,
  ColumnDefinition,
} from '@ui/components';
import { debugProps } from '../../utils/emotionCache';
import { SFC } from '../../api/sfcApi';
import { RMA } from '../../api/rmaApi';
import { useI18n } from '../../i18n/I18nProvider';
import {
  PageContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  TableCard,
  StatusBadge,
} from './ShopFloorControlListingPage.styles';

const COMPONENT_NAME = 'ShopFloorControlListingPage';

type SFCListingRenderContext = {
  getCustomerName: (customerId?: string) => string;
  onProcessRMA?: (rmaId: string) => void;
  onProcess: (sfc: SFC) => void;
};

type RMAListingRenderContext = {
  getCustomerName: (customerId?: string) => string;
  processing: string | null;
  onCreateSFC: (rma: RMA) => void;
};

const createSFCColumns = (t: (key: string, params?: Record<string, string | number | undefined>) => string): ColumnDefinition<SFC, SFCListingRenderContext>[] => [
  { 
    key: 'sfc.sfcNumber',
    header: t('sfc.listing.table.sfcNumber'),
    align: undefined,
    render: (sfc: SFC) => <strong>{sfc.sfcNumber || sfc.id}</strong>
  },
  { 
    key: 'sfc.rmaNumber',
    header: t('sfc.listing.table.rmaNumber'),
    align: undefined,
    render: (sfc: SFC) => sfc.rmaNumber || t('generalLedger.notAvailable')
  },
  { 
    key: 'sfc.customer',
    header: t('sfc.listing.table.customer'),
    align: undefined,
    render: (sfc: SFC, context) => sfc.customerName || context?.getCustomerName(sfc.customerId) || t('generalLedger.notAvailable')
  },
  { 
    key: 'sfc.orderNumber',
    header: t('sfc.listing.table.orderNumber'),
    align: undefined,
    render: (sfc: SFC) => sfc.orderNumber || t('generalLedger.notAvailable')
  },
  { 
    key: 'sfc.createdDate',
    header: t('sfc.listing.table.createdDate'),
    align: undefined,
    render: (sfc: SFC) => sfc.createdDate ? new Date(sfc.createdDate).toLocaleDateString() : t('generalLedger.notAvailable')
  },
  { 
    key: 'sfc.status',
    header: t('sfc.listing.table.status'),
    align: undefined,
    render: (sfc: SFC) => (
      <StatusBadge status={sfc.status || 'PENDING'}>
        {sfc.status || 'PENDING'}
      </StatusBadge>
    )
  },
  { 
    key: 'sfc.actions',
    header: t('generalLedger.table.actions'),
    align: 'center',
    render: (sfc: SFC, context) => {
      if (sfc.id && context?.onProcessRMA && sfc.rmaId) {
        return (
          <AxButton 
            variant="primary" 
            size="small"
            onClick={() => context.onProcess!(sfc)}
            style={{ minWidth: 'auto' }}
          >
            {t('sfc.listing.table.process')}
          </AxButton>
        );
      }
      return null;
    }
  },
];

const createRMAColumns = (t: (key: string, params?: Record<string, string | number | undefined>) => string): ColumnDefinition<RMA, RMAListingRenderContext>[] => [
  { 
    key: 'rma.rmaNumber',
    header: t('sfc.listing.table.rmaNumber'),
    align: undefined,
    render: (rma: RMA) => <strong>{rma.rmaNumber || rma.id}</strong>
  },
  { 
    key: 'rma.customer',
    header: t('sfc.listing.table.customer'),
    align: undefined,
    render: (rma: RMA, context) => context?.getCustomerName(rma.customerId) || t('generalLedger.notAvailable')
  },
  { 
    key: 'rma.orderNumber',
    header: t('sfc.listing.table.orderNumber'),
    align: undefined,
    render: (rma: RMA) => rma.orderNumber || t('generalLedger.notAvailable')
  },
  { 
    key: 'rma.rmaDate',
    header: t('rma.table.rmaDate'),
    align: undefined,
    render: (rma: RMA) => rma.rmaDate ? new Date(rma.rmaDate).toLocaleDateString() : t('generalLedger.notAvailable')
  },
  { 
    key: 'rma.status',
    header: t('sfc.listing.table.status'),
    align: undefined,
    render: (rma: RMA) => (
      <StatusBadge status={rma.status || 'DRAFT'}>
        {rma.status || 'DRAFT'}
      </StatusBadge>
    )
  },
  { 
    key: 'rma.actions',
    header: t('generalLedger.table.actions'),
    align: 'center',
    render: (rma: RMA, context) => {
      if (rma.id) {
        return (
          <AxButton 
            variant="primary" 
            size="small"
            onClick={() => context?.onCreateSFC(rma)}
            disabled={context?.processing === rma.id}
            style={{ minWidth: 'auto' }}
          >
            {context?.processing === rma.id ? t('sfc.listing.table.creating') : t('sfc.listing.table.createSFC')}
          </AxButton>
        );
      }
      return null;
    }
  },
];

interface ShopFloorControlListingPageRenderProps {
  sfcs: SFC[];
  rmasNeedingSFC: RMA[];
  loading: boolean;
  error: string | null;
  statusFilter: string | null;
  processing: string | null;
  onProcessRMA?: (rmaId: string) => void;
  onNavigateBack?: () => void;
  onStatusFilterChange: (value: string | null) => void;
  onProcess: (sfc: SFC) => void;
  onCreateSFC: (rma: RMA) => void;
  onRetry: () => void;
  getCustomerName: (customerId?: string) => string;
}

export function ShopFloorControlListingPageRender(props: ShopFloorControlListingPageRenderProps) {
  const {
    sfcs,
    rmasNeedingSFC,
    loading,
    error,
    statusFilter,
    processing,
    onProcessRMA,
    onNavigateBack,
    onStatusFilterChange,
    onProcess,
    onCreateSFC,
    onRetry,
    getCustomerName,
  } = props;

  const { l10n } = useI18n();
  const sfcColumns = createSFCColumns(l10n);
  const rmaColumns = createRMAColumns(l10n);
  const sfcTableContext: SFCListingRenderContext = {
    getCustomerName,
    onProcessRMA,
    onProcess,
  };
  const rmaTableContext: RMAListingRenderContext = {
    getCustomerName,
    processing,
    onCreateSFC,
  };

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
                {l10n('sfc.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('sfc.listing.title')}
              </AxHeading3>
              <AxParagraph color="secondary">
                {l10n('sfc.listing.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
            <AxFormGroup>
              <AxLabel>{l10n('sfc.listing.statusFilter')}</AxLabel>
              <AxListbox
                options={[
                  { value: null, label: l10n('sfc.listing.all') },
                  { value: 'PENDING', label: l10n('sfc.listing.pending') },
                  { value: 'IN_PROGRESS', label: l10n('sfc.listing.inProgress') },
                  { value: 'COMPLETED', label: l10n('sfc.listing.completed') },
                  { value: 'CANCELLED', label: l10n('sfc.listing.cancelled') },
                ]}
                value={statusFilter}
                onChange={(value) => onStatusFilterChange(value)}
                fullWidth
                style={{ minWidth: '150px' }}
              />
            </AxFormGroup>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>

      <TableCard padding="large" {...debugProps(COMPONENT_NAME, 'TableCard')}>
        {loading ? (
          <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <AxParagraph>{l10n('sfc.loadingSFC')}</AxParagraph>
          </div>
        ) : error ? (
          <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <AxParagraph color="danger">{error}</AxParagraph>
            <AxButton variant="secondary" onClick={onRetry} style={{ marginTop: 'var(--spacing-md)' }}>
              {l10n('common.retry')}
            </AxButton>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            {sfcs.length > 0 && (
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)' }}>
                  {l10n('sfc.listing.activeSFC')}
                </AxHeading3>
                <AxTable
                  fullWidth
                  stickyHeader
                  data={sfcs}
                  columns={sfcColumns}
                  context={sfcTableContext}
                  getRowKey={(sfc) => sfc.id || ''}
                />
              </div>
            )}
            
            {rmasNeedingSFC.length > 0 && (
              <div>
                <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)', fontSize: 'var(--font-size-md)' }}>
                  {l10n('sfc.listing.rmasReady')}
                </AxHeading3>
                <AxTable
                  fullWidth
                  stickyHeader
                  data={rmasNeedingSFC}
                  columns={rmaColumns}
                  context={rmaTableContext}
                  getRowKey={(rma) => rma.id || ''}
                />
              </div>
            )}
            
            {sfcs.length === 0 && rmasNeedingSFC.length === 0 && (
              <div style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
                <AxParagraph color="secondary">
                  {l10n('sfc.listing.noRecords')}
                </AxParagraph>
              </div>
            )}
          </div>
        )}
      </TableCard>
    </PageContainer>
  );
}

