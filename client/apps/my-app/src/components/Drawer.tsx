import styled from '@emotion/styled';
import { AxButton, AxHeading3, AxParagraph } from '@ui/components';
import { useI18n } from '../i18n/I18nProvider';
import { debugProps } from '../utils/emotionCache';

const COMPONENT_NAME = 'Drawer';

const AxOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 99;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity var(--transition-base), visibility var(--transition-base);
`;

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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
  padding-top: calc(44px + var(--spacing-lg));
`;

const AxDrawerTitleWrapper = styled.div`
  flex: 1;
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
  const { l10n, language, setLanguage } = useI18n();

  return (
    <>
      <AxOverlay $isOpen={isOpen} onClick={onToggle} {...debugProps(COMPONENT_NAME, 'AxOverlay')} />
      <AxDrawer $isOpen={isOpen} {...debugProps(COMPONENT_NAME, 'AxDrawer')}>
        <AxDrawerHeader {...debugProps(COMPONENT_NAME, 'AxDrawerHeader')}>
          <AxDrawerTitleWrapper {...debugProps(COMPONENT_NAME, 'AxDrawerTitleWrapper')}>
            <AxDrawerTitle {...debugProps(COMPONENT_NAME, 'AxDrawerTitle')}>{l10n('app.settings')}</AxDrawerTitle>
          </AxDrawerTitleWrapper>
        </AxDrawerHeader>
        <AxDrawerContent {...debugProps(COMPONENT_NAME, 'AxDrawerContent')}>
          <AxDrawerSection {...debugProps(COMPONENT_NAME, 'AxDrawerSection')}>
            <AxParagraph>{l10n('app.theme')}</AxParagraph>
            <AxButton onClick={onThemeChange} variant="secondary" fullWidth>
              {theme === 'light' ? l10n('app.switchToDark') : l10n('app.switchToLight')}
            </AxButton>
          </AxDrawerSection>
          <AxDrawerSection {...debugProps(COMPONENT_NAME, 'AxDrawerSection')}>
            <AxParagraph>{l10n('app.language')}</AxParagraph>
            <AxLanguageButtons {...debugProps(COMPONENT_NAME, 'AxLanguageButtons')}>
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

