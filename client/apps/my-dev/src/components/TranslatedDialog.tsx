import { AxDialog, AxDialogProps } from '@ui/components';
import { useI18n } from '../i18n/I18nProvider';

export function TranslatedDialog(props: Omit<AxDialogProps, 'okButtonText'>) {
  const { l10n } = useI18n();
  return <AxDialog {...props} okButtonText={l10n('dialog.ok')} />;
}

