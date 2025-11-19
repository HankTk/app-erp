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
  align-items: center;
  height: 100vh;
  width: 100vw;
  padding: var(--spacing-md);
  background-color: var(--color-background-page);
  overflow: hidden;
  box-sizing: border-box;
`;

const SetupCard = styled(AxCard)`
  width: 100%;
  max-width: 500px;
  max-height: calc(100vh - 2 * var(--spacing-md));
  padding: var(--spacing-lg) !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
`;

const SetupCardContent = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
`;

const SetupForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  flex: 1;
  min-height: 0;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const SectionTitle = styled(AxParagraph)`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  margin-bottom: var(--spacing-xs);
`;

const ErrorMessage = styled(AxParagraph)`
  color: var(--color-danger);
  margin: 0;
  font-size: var(--font-size-sm);
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-lg);
  flex-shrink: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
  flex-shrink: 0;
`;

interface InitialSetupPageProps {
  onSetupComplete: (user: any) => void;
}

export function InitialSetupPage({ onSetupComplete }: InitialSetupPageProps) {
  const { l10n } = useI18n();
  const [formData, setFormData] = useState<Record<string, any>>({
    role: 'admin', // Default to admin for first user
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getFormFields = (): { account: string[] } => {
    // Organized by sections
    return {
      account: ['userid', 'password', 'role']
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Prepare form data for API
      const dataToSave: Record<string, any> = { ...formData };
      
      // Set jsonData to null (not used in initial setup)
      dataToSave.jsonData = null;

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
  };

  return (
    <SetupContainer {...debugProps(COMPONENT_NAME, 'SetupContainer')}>
      <SetupCard {...debugProps(COMPONENT_NAME, 'SetupCard')}>
        <SetupCardContent {...debugProps(COMPONENT_NAME, 'SetupCardContent')}>
          <TitleSection {...debugProps(COMPONENT_NAME, 'TitleSection')}>
            <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>{l10n('setup.title')}</AxHeading3>
            <AxParagraph size="sm">{l10n('setup.subtitle')}</AxParagraph>
          </TitleSection>
          <SetupForm onSubmit={handleSubmit} {...debugProps(COMPONENT_NAME, 'SetupForm')}>
            {/* Account Information Section */}
            <FormSection>
              <SectionTitle>Account Information</SectionTitle>
              {(getFormFields().account || []).map((key) => {
                const label = labels[key];
                const value = formData[key] ?? '';

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

                // Handle userid
                return (
                  <AxFormGroup key={key}>
                    <AxLabel>{label}</AxLabel>
                    <AxInput
                      type="text"
                      value={value}
                      onChange={(e) => {
                        setFormData({ ...formData, [key]: e.target.value });
                      }}
                      disabled={loading}
                      fullWidth
                      required
                    />
                  </AxFormGroup>
                );
              })}
            </FormSection>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <ButtonGroup>
              <AxButton
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? l10n('setup.creating') : l10n('setup.create')}
              </AxButton>
              <AxButton
                type="button"
                variant="secondary"
                fullWidth
                disabled={loading}
                onClick={async () => {
                  if (confirm(l10n('setup.closeConfirm'))) {
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
                {l10n('setup.cancel')}
              </AxButton>
            </ButtonGroup>
        </SetupForm>
        </SetupCardContent>
      </SetupCard>
    </SetupContainer>
  );
}

