import { AxDialog, AxDialogProps } from '@ui/components';
import { useI18n } from '../i18n/I18nProvider';

export function TranslatedDialog(props: Omit<AxDialogProps, 'okButtonText'>) {
  const { t } = useI18n();
  return <AxDialog {...props} okButtonText={t('dialog.ok')} />;
}

