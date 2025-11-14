import styled from 'styled-components';
import { AxButton, AxHeading3, AxParagraph } from '@ui/components';
import { useI18n } from '../i18n/I18nProvider';

const AxDrawer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 320px;
  background-color: var(--color-background-default);
  border-left: 1px solid var(--color-border-default);
  padding: var(--spacing-xl);
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(100%)')};
  transition: transform var(--transition-base);
  z-index: 100;
  overflow-y: auto;
  box-shadow: ${({ $isOpen }) => ($isOpen ? 'var(--shadow-lg)' : 'none')};
`;

const AxDrawerHeader = styled.div`
  margin-bottom: var(--spacing-2xl);
`;

const AxDrawerTitle = styled(AxHeading3)`
  margin-bottom: var(--spacing-sm);
`;

const AxDrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
`;

const AxDrawerSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
`;

const AxDrawerToggle = styled(AxButton)`
  position: fixed;
  top: var(--spacing-xl);
  right: var(--spacing-xl);
  z-index: 101;
`;

const AxLanguageButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

interface DrawerProps
{
  isOpen: boolean;
  onToggle: () => void;
  theme: 'light' | 'dark';
  onThemeChange: () => void;
}

export function Drawer({ isOpen, onToggle, theme, onThemeChange }: DrawerProps)
{
  const { t, language, setLanguage } = useI18n();

  return (
    <>
      <AxDrawerToggle onClick={onToggle} variant="secondary">
        {isOpen ? '✕' : '⚙️'}
      </AxDrawerToggle>
      <AxDrawer $isOpen={isOpen}>
        <AxDrawerHeader>
          <AxDrawerTitle>{t('app.settings')}</AxDrawerTitle>
        </AxDrawerHeader>
        <AxDrawerContent>
          <AxDrawerSection>
            <AxParagraph>{t('app.theme')}</AxParagraph>
            <AxButton onClick={onThemeChange} variant="secondary" fullWidth>
              {theme === 'light' ? t('app.switchToDark') : t('app.switchToLight')}
            </AxButton>
          </AxDrawerSection>
          <AxDrawerSection>
            <AxParagraph>{t('app.language')}</AxParagraph>
            <AxLanguageButtons>
              <AxButton
                onClick={() => setLanguage('en')}
                variant={language === 'en' ? 'primary' : 'secondary'}
                style={{ flex: 1 }}
              >
                English
              </AxButton>
              <AxButton
                onClick={() => setLanguage('ja')}
                variant={language === 'ja' ? 'primary' : 'secondary'}
                style={{ flex: 1 }}
              >
                日本語
              </AxButton>
            </AxLanguageButtons>
          </AxDrawerSection>
        </AxDrawerContent>
      </AxDrawer>
    </>
  );
}

