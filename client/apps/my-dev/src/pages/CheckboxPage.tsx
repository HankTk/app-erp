import { useState } from 'react';
import { AxCard, AxCheckbox, AxFormGroup } from '@ui/components';
import { I18N, useI18n } from '../i18n/I18nProvider';

export function CheckboxPage()
{
  const { l10n } = useI18n();
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(true);
  const [checkbox3, setCheckbox3] = useState(false);
  const [checkbox4, setCheckbox4] = useState(false);

  return (
    <>
      <AxCard padding="large" maxWidth="500px" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-xl)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          <I18N l10n="checkbox.basic" />
        </h3>
        <AxFormGroup>
          <AxCheckbox
            id="checkbox-basic-1"
            label={l10n('checkbox.option1')}
            checked={checkbox1}
            onChange={(e) => setCheckbox1(e.target.checked)}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxCheckbox
            id="checkbox-basic-2"
            label={l10n('checkbox.option2')}
            checked={checkbox2}
            onChange={(e) => setCheckbox2(e.target.checked)}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxCheckbox
            id="checkbox-basic-3"
            label={l10n('checkbox.option3')}
            checked={checkbox3}
            onChange={(e) => setCheckbox3(e.target.checked)}
          />
        </AxFormGroup>
      </AxCard>

      <AxCard padding="large" maxWidth="500px" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-xl)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          <I18N l10n="checkbox.states" />
        </h3>
        <AxFormGroup>
          <AxCheckbox
            id="checkbox-normal"
            label={l10n('checkbox.normal')}
            checked={checkbox4}
            onChange={(e) => setCheckbox4(e.target.checked)}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxCheckbox
            id="checkbox-error"
            label={l10n('checkbox.errorState')}
            error
            checked={false}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxCheckbox
            id="checkbox-disabled"
            label={l10n('checkbox.disabled')}
            disabled
            checked={false}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxCheckbox
            id="checkbox-disabled-checked"
            label={l10n('checkbox.disabledChecked')}
            disabled
            checked
          />
        </AxFormGroup>
      </AxCard>
    </>
  );
}

