import { AxHeading3, AxParagraph, AxLabel, AxFormGroup } from '@ui/components';
import { OrderApprovalStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function OrderApprovalStepPage(props: OrderApprovalStepProps) {
  const {
    approvalNotes,
    creditCheckPassed,
    inventoryConfirmed,
    priceApproved,
    onApprovalNotesChange,
    onCreditCheckChange,
    onInventoryConfirmChange,
    onPriceApproveChange,
  } = props;
  const { t } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('orderEntry.approval.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {t('orderEntry.approval.description')}
      </AxParagraph>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <AxFormGroup>
          <AxLabel>
            <input
              type="checkbox"
              checked={creditCheckPassed}
              onChange={e => onCreditCheckChange(e.target.checked)}
              style={{ marginRight: 'var(--spacing-xs)' }}
            />
            {t('orderEntry.approval.creditCheck')}
          </AxLabel>
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>
            <input
              type="checkbox"
              checked={inventoryConfirmed}
              onChange={e => onInventoryConfirmChange(e.target.checked)}
              style={{ marginRight: 'var(--spacing-xs)' }}
            />
            {t('orderEntry.approval.inventoryConfirmed')}
          </AxLabel>
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>
            <input
              type="checkbox"
              checked={priceApproved}
              onChange={e => onPriceApproveChange(e.target.checked)}
              style={{ marginRight: 'var(--spacing-xs)' }}
            />
            {t('orderEntry.approval.priceApproved')}
          </AxLabel>
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel>{t('orderEntry.approval.notes')}</AxLabel>
          <textarea
            value={approvalNotes}
            onChange={e => onApprovalNotesChange(e.target.value)}
            style={{
              width: '100%',
              minHeight: '100px',
              padding: 'var(--spacing-sm)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border-default)',
              fontFamily: 'inherit',
            }}
            placeholder={t('orderEntry.approval.notesPlaceholder')}
          />
        </AxFormGroup>
      </div>
    </div>
  );
}

