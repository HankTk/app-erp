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
  AxDialog,
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
} from './PurchaseOrderListingPage.styles';

const COMPONENT_NAME = 'PurchaseOrderListingPage';

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
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
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
                <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
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
            <AxParagraph style={{ color: 'var(--color-error)' }}>Error: {error}</AxParagraph>
            {error.includes('404') && (
              <AxParagraph style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
                {l10n('purchaseOrder.error.serverRestart')}
              </AxParagraph>
            )}
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
                {l10n('purchaseOrder.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('module.purchaseOrder')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
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
        <div style={{ flex: 1, overflow: 'auto', minHeight: 0, height: 0, maxHeight: '100%' }}>
          {filteredPOs.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
              <AxParagraph>{l10n('purchaseOrder.noData')}</AxParagraph>
            </div>
          ) : (
            <AxTable fullWidth stickyHeader>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>{l10n('purchaseOrder.orderNumber')}</AxTableHeader>
                  <AxTableHeader>{l10n('purchaseOrder.supplier')}</AxTableHeader>
                  <AxTableHeader>{l10n('purchaseOrder.status')}</AxTableHeader>
                  <AxTableHeader>{l10n('purchaseOrder.orderDate')}</AxTableHeader>
                  <AxTableHeader>{l10n('purchaseOrder.expectedDeliveryDate')}</AxTableHeader>
                  <AxTableHeader align="right">{l10n('purchaseOrder.total')}</AxTableHeader>
                  <AxTableHeader align="center">{l10n('purchaseOrder.actions')}</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {filteredPOs.map((po) => (
                  <AxTableRow key={po.id}>
                    <AxTableCell>{po.orderNumber || po.id?.substring(0, 8) || 'N/A'}</AxTableCell>
                    <AxTableCell>{getSupplierName(po.supplierId)}</AxTableCell>
                    <AxTableCell>
                      <span 
                        style={{ 
                          color: getStatusColor(po.status), 
                          fontWeight: 600,
                          padding: 'var(--spacing-xs) var(--spacing-sm)',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: getStatusColor(po.status) + '20',
                          fontSize: 'var(--font-size-sm)',
                        }}
                      >
                        {getStatusLabel(po.status)}
                      </span>
                    </AxTableCell>
                    <AxTableCell>{formatDate(po.orderDate)}</AxTableCell>
                    <AxTableCell>{formatDate(po.expectedDeliveryDate)}</AxTableCell>
                    <AxTableCell align="right">
                      ${po.total?.toFixed(2) || '0.00'}
                    </AxTableCell>
                    <AxTableCell align="center">
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)', justifyContent: 'center' }}>
                        {onViewPO && (
                          <AxButton variant="secondary" size="small" onClick={() => onViewPO(po.id!)}>
                            {l10n('purchaseOrder.view')}
                          </AxButton>
                        )}
                        {onEditPO && (
                          <AxButton variant="secondary" size="small" onClick={() => onEditPO(po.id!)}>
                            {l10n('purchaseOrder.edit')}
                          </AxButton>
                        )}
                        <AxButton variant="danger" size="small" onClick={() => onDeleteClick(po)}>
                          {l10n('purchaseOrder.delete')}
                        </AxButton>
                      </div>
                    </AxTableCell>
                  </AxTableRow>
                ))}
              </AxTableBody>
            </AxTable>
          )}
        </div>
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

