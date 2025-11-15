import { useState } from 'react';
import {
  AxCard,
  AxInput,
  AxLabel,
  AxButton,
  AxFormGroup,
  AxHeading3,
  AxParagraph,
  AxListbox,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { createUser } from '../../api/userApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'InitialSetupPage';

const SetupContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: var(--spacing-lg);
  background-color: var(--color-background-page);
  overflow-y: auto;
`;

const SetupCard = styled(AxCard)`
  width: 100%;
  max-width: 500px;
  padding: var(--spacing-2xl) !important;
  margin: var(--spacing-lg) 0;
  max-height: calc(100vh - 2 * var(--spacing-lg));
  overflow-y: auto;
`;

const SetupForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const ErrorMessage = styled(AxParagraph)`
  color: var(--color-danger);
  margin: 0;
  font-size: var(--font-size-sm);
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-xl);
`;

const StyledTextarea = styled.textarea`
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  padding: var(--spacing-sm) calc(var(--spacing-sm) + 6px);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  width: 100%;
  min-height: 120px;
  resize: vertical;
  color: var(--color-text-primary);
  background-color: var(--color-background-default);

  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: var(--shadow-focus-sm);
  }

  &:disabled {
    background-color: var(--color-background-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

interface InitialSetupPageProps {
  onSetupComplete: (user: any) => void;
}

export function InitialSetupPage({ onSetupComplete }: InitialSetupPageProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<Record<string, any>>({
    role: 'admin', // Default to admin for first user
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFormFields = () => {
    return ['userid', 'password', 'role', 'firstName', 'lastName', 'email', 'jsonData'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Prepare form data for API
      const dataToSave: Record<string, any> = { ...formData };
      
      // Parse jsonData from string to object if it's a valid JSON string
      if (dataToSave.jsonData) {
        if (typeof dataToSave.jsonData === 'string' && dataToSave.jsonData.trim() !== '') {
          try {
            dataToSave.jsonData = JSON.parse(dataToSave.jsonData);
          } catch (e) {
            setError('Invalid JSON format in JSON Data field. Please check your JSON syntax.');
            setLoading(false);
            return;
          }
        }
      } else {
        dataToSave.jsonData = null;
      }

      const createdUser = await createUser(dataToSave);
      // Don't return password in response
      createdUser.password = null;
      onSetupComplete(createdUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const labels: Record<string, string> = {
    userid: 'User ID',
    password: 'Password',
    role: 'Role',
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    jsonData: 'JSON Data',
  };

  return (
    <SetupContainer {...debugProps(COMPONENT_NAME, 'SetupContainer')}>
      <SetupCard {...debugProps(COMPONENT_NAME, 'SetupCard')}>
        <TitleSection {...debugProps(COMPONENT_NAME, 'TitleSection')}>
          <AxHeading3>{t('setup.title')}</AxHeading3>
          <AxParagraph>{t('setup.subtitle')}</AxParagraph>
        </TitleSection>
        <SetupForm onSubmit={handleSubmit} {...debugProps(COMPONENT_NAME, 'SetupForm')}>
          {getFormFields().map((key) => {
            const label = labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
            const value = formData[key] ?? '';

            // Handle jsonData as textarea
            if (key === 'jsonData') {
              return (
                <AxFormGroup key={key}>
                  <AxLabel>{label}</AxLabel>
                  <StyledTextarea
                    value={value}
                    onChange={(e) => {
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    placeholder='{"key": "value"}'
                    disabled={loading}
                    {...debugProps(COMPONENT_NAME, 'StyledTextarea')}
                  />
                </AxFormGroup>
              );
            }

            // Handle role as listbox
            if (key === 'role') {
              const roleOptions = [
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
              ];
              return (
                <AxFormGroup key={key}>
                  <AxLabel>{label}</AxLabel>
                  <AxListbox
                    options={roleOptions}
                    value={value || 'admin'}
                    onChange={(selectedValue) => {
                      setFormData({ ...formData, [key]: selectedValue || 'admin' });
                    }}
                    placeholder="Select role"
                    disabled={loading}
                    fullWidth
                  />
                </AxFormGroup>
              );
            }

            // Handle password as password input
            if (key === 'password') {
              return (
                <AxFormGroup key={key}>
                  <AxLabel>{label}</AxLabel>
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => {
                      setFormData({ ...formData, [key]: e.target.value });
                    }}
                    placeholder="Enter password"
                    autoComplete="new-password"
                    disabled={loading}
                    required
                    style={{
                      fontFamily: 'var(--font-family-base)',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-normal)',
                      lineHeight: 'var(--line-height-normal)',
                      padding: 'var(--spacing-sm) calc(var(--spacing-sm) + 6px)',
                      border: '2px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                      transition: 'border-color var(--transition-base), box-shadow var(--transition-base)',
                      width: '100%',
                      color: 'var(--color-text-primary)',
                      backgroundColor: 'var(--color-background-default)',
                      boxSizing: 'border-box',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-border-focus)';
                      e.target.style.boxShadow = 'var(--shadow-focus-sm)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--color-border-default)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </AxFormGroup>
              );
            }

            // Handle other fields
            let inputType = 'text';
            if (key === 'email') {
              inputType = 'email';
            }

            return (
              <AxFormGroup key={key}>
                <AxLabel>{label}</AxLabel>
                <AxInput
                  type={inputType}
                  value={value}
                  onChange={(e) => {
                    setFormData({ ...formData, [key]: e.target.value });
                  }}
                  disabled={loading}
                  fullWidth
                  required={key !== 'jsonData'}
                />
              </AxFormGroup>
            );
          })}
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', flexDirection: 'column' }}>
            <AxButton
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? t('setup.creating') : t('setup.create')}
            </AxButton>
            <AxButton
              type="button"
              variant="secondary"
              fullWidth
              disabled={loading}
              onClick={async () => {
                if (confirm(t('setup.closeConfirm'))) {
                  // Check if running in Electron
                  if (window.electronAPI) {
                    // Close Electron app
                    await window.electronAPI.closeApp();
                  } else {
                    // Fallback for browser: try to close window
                    if (window.opener) {
                      window.close();
                    } else {
                      window.close();
                      // If window.close() doesn't work, navigate to about:blank
                      setTimeout(() => {
                        window.location.href = 'about:blank';
                      }, 100);
                    }
                  }
                }
              }}
            >
              {t('setup.cancel')}
            </AxButton>
          </div>
        </SetupForm>
      </SetupCard>
    </SetupContainer>
  );
}

