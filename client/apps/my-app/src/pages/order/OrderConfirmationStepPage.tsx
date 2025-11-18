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
import styled from '@emotion/styled';
import { OrderConfirmationStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  overflow: visible;
`;

const ItemsTable = styled.div`
  overflow-x: auto;
`;

export function OrderConfirmationStepPage(props: OrderConfirmationStepProps) {
  const { order } = props;
  const { l10n } = useI18n();

  return (
    <StepContent>
      <div>
        <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('orderEntry.confirmation.title')}</AxHeading3>
        <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
          {l10n('orderEntry.confirmation.description')}
        </AxParagraph>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>

        <div>
          <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
            Order Items
          </AxParagraph>
          <ItemsTable>
            <AxTable fullWidth>
              <AxTableHead>
                <AxTableRow>
                  <AxTableHeader>Product</AxTableHeader>
                  <AxTableHeader>Quantity</AxTableHeader>
                  <AxTableHeader align="right">Unit Price</AxTableHeader>
                  <AxTableHeader align="right">Line Total</AxTableHeader>
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
                      <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                        No items in this order
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
            <AxParagraph>Subtotal:</AxParagraph>
            <AxParagraph>${order?.subtotal?.toFixed(2) || '0.00'}</AxParagraph>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
            <AxParagraph>Tax:</AxParagraph>
            <AxParagraph>${order?.tax?.toFixed(2) || '0.00'}</AxParagraph>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
            <AxParagraph>Shipping:</AxParagraph>
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
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>Total:</AxParagraph>
            <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)' }}>
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

