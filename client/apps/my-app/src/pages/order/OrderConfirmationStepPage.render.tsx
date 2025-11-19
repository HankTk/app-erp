import {
  AxHeading3,
  AxParagraph,
  AxTable,
  AxTableHead,
  AxTableBody,
  AxTableRow,
  AxTableHeader,
  AxTableCell,
} from '@ui/components';
import { OrderConfirmationStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import { StepContent, ItemsTable } from './OrderConfirmationStepPage.styles';

const COMPONENT_NAME = 'OrderConfirmationStepPage';

export function OrderConfirmationStepPageRender(props: OrderConfirmationStepProps) {
  const { order } = props;
  const { l10n } = useI18n();

  return (
    <StepContent {...debugProps(COMPONENT_NAME, 'StepContent')}>
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.confirmation.title')}</AxHeading3>
        <AxParagraph marginBottom="lg" color="secondary">
          {l10n('orderEntry.confirmation.description')}
        </AxParagraph>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

        <div>
          <AxParagraph weight="bold" marginBottom="sm">
            {l10n('orderEntry.review.orderItems')}
          </AxParagraph>
          <ItemsTable {...debugProps(COMPONENT_NAME, 'ItemsTable')}>
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>{l10n('orderEntry.products.table.product')}</AxTableHeader>
                  <AxTableHeader>{l10n('orderEntry.products.table.quantity')}</AxTableHeader>
                  <AxTableHeader align="right">{l10n('orderEntry.products.table.unitPrice')}</AxTableHeader>
                  <AxTableHeader align="right">{l10n('orderEntry.products.table.lineTotal')}</AxTableHeader>
                </AxTableRow>
              </AxTableHead>
              <AxTableBody>
                {order?.items && order.items.length > 0 ? (
                  order.items.map(item => (
                    <AxTableRow key={item.id}>
                      <AxTableCell>{item.productName || item.productCode}</AxTableCell>
                      <AxTableCell>{item.quantity || 0}</AxTableCell>
                      <AxTableCell align="right">${item.unitPrice?.toFixed(2) || '0.00'}</AxTableCell>
                      <AxTableCell align="right">${item.lineTotal?.toFixed(2) || '0.00'}</AxTableCell>
                    </AxTableRow>
                  ))
                ) : (
                  <AxTableRow>
                    <AxTableCell colSpan={4} align="center">
                      <AxParagraph color="secondary">
                        {l10n('orderEntry.confirmation.noItems')}
                      </AxParagraph>
                    </AxTableCell>
                  </AxTableRow>
                )}
              </AxTableBody>
            </AxTable>
          </ItemsTable>
        </div>

        <div
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
            <AxParagraph>{l10n('orderEntry.review.subtotal')}</AxParagraph>
            <AxParagraph>${order?.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
            <AxParagraph>{l10n('orderEntry.review.tax')}</AxParagraph>
            <AxParagraph>${order?.tax?.toFixed(2) || '0.00'}</AxParagraph>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
            <AxParagraph>{l10n('orderEntry.review.shipping')}</AxParagraph>
            <AxParagraph>${order?.shippingCost?.toFixed(2) || '0.00'}</AxParagraph>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 'var(--spacing-sm)',
              borderTop: '2px solid var(--color-border-default)',
            }}
          >
            <AxParagraph weight="bold">{l10n('orderEntry.review.total')}</AxParagraph>
            <AxParagraph weight="bold">
              ${order?.total?.toFixed(2) || '0.00'}
            </AxParagraph>
          </div>
        </div>

        <div
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <AxParagraph>{l10n('orderEntry.confirmation.confirmMessage')}</AxParagraph>
        </div>
      </div>
    </StepContent>
  );
}

