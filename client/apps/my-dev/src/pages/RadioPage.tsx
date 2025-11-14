import { useState } from 'react';
import { AxCard, AxRadio, AxFormGroup } from '@ui/components';
import { I18N, useI18n } from '../i18n/I18nProvider';

export function RadioPage()
{
  const { l10n } = useI18n();
  const [radioValue, setRadioValue] = useState('option1');
  const [radioValue2, setRadioValue2] = useState('option1');

  return (
    <>
      <AxCard padding="large" maxWidth="500px" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-xl)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          <I18N l10n="radio.basic" />
        </h3>
        <AxFormGroup>
          <AxRadio
            id="radio-option1"
            name="radio-group-1"
            label={l10n('radio.option1')}
            value="option1"
            checked={radioValue === 'option1'}
            onChange={(e) => setRadioValue(e.target.value)}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxRadio
            id="radio-option2"
            name="radio-group-1"
            label={l10n('radio.option2')}
            value="option2"
            checked={radioValue === 'option2'}
            onChange={(e) => setRadioValue(e.target.value)}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxRadio
            id="radio-option3"
            name="radio-group-1"
            label={l10n('radio.option3')}
            value="option3"
            checked={radioValue === 'option3'}
            onChange={(e) => setRadioValue(e.target.value)}
          />
        </AxFormGroup>
        <p style={{ marginTop: 'var(--spacing-md)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          {l10n('radio.selected')}: {radioValue}
        </p>
      </AxCard>

      <AxCard padding="large" maxWidth="500px" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h3 style={{ marginBottom: 'var(--spacing-xl)', fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
          <I18N l10n="radio.states" />
        </h3>
        <AxFormGroup>
          <AxRadio
            id="radio-normal"
            name="radio-group-2"
            label={l10n('radio.normal')}
            value="option1"
            checked={radioValue2 === 'option1'}
            onChange={(e) => setRadioValue2(e.target.value)}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxRadio
            id="radio-error"
            name="radio-group-2"
            label={l10n('radio.errorState')}
            value="option2"
            error
            checked={false}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxRadio
            id="radio-disabled"
            name="radio-group-2"
            label={l10n('radio.disabled')}
            value="option3"
            disabled
            checked={false}
          />
        </AxFormGroup>
        <AxFormGroup>
          <AxRadio
            id="radio-disabled-checked"
            name="radio-group-2"
            label={l10n('radio.disabledChecked')}
            value="option4"
            disabled
            checked
          />
        </AxFormGroup>
      </AxCard>
    </>
  );
}

