import { AxHeading3, AxParagraph, AxLabel, AxFormGroup } from '@ui/components';
import { PurchaseOrderApprovalStepProps } from './types';
import { useI18n } from '../../i18n/I18nProvider';

export function PurchaseOrderApprovalStepPage(props: PurchaseOrderApprovalStepProps) {
  const {
    approvalNotes,
    onApprovalNotesChange,
    readOnly = false,
  } = props;
  const { l10n } = useI18n();

  return (
    <div>
      <AxHeading3 style={{ marginBottom: 'var(--spacing-md)' }}>{l10n('purchaseOrderEntry.approval.title')}</AxHeading3>
      <AxParagraph style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-text-secondary)' }}>
        {l10n('purchaseOrderEntry.approval.description')}
      </AxParagraph>

      <AxFormGroup>
        <AxLabel>{l10n('purchaseOrderEntry.approval.notes')}</AxLabel>
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
          placeholder={l10n('purchaseOrderEntry.approval.notesPlaceholder')}
        />
      </AxFormGroup>
    </div>
  );
}

