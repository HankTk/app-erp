import { AxButton, AxCard, AxInput, AxFormGroup, AxLabel, AxButtonGroup, AxHeading3 } from '@ui/components';
import { I18N, useI18n } from '../i18n/I18nProvider';

export function CombinationPage()
{
  const { l10n } = useI18n();

  return (
    <AxCard elevation={2} padding="large">
      <AxHeading3 style={{ marginBottom: 'var(--spacing-lg)', fontSize: 'var(--font-size-xl)' }}>
        <I18N l10n="combination.loginForm" />
      </AxHeading3>
      <AxFormGroup>
        <AxLabel htmlFor="email"><I18N l10n="combination.emailAddress" /></AxLabel>
        <AxInput
          id="email"
          type="email"
          placeholder={l10n('combination.emailPlaceholder')}
          fullWidth
        />
      </AxFormGroup>
      <AxFormGroup>
        <AxLabel htmlFor="password"><I18N l10n="combination.password" /></AxLabel>
        <AxInput
          id="password"
          type="password"
          placeholder={l10n('combination.passwordPlaceholder')}
          fullWidth
        />
      </AxFormGroup>
      <AxButtonGroup>
        <AxButton variant="primary" fullWidth>
          <I18N l10n="combination.login" />
        </AxButton>
        <AxButton variant="secondary" fullWidth>
          <I18N l10n="combination.cancel" />
        </AxButton>
      </AxButtonGroup>
    </AxCard>
  );
}

