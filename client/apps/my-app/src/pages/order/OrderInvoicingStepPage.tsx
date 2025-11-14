import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup } from '@ui/components';
import { OrderInvoicingStepProps } from './types';

export function OrderInvoicingStepPage(props: OrderInvoicingStepProps) {
  const { order, invoiceNumber, invoiceDate, onInvoiceNumberChange, onInvoiceDateChange } = props;

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>請求処理 (Billing / Invoicing)</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        出荷実績に基づき請求書を発行します。
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>請求書番号 (Invoice Number)</AxLabel>
          <AxInput
            type="text"
            value={invoiceNumber}
            onChange={e => onInvoiceNumberChange(e.target.value)}
            placeholder="請求書番号を入力してください"
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>請求日 (Invoice Date)</AxLabel>
          <AxInput
            type="date"
            value={invoiceDate}
            onChange={e => onInvoiceDateChange(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <div
          style={{
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--color-background-secondary)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <AxParagraph style={{ fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--spacing-sm)' }}>
            請求金額
          </AxParagraph>
          <AxParagraph style={{ fontSize: 'var(--font-size-lg)' }}>
            ${order?.total?.toFixed(2) || '0.00'}
          </AxParagraph>
        </div>
      </div>
    </div>
  );
}

