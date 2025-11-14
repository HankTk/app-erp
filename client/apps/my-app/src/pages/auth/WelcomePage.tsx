import {
  AxTitle,
  AxParagraph,
  AxCard,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import styled from 'styled-components';

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
  { id: 'purchase-requisition', labelKey: 'module.purchaseRequisition', subtitleKey: 'module.comingSoon', disabled: true },
  { id: 'inventory-control', labelKey: 'module.inventoryControl', subtitleKey: 'module.comingSoon', disabled: true },
  { id: 'shop', labelKey: 'module.shop', subtitleKey: 'module.comingSoon', disabled: true },
  { id: 'rma', labelKey: 'module.rma', subtitleKey: 'module.comingSoon', disabled: true },
  { id: 'accounts-receivable', labelKey: 'module.accountsReceivable', subtitleKey: 'module.comingSoon', disabled: true },
  { id: 'accounts-payable', labelKey: 'module.accountsPayable', subtitleKey: 'module.comingSoon', disabled: true },
  { id: 'general-ledger', labelKey: 'module.generalLedger', subtitleKey: 'module.comingSoon', disabled: true },
];

interface WelcomePageProps {
  user: any;
  onPageChange: (page: string) => void;
}

export function WelcomePage({ user, onPageChange }: WelcomePageProps) {
  const { t } = useI18n();
  const userName = user.firstName || user.userid || 'User';
  const welcomeMessage = t('welcome.message').replace('{name}', userName);

  return (
    <HeroContainer>
      <HeroContent>
        <HeroTitle>{t('welcome.title')}</HeroTitle>
        <HeroSubtitle>{welcomeMessage}</HeroSubtitle>
        
        <MenuCardsGrid>
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
            >
              <MenuCardTitle>{t(item.labelKey)}</MenuCardTitle>
              {item.subtitleKey && (
                <MenuCardSubtitle>{t(item.subtitleKey)}</MenuCardSubtitle>
              )}
            </MenuCard>
          ))}
        </MenuCardsGrid>
      </HeroContent>
    </HeroContainer>
  );
}

