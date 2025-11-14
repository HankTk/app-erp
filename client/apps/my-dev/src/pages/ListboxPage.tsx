import { useState, useMemo } from 'react';
import { AxCard, AxListbox, AxFormGroup, AxLabel, ListboxOption } from '@ui/components';
import { I18N, useI18n } from '../i18n/I18nProvider';

export function ListboxPage() {
  const { l10n } = useI18n();
  
  const sampleOptions: ListboxOption[] = useMemo(() => [
    { value: 'option1', label: l10n('listbox.option1') },
    { value: 'option2', label: l10n('listbox.option2') },
    { value: 'option3', label: l10n('listbox.option3') },
    { value: 'option4', label: l10n('listbox.option4') },
    { value: 'option5', label: l10n('listbox.option5') },
  ], [l10n]);

  const searchableOptions: ListboxOption[] = useMemo(() => [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' },
    { value: 'fig', label: 'Fig' },
    { value: 'grape', label: 'Grape' },
    { value: 'honeydew', label: 'Honeydew' },
    { value: 'kiwi', label: 'Kiwi' },
    { value: 'lemon', label: 'Lemon' },
    { value: 'mango', label: 'Mango' },
    { value: 'orange', label: 'Orange' },
  ], []);

  const sampleOptionsWithDisabled: ListboxOption[] = useMemo(() => [
    { value: 'option1', label: l10n('listbox.option1') },
    { value: 'option2', label: l10n('listbox.option2'), disabled: true },
    { value: 'option3', label: l10n('listbox.option3') },
    { value: 'option4', label: l10n('listbox.option4'), disabled: true },
    { value: 'option5', label: l10n('listbox.option5') },
  ], [l10n]);
  const [singleValue, setSingleValue] = useState<string>('');
  const [multipleValue, setMultipleValue] = useState<string[]>([]);
  const [errorValue, setErrorValue] = useState<string>('');
  const [disabledValue, setDisabledValue] = useState<string>('');
  const [searchableValue, setSearchableValue] = useState<string>('');
  const [searchableMultipleValue, setSearchableMultipleValue] = useState<string[]>([]);

  return (
    <>
      <AxCard padding="large" maxWidth="500px" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <AxFormGroup>
          <AxLabel><I18N l10n="listbox.basic" /></AxLabel>
          <AxListbox
            options={sampleOptions}
            value={singleValue}
            onChange={(value) => setSingleValue(value as string)}
            placeholder={l10n('listbox.selectPlaceholder')}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel><I18N l10n="listbox.multiple" /></AxLabel>
          <AxListbox
            options={sampleOptions}
            value={multipleValue}
            onChange={(value) => setMultipleValue(value as string[])}
            multiple
            placeholder={l10n('listbox.selectPlaceholder')}
            fullWidth
          />
          {multipleValue.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              {l10n('listbox.selected')}: {multipleValue.join(', ')}
            </div>
          )}
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel><I18N l10n="listbox.errorState" /></AxLabel>
          <AxListbox
            options={sampleOptions}
            value={errorValue}
            onChange={(value) => setErrorValue(value as string)}
            error
            placeholder={l10n('listbox.selectPlaceholder')}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel><I18N l10n="listbox.disabled" /></AxLabel>
          <AxListbox
            options={sampleOptions}
            value={disabledValue}
            onChange={(value) => setDisabledValue(value as string)}
            disabled
            placeholder={l10n('listbox.selectPlaceholder')}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel><I18N l10n="listbox.withDisabledOptions" /></AxLabel>
          <AxListbox
            options={sampleOptionsWithDisabled}
            value={singleValue}
            onChange={(value) => setSingleValue(value as string)}
            placeholder={l10n('listbox.selectPlaceholder')}
            fullWidth
          />
        </AxFormGroup>
      </AxCard>

      <AxCard padding="large" maxWidth="500px" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <AxFormGroup>
          <AxLabel><I18N l10n="listbox.searchable" /></AxLabel>
          <AxListbox
            options={searchableOptions}
            value={searchableValue}
            onChange={(value) => setSearchableValue(value as string)}
            searchable
            searchPlaceholder={l10n('listbox.searchPlaceholder')}
            placeholder={l10n('listbox.selectPlaceholder')}
            noResultsText={l10n('listbox.noResults')}
            fullWidth
          />
        </AxFormGroup>

        <AxFormGroup>
          <AxLabel><I18N l10n="listbox.searchableMultiple" /></AxLabel>
          <AxListbox
            options={searchableOptions}
            value={searchableMultipleValue}
            onChange={(value) => setSearchableMultipleValue(value as string[])}
            searchable
            multiple
            searchPlaceholder={l10n('listbox.searchPlaceholder')}
            placeholder={l10n('listbox.selectPlaceholder')}
            noResultsText={l10n('listbox.noResults')}
            fullWidth
          />
          {searchableMultipleValue.length > 0 && (
            <div style={{ marginTop: 'var(--spacing-sm)', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              {l10n('listbox.selected')}: {searchableMultipleValue.join(', ')}
            </div>
          )}
        </AxFormGroup>
      </AxCard>

      <AxCard padding="large" maxWidth="500px" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <AxFormGroup>
          <AxLabel><I18N l10n="listbox.sizes" /></AxLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <AxLabel style={{ marginBottom: 'var(--spacing-xs)' }}>{l10n('listbox.small')}</AxLabel>
              <AxListbox
                options={sampleOptions}
                value={singleValue}
                onChange={(value) => setSingleValue(value as string)}
                size="small"
                placeholder={l10n('listbox.selectPlaceholder')}
                fullWidth
              />
            </div>
            <div>
              <AxLabel style={{ marginBottom: 'var(--spacing-xs)' }}>{l10n('listbox.medium')}</AxLabel>
              <AxListbox
                options={sampleOptions}
                value={singleValue}
                onChange={(value) => setSingleValue(value as string)}
                size="medium"
                placeholder={l10n('listbox.selectPlaceholder')}
                fullWidth
              />
            </div>
            <div>
              <AxLabel style={{ marginBottom: 'var(--spacing-xs)' }}>{l10n('listbox.large')}</AxLabel>
              <AxListbox
                options={sampleOptions}
                value={singleValue}
                onChange={(value) => setSingleValue(value as string)}
                size="large"
                placeholder={l10n('listbox.selectPlaceholder')}
                fullWidth
              />
            </div>
          </div>
        </AxFormGroup>
      </AxCard>
    </>
  );
}

