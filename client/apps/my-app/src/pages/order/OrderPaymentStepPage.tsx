import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup, AxListbox } from '@ui/components';
import { OrderPaymentStepProps } from './types';

export function OrderPaymentStepPage(props: OrderPaymentStepProps) {
  const {
    order,
    paymentAmount,
    paymentDate,
    paymentMethod,
    onPaymentAmountChange,
    onPaymentDateChange,
    onPaymentMethodChange,
  } = props;

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>入金処理 (Payment / Settlement)</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        顧客からの入金を確認・照合して完了します。
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>入金額 (Payment Amount)</AxLabel>
          <AxInput
            type="number"
            value={paymentAmount || ''}
            onChange={e => onPaymentAmountChange(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>入金日 (Payment Date)</AxLabel>
          <AxInput
            type="date"
            value={paymentDate}
            onChange={e => onPaymentDateChange(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>支払方法 (Payment Method)</AxLabel>
          <AxListbox
            options={[
              { value: 'BANK_TRANSFER', label: '銀行振込 (Bank Transfer)' },
              { value: 'CREDIT_CARD', label: 'クレジットカード (Credit Card)' },
              { value: 'CASH', label: '現金 (Cash)' },
              { value: 'CHECK', label: '小切手 (Check)' },
              { value: 'OTHER', label: 'その他 (Other)' },
            ]}
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            placeholder="支払方法を選択してください"
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
          <AxParagraph style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-md)' }}>
            ${order?.total?.toFixed(2) || '0.00'}
          </AxParagraph>
          {paymentAmount > 0 && (
            <AxParagraph
              style={{
                color: paymentAmount >= (order?.total || 0) ? 'var(--color-success)' : 'var(--color-warning)',
              }}
            >
              入金額: ${paymentAmount.toFixed(2)} {paymentAmount < (order?.total || 0) && '(不足額あり)'}
            </AxParagraph>
          )}
        </div>
      </div>
    </div>
  );
}

