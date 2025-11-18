import {
  AxCard,
  AxButton,
  AxHeading3,
  AxParagraph,
} from '@ui/components';
import { useI18n } from '../../i18n/I18nProvider';
import { debugProps } from '../../utils/emotionCache';
import {
  PageContainer,
  CardsContainer,
  HeaderCard,
  HeaderSection,
  HeaderLeft,
  HeaderRight,
  MenuCardsGrid,
  MenuCard,
  MenuCardTitle,
  MenuCardSubtitle,
} from './InventoryControlPage.styles';

const COMPONENT_NAME = 'InventoryControlPage';

type View = 'menu' | 'warehouses' | 'inventory';

interface InventoryControlPageRenderProps {
  currentView: View;
  onNavigateBack?: () => void;
  onViewChange: (view: View) => void;
}

export function InventoryControlPageRender(props: InventoryControlPageRenderProps) {
  const {
    currentView,
    onNavigateBack,
    onViewChange,
  } = props;
  
  const { l10n } = useI18n();

  return (
    <PageContainer {...debugProps(COMPONENT_NAME, 'PageContainer')}>
      <HeaderCard padding="large" {...debugProps(COMPONENT_NAME, 'HeaderCard')}>
        <HeaderSection {...debugProps(COMPONENT_NAME, 'HeaderSection')}>
          <HeaderLeft {...debugProps(COMPONENT_NAME, 'HeaderLeft')}>
            {onNavigateBack && (
              <AxButton 
                variant="secondary" 
                onClick={onNavigateBack}
                style={{ minWidth: 'auto', padding: 'var(--spacing-sm) var(--spacing-md)', marginTop: '2px' }}
              >
                {l10n('common.back')}
              </AxButton>
            )}
            <div>
              <AxHeading3 style={{ marginBottom: 'var(--spacing-xs)' }}>
                {l10n('module.inventoryControl')}
              </AxHeading3>
              <AxParagraph style={{ color: 'var(--color-text-secondary)' }}>
                {l10n('inventory.subtitle')}
              </AxParagraph>
            </div>
          </HeaderLeft>
          <HeaderRight {...debugProps(COMPONENT_NAME, 'HeaderRight')}>
          </HeaderRight>
        </HeaderSection>
      </HeaderCard>
      
      <CardsContainer {...debugProps(COMPONENT_NAME, 'CardsContainer')}>
        <MenuCardsGrid {...debugProps(COMPONENT_NAME, 'MenuCardsGrid')}>
          <MenuCard
            elevation={1}
            onClick={() => onViewChange('warehouses')}
            {...debugProps(COMPONENT_NAME, 'MenuCard')}
          >
            <MenuCardTitle {...debugProps(COMPONENT_NAME, 'MenuCardTitle')}>{l10n('inventory.warehouses')}</MenuCardTitle>
            <MenuCardSubtitle {...debugProps(COMPONENT_NAME, 'MenuCardSubtitle')}>{l10n('inventory.warehousesDescription')}</MenuCardSubtitle>
          </MenuCard>
          <MenuCard
            elevation={1}
            onClick={() => onViewChange('inventory')}
            {...debugProps(COMPONENT_NAME, 'MenuCard')}
          >
            <MenuCardTitle {...debugProps(COMPONENT_NAME, 'MenuCardTitle')}>{l10n('inventory.inventory')}</MenuCardTitle>
            <MenuCardSubtitle {...debugProps(COMPONENT_NAME, 'MenuCardSubtitle')}>{l10n('inventory.inventoryDescription')}</MenuCardSubtitle>
          </MenuCard>
        </MenuCardsGrid>
      </CardsContainer>
    </PageContainer>
  );
}

