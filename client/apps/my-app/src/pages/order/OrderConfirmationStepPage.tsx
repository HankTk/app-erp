import { AxHeading3, AxParagraph } from '@ui/components';
import { OrderConfirmationStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function OrderConfirmationStepPage(props: OrderConfirmationStepProps) {
  const { order, customer } = props;
  const { t } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.confirmation.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {t('orderEntry.confirmation.description')}
      </AxParagraph>

      <div
        style={{
          padding: 'var(--spacing-lg)',
          backgroundColor: 'var(--color-background-secondary)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          <strong>{t('orderEntry.confirmation.orderNumber')}</strong> {order?.orderNumber || 'N/A'}
        </AxParagraph>
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          <strong>{t('orderEntry.confirmation.customer')}</strong> {customer?.companyName || customer?.email || 'N/A'}
        </AxParagraph>
        <AxParagraph style={{ marginBottom: 'var(--spacing-md)' }}>
          <strong>{t('orderEntry.confirmation.totalAmount')}</strong> ${order?.total?.toFixed(2) || '0.00'}
        </AxParagraph>
        <AxParagraph>{t('orderEntry.confirmation.confirmMessage')}</AxParagraph>
      </div>
    </div>
  );
}

