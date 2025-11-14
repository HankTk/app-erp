import { AxCard, AxGrid, AxHeading3, AxParagraph } from '@ui/components';
import { I18N } from '../i18n/I18nProvider';

export function CardPage()
{
  return (
    <AxGrid>
      <AxCard elevation={0} padding="large">
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="card.elevation0" /></AxHeading3>
        <AxParagraph><I18N l10n="card.elevation0Description" /></AxParagraph>
      </AxCard>
      <AxCard elevation={1} padding="large">
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="card.elevation1" /></AxHeading3>
        <AxParagraph><I18N l10n="card.elevation1Description" /></AxParagraph>
      </AxCard>
      <AxCard elevation={2} padding="large">
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="card.elevation2" /></AxHeading3>
        <AxParagraph><I18N l10n="card.elevation2Description" /></AxParagraph>
      </AxCard>
      <AxCard elevation={3} padding="large">
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="card.elevation3" /></AxHeading3>
        <AxParagraph><I18N l10n="card.elevation3Description" /></AxParagraph>
      </AxCard>
      <AxCard elevation={4} padding="large">
        <AxHeading3 style={{ marginBottom: 'var(--spacing-sm)' }}><I18N l10n="card.elevation4" /></AxHeading3>
        <AxParagraph><I18N l10n="card.elevation4Description" /></AxParagraph>
      </AxCard>
    </AxGrid>
  );
}

