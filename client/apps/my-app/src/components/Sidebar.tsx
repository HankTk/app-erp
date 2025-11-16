import styled from '@emotion/styled';
import { AxButton } from '@ui/components';
import { useI18n } from '../i18n/I18nProvider';
import { debugProps } from '../utils/emotionCache';

const COMPONENT_NAME = 'Sidebar';

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

const AxSidebar = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 280px;
  background-color: var(--color-background-default);
  border-right: 1px solid var(--color-border-default);
  padding: var(--spacing-xl);
  z-index: 100;
  overflow-y: auto;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform var(--transition-base);
  box-shadow: ${({ $isOpen }) => ($isOpen ? 'var(--shadow-lg)' : 'none')};
`;

const AxSidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-2xl);
  padding-top: calc(44px + var(--spacing-lg));
`;

const AxSidebarTitleWrapper = styled.div`
  flex: 1;
`;

const AxSidebarTitle = styled.h2`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
`;

const AxSidebarSubtitle = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const AxMenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const AxMenuItem = styled.li`
  margin-bottom: var(--spacing-xs);
`;

const AxMenuButton = styled(AxButton)<{ $isActive: boolean; $disabled?: boolean }>`
  width: 100%;
  justify-content: flex-start;
  text-align: left;
  background-color: ${({ $isActive }) =>
  {
    return $isActive ? 'var(--color-primary)' : 'transparent';
  }};
  color: ${({ $isActive, $disabled }) =>
  {
    if ($disabled) return 'var(--color-text-secondary)';
    return $isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)';
  }};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  &:hover
  {
    background-color: ${({ $isActive, $disabled }) =>
    {
      if ($disabled) return 'transparent';
      return $isActive ? 'var(--color-primary-hover)' : 'var(--color-background-disabled)';
    }};
  }
`;

const AxMenuDivider = styled.div`
  height: 1px;
  background-color: var(--color-border-default);
  margin: var(--spacing-lg) 0;
`;

const AxLogoutButton = styled(AxButton)`
  width: 100%;
  justify-content: flex-start;
  text-align: left;
  background-color: transparent;
  color: var(--color-danger);
  margin-top: var(--spacing-md);
  &:hover
  {
    background-color: var(--color-danger);
    color: var(--color-text-inverse);
  }
`;


interface SidebarProps
{
  isOpen: boolean;
  onToggle: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  labelKey: string;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  { id: 'welcome', labelKey: 'sidebar.welcome', disabled: false },
  { id: 'orders', labelKey: 'sidebar.customerOrder', disabled: false },
  { id: 'purchase-order', labelKey: 'module.purchaseOrder', disabled: false },
  { id: 'shop-floor-control', labelKey: 'module.shopFloorControl', disabled: false },
  { id: 'rma', labelKey: 'module.rma', disabled: false },
  { id: 'inventory-control', labelKey: 'module.inventoryControl', disabled: false },
  { id: 'accounts-receivable', labelKey: 'module.accountsReceivable', disabled: false },
  { id: 'accounts-payable', labelKey: 'module.accountsPayable', disabled: false },
  { id: 'general-ledger', labelKey: 'module.generalLedger', disabled: false },
  { id: 'master', labelKey: 'sidebar.master', disabled: false },
];

export function Sidebar({ isOpen, onToggle, currentPage, onPageChange, onLogout }: SidebarProps)
{
  const { t } = useI18n();

  return (
    <>
      <AxOverlay $isOpen={isOpen} onClick={onToggle} {...debugProps(COMPONENT_NAME, 'AxOverlay')} />
      <AxSidebar $isOpen={isOpen} {...debugProps(COMPONENT_NAME, 'AxSidebar')}>
        <AxSidebarHeader {...debugProps(COMPONENT_NAME, 'AxSidebarHeader')}>
          <AxSidebarTitleWrapper>
            <AxSidebarTitle>{t('sidebar.title')}</AxSidebarTitle>
            <AxSidebarSubtitle>{t('sidebar.subtitle')}</AxSidebarSubtitle>
          </AxSidebarTitleWrapper>
        </AxSidebarHeader>
        <AxMenuList {...debugProps(COMPONENT_NAME, 'AxMenuList')}>
          {menuItems.map((item) => (
            <AxMenuItem key={item.id} {...debugProps(COMPONENT_NAME, 'AxMenuItem')}>
              <AxMenuButton
                $isActive={currentPage === item.id}
                $disabled={item.disabled === true}
                onClick={() => {
                  if (item.disabled !== true) {
                    onPageChange(item.id);
                    onToggle(); // Close sidebar after selection
                  }
                }}
                variant={currentPage === item.id ? 'primary' : 'secondary'}
                disabled={item.disabled === true}
              >
                {t(item.labelKey)}
                {item.disabled === true && ` (${t('module.comingSoon')})`}
              </AxMenuButton>
            </AxMenuItem>
          ))}
        </AxMenuList>
        <AxMenuDivider {...debugProps(COMPONENT_NAME, 'AxMenuDivider')} />
        <AxLogoutButton
          onClick={() => {
            onLogout();
            onToggle(); // Close sidebar after logout
          }}
          variant="secondary"
        >
          {t('sidebar.logout')}
        </AxLogoutButton>
      </AxSidebar>
    </>
  );
}

