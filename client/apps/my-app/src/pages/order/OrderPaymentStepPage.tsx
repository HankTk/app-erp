import { AxHeading3, AxParagraph, AxInput, AxLabel, AxFormGroup, AxListbox } from '@ui/components';
import { OrderPaymentStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function OrderPaymentStepPage(props: OrderPaymentStepProps) {
  const {
    order,
    paymentAmount,
    paymentDate,
    paymentMethod,
    onPaymentAmountChange,
    onPaymentDateChange,
    onPaymentMethodChange,
    readOnly = false,
  } = props;
  const { t } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.payment.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {t('orderEntry.payment.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xsm)' }}>
        <AxFormGroup>
          <AxLabel>{t('orderEntry.payment.paymentAmount')}</AxLabel>
          <AxInput
            type="number"
            value={paymentAmount || ''}
            onChange={e => onPaymentAmountChange(parseFloat(e.target.value) || 0)}
            disabled={readOnly}
            placeholder="0.00"
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{t('orderEntry.payment.paymentDate')}</AxLabel>
          <AxInput
            type="date"
            value={paymentDate}
            onChange={e => onPaymentDateChange(e.target.value)}
            disabled={readOnly}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{t('orderEntry.payment.paymentMethod')}</AxLabel>
          <AxListbox
            options={[
              { value: 'BANK_TRANSFER', label: t('orderEntry.payment.method.bankTransfer') },
              { value: 'CREDIT_CARD', label: t('orderEntry.payment.method.creditCard') },
              { value: 'CASH', label: t('orderEntry.payment.method.cash') },
              { value: 'CHECK', label: t('orderEntry.payment.method.check') },
              { value: 'OTHER', label: t('orderEntry.payment.method.other') },
            ]}
            value={paymentMethod}
            onChange={onPaymentMethodChange}
            disabled={readOnly}
            placeholder={t('orderEntry.payment.paymentMethodPlaceholder')}
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
            {t('orderEntry.payment.invoiceAmount')}
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
              {t('orderEntry.payment.paymentAmountLabel')} ${paymentAmount.toFixed(2)} {paymentAmount < (order?.total || 0) && t('orderEntry.payment.shortage')}
            </AxParagraph>
          )}
        </div>
      </div>
    </div>
  );
}

