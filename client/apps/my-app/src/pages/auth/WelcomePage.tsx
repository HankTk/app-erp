import {
  AxTitle,
  AxParagraph,
  AxCard,
  AxButton,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'WelcomePage';

const HeroContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  min-height: 0;
  padding: var(--spacing-3xl) var(--spacing-lg);
  background-color: var(--color-background-page);
  transition: background-color var(--transition-base);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  position: relative;
`;

const HeroContent = styled.div`
  max-width: 1800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  padding: 0 var(--spacing-md);
`;

const HeroTitle = styled(AxTitle)`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-top: var(--spacing-4xl);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
  line-height: 1.2;
  text-align: center;
  
  @media (min-width: 768px) {
    font-size: 48px;
  }
`;

const HeroSubtitle = styled(AxParagraph)`
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: 0;
  line-height: var(--line-height-relaxed);
  text-align: center;
`;

const MenuCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 300px));
  gap: var(--spacing-lg);
  margin: var(--spacing-4xl) 0;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 var(--spacing-sm);
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, minmax(0, 300px));
  }
  
  @media (max-width: 1050px) {
    grid-template-columns: repeat(2, minmax(0, 300px));
  }
  
  @media (max-width: 700px) {
    grid-template-columns: minmax(0, 300px);
  }
`;

const MenuCard = styled(AxCard)<{ disabled?: boolean }>`
  width: 100%;
  max-width: 300px;
  padding: var(--spacing-3xl);
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  opacity: ${props => props.disabled ? 0.6 : 1};
  box-sizing: border-box;
  
  &:hover {
    ${props => !props.disabled && `
      transform: translateY(-4px);
      box-shadow: var(--shadow-xl);
    `}
  }
`;

const MenuCardTitle = styled(AxParagraph)`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-xs) 0;
  text-align: center;
`;

const MenuCardSubtitle = styled(AxParagraph)`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
`;

const menuItems = [
  { id: 'orders', labelKey: 'sidebar.customerOrder', subtitleKey: null, disabled: false },
  { id: 'inventory-control', labelKey: 'module.inventoryControl', subtitleKey: null, disabled: false },
  { id: 'purchase-order', labelKey: 'module.purchaseOrder', subtitleKey: null, disabled: false },
  { id: 'accounts-receivable', labelKey: 'module.accountsReceivable', subtitleKey: null, disabled: false },
  { id: 'general-ledger', labelKey: 'module.generalLedger', subtitleKey: null, disabled: false },
  { id: 'accounts-payable', labelKey: 'module.accountsPayable', subtitleKey: null, disabled: false },
  { id: 'rma', labelKey: 'module.rma', subtitleKey: null, disabled: false },
  { id: 'shop-floor-control', labelKey: 'module.shopFloorControl', subtitleKey: null, disabled: false },
  { id: 'master', labelKey: 'sidebar.master', subtitleKey: null, disabled: false },
];

interface WelcomePageProps {
  user: any;
  onPageChange: (page: string) => void;
}

export function WelcomePage({ user, onPageChange }: WelcomePageProps) {
  const { l10n } = useI18n();
  const userName = user.firstName || user.userid || 'User';
  const welcomeMessage = l10n('welcome.message').replace('{name}', userName);

  return (
    <HeroContainer {...debugProps(COMPONENT_NAME, 'HeroContainer')}>
        <HeroContent {...debugProps(COMPONENT_NAME, 'HeroContent')}>
        <HeroTitle {...debugProps(COMPONENT_NAME, 'HeroTitle')}>{l10n('welcome.title')}</HeroTitle>
        <HeroSubtitle {...debugProps(COMPONENT_NAME, 'HeroSubtitle')}>{welcomeMessage}</HeroSubtitle>
        
        <MenuCardsGrid {...debugProps(COMPONENT_NAME, 'MenuCardsGrid')}>
          {menuItems.map((item) => (
            <MenuCard
              key={item.id}
              elevation={1}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled) {
                  onPageChange(item.id);
                }
              }}
              {...debugProps(COMPONENT_NAME, 'MenuCard')}
            >
              <MenuCardTitle {...debugProps(COMPONENT_NAME, 'MenuCardTitle')}>{l10n(item.labelKey)}</MenuCardTitle>
              {item.subtitleKey && (
                <MenuCardSubtitle {...debugProps(COMPONENT_NAME, 'MenuCardSubtitle')}>{l10n(item.subtitleKey)}</MenuCardSubtitle>
              )}
            </MenuCard>
          ))}
        </MenuCardsGrid>
        </HeroContent>
      </HeroContainer>
  );
}

