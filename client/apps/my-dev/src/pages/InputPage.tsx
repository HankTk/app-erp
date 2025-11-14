import { useState } from 'react';
import { AxButton, AxCard, AxInput, AxFormGroup, AxLabel } from '@ui/components';
import { I18N, useI18n } from '../i18n/I18nProvider';

export function InputPage()
{
  const { l10n } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const [errorInput, setErrorInput] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [telValue, setTelValue] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [timeValue, setTimeValue] = useState('');
  const [datetimeValue, setDatetimeValue] = useState('');
  const [weekValue, setWeekValue] = useState('');
  const [monthValue, setMonthValue] = useState('');
  const [colorValue, setColorValue] = useState('#000000');
  const [rangeValue, setRangeValue] = useState('50');

  return (
    <>
      <AxCard padding="large" maxWidth="500px">
        <AxFormGroup>
          <AxLabel htmlFor="normal-input"><I18N l10n="input.normal" /></AxLabel>
          <AxInput
            id="normal-input"
            type="text"
            placeholder={l10n('input.enterText')}
            value={inputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="error-input"><I18N l10n="input.errorState" /></AxLabel>
          <AxInput
            id="error-input"
            type="text"
            placeholder={l10n('input.errorOccurred')}
            value={errorInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setErrorInput(e.target.value)}
            error
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="disabled-input"><I18N l10n="input.disabled" /></AxLabel>
          <AxInput
            id="disabled-input"
            type="text"
            placeholder={l10n('input.disabledPlaceholder')}
            disabled
            fullWidth
          />
        </AxFormGroup>

        <AxButton variant="primary" fullWidth>
          <I18N l10n="input.submit" />
        </AxButton>
      </AxCard>

      <AxCard padding="large" maxWidth="500px" style={{ marginTop: 'var(--spacing-2xl)' }}>
        <h2><I18N l10n="input.inputTypes" /></h2>
        <p><I18N l10n="input.inputTypesDescription" /></p>

        <AxFormGroup>
          <AxLabel htmlFor="text-input"><I18N l10n="input.text" /></AxLabel>
          <AxInput
            id="text-input"
            type="text"
            placeholder={l10n('input.textPlaceholder')}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="email-input"><I18N l10n="input.email" /></AxLabel>
          <AxInput
            id="email-input"
            type="email"
            placeholder={l10n('input.emailPlaceholder')}
            value={emailValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmailValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="password-input"><I18N l10n="input.password" /></AxLabel>
          <AxInput
            id="password-input"
            type="password"
            placeholder={l10n('input.passwordPlaceholder')}
            value={passwordValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPasswordValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="number-input"><I18N l10n="input.number" /></AxLabel>
          <AxInput
            id="number-input"
            type="number"
            placeholder={l10n('input.numberPlaceholder')}
            value={numberValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNumberValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="tel-input"><I18N l10n="input.tel" /></AxLabel>
          <AxInput
            id="tel-input"
            type="tel"
            placeholder={l10n('input.telPlaceholder')}
            value={telValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="url-input"><I18N l10n="input.url" /></AxLabel>
          <AxInput
            id="url-input"
            type="url"
            placeholder={l10n('input.urlPlaceholder')}
            value={urlValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrlValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="search-input"><I18N l10n="input.search" /></AxLabel>
          <AxInput
            id="search-input"
            type="search"
            placeholder={l10n('input.searchPlaceholder')}
            value={searchValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="date-input"><I18N l10n="input.date" /></AxLabel>
          <AxInput
            id="date-input"
            type="date"
            value={dateValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="time-input"><I18N l10n="input.time" /></AxLabel>
          <AxInput
            id="time-input"
            type="time"
            value={timeValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTimeValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="datetime-input"><I18N l10n="input.datetime" /></AxLabel>
          <AxInput
            id="datetime-input"
            type="datetime-local"
            value={datetimeValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDatetimeValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="week-input"><I18N l10n="input.week" /></AxLabel>
          <AxInput
            id="week-input"
            type="week"
            value={weekValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeekValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="month-input"><I18N l10n="input.month" /></AxLabel>
          <AxInput
            id="month-input"
            type="month"
            value={monthValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonthValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="color-input"><I18N l10n="input.color" /></AxLabel>
          <AxInput
            id="color-input"
            type="color"
            value={colorValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColorValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="range-input"><I18N l10n="input.range" />: {rangeValue}</AxLabel>
          <AxInput
            id="range-input"
            type="range"
            min="0"
            max="100"
            value={rangeValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRangeValue(e.target.value)}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel htmlFor="file-input"><I18N l10n="input.file" /></AxLabel>
          <AxInput
            id="file-input"
            type="file"
            fullWidth
          />
        </AxFormGroup>
      </AxCard>
    </>
  );
}

