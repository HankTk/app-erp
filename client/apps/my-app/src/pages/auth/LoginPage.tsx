import { useState } from 'react';
import {
  AxCard,
  AxInput,
  AxLabel,
  AxButton,
  AxFormGroup,
  AxHeading3,
  AxParagraph,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { login } from '../../api/userApi';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'LoginPage';

const LoginContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: var(--spacing-lg);
  background-color: var(--color-background-page);
`;

const LoginCard = styled(AxCard)`
  width: 100%;
  max-width: 400px;
  padding: var(--spacing-2xl) !important;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const ErrorMessage = styled(AxParagraph)`
  color: var(--color-text-error);
  margin: 0;
  font-size: var(--font-size-sm);
`;

const TitleSection = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-xl);
`;

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { t } = useI18n();
  const [userid, setUserid] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login(userid, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer {...debugProps(COMPONENT_NAME, 'LoginContainer')}>
      <LoginCard {...debugProps(COMPONENT_NAME, 'LoginCard')}>
        <TitleSection {...debugProps(COMPONENT_NAME, 'TitleSection')}>
          <AxHeading3>{t('login.title')}</AxHeading3>
          <AxParagraph>{t('login.subtitle')}</AxParagraph>
        </TitleSection>
        <LoginForm onSubmit={handleSubmit} {...debugProps(COMPONENT_NAME, 'LoginForm')}>
          <AxFormGroup>
            <AxLabel htmlFor="userid">{t('login.userid')}</AxLabel>
            <AxInput
              id="userid"
              type="text"
              value={userid}
              onChange={(e) => setUserid(e.target.value)}
              placeholder={t('login.useridPlaceholder')}
              fullWidth
              required
              autoFocus
              disabled={loading}
            />
          </AxFormGroup>
          <AxFormGroup>
            <AxLabel htmlFor="password">{t('login.password')}</AxLabel>
            <AxInput
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              fullWidth
              required
              disabled={loading}
            />
          </AxFormGroup>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <AxButton
            type="submit"
            variant="primary"
            fullWidth
            disabled={loading || !userid || !password}
          >
            {loading ? t('login.loading') : t('login.submit')}
          </AxButton>
        </LoginForm>
      </LoginCard>
    </LoginContainer>
  );
}

