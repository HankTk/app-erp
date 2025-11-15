import {
  AxParagraph,
  AxCard,
  AxButton,
  AxHeading3,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import styled from '@emotion/styled';
import { debugProps } from '../../utils/emotionCache';

const COMPONENT_NAME = 'MasterPage';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg);
  box-sizing: border-box;
  flex: 1;
`;

const CardsContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding-top: calc(var(--spacing-4xl) + 100px);
`;

const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: var(--spacing-md);
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const MenuCardsGrid = styled.div`
  display: flex;
  flex-direction: row;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  
  @media (max-width: 700px) {
    flex-direction: column;
  }
`;

const MenuCard = styled(AxCard)`
  width: 200px;
  height: 200px;
  padding: var(--spacing-3xl);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }
`;

const MenuCardTitle = styled(AxParagraph)`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0;
  text-align: center;
`;

const masterItems = [
  { id: 'users', labelKey: 'sidebar.users' },
  { id: 'customers', labelKey: 'sidebar.customers' },
  { id: 'vendors', labelKey: 'sidebar.vendors' },
  { id: 'products', labelKey: 'sidebar.products' },
  { id: 'addresses', labelKey: 'sidebar.addresses' },
];

interface MasterPageProps {
  onPageChange: (page: string) => void;
  onNavigateBack?: () => void;
}

export function MasterPage({ onPageChange, onNavigateBack }: MasterPageProps) {
  const { t } = useI18n();

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={onNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)' }}
              >
                {t('master.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {t('master.title')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {t('master.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>
      
      <CardsContainer {...debugProps(COMPONENT_NAME, 'CardsContainer')}>
        <MenuCardsGrid {...debugProps(COMPONENT_NAME, 'MenuCardsGrid')}>
          {masterItems.map((item) => (
            <MenuCard
              key={item.id}
              elevation={1}
              onClick={() => onPageChange(item.id)}
              {...debugProps(COMPONENT_NAME, 'MenuCard')}
            >
              <MenuCardTitle {...debugProps(COMPONENT_NAME, 'MenuCardTitle')}>{t(item.labelKey)}</MenuCardTitle>
            </MenuCard>
          ))}
        </MenuCardsGrid>
      </CardsContainer>
    </PageContainer>
  );
}

