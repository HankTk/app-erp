import { AxHeading3, AxParagraph, AxLabel, AxFormGroup } from '@ui/components';
import { PurchaseOrderApprovalStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function PurchaseOrderApprovalStepPage(props: PurchaseOrderApprovalStepProps) {
  const {
    approvalNotes,
    onApprovalNotesChange,
    readOnly = false,
  } = props;
  const { t } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{t('purchaseOrderEntry.approval.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {t('purchaseOrderEntry.approval.description')}
      </AxParagraph>

      <AxFormGroup>
        <AxLabel>{t('purchaseOrderEntry.approval.notes')}</AxLabel>
        <textarea
          value={approvalNotes}
          onChange={e => onApprovalNotesChange(e.target.value)}
          disabled={readOnly}
          style={{
            width: '100%',
            minHeight: '100px',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-default)',
            fontFamily: 'inherit',
          }}
          placeholder={t('purchaseOrderEntry.approval.notesPlaceholder')}
        />
      </AxFormGroup>
    </div>
  );
}

