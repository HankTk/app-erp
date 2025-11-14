import styled from 'styled-components';
import { AxButton } from '@ui/components';
import { useI18n } from '../i18n/I18nProvider';

const AxSidebar = styled.aside`
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
`;

const AxSidebarHeader = styled.div`
  margin-bottom: var(--spacing-2xl);
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

const AxMenuButton = styled(AxButton)<{ $isActive: boolean }>`
  width: 100%;
  justify-content: flex-start;
  text-align: left;
  background-color: ${({ $isActive }) =>
  {
    return $isActive ? 'var(--color-primary)' : 'transparent';
  }};
  color: ${({ $isActive }) =>
  {
    return $isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)';
  }};
  &:hover
  {
    background-color: ${({ $isActive }) =>
    {
      return $isActive ? 'var(--color-primary-hover)' : 'var(--color-background-disabled)';
    }};
  }
`;

interface SidebarProps
{
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'button', labelKey: 'sidebar.button' },
  { id: 'card', labelKey: 'sidebar.card' },
  { id: 'input', labelKey: 'sidebar.input' },
  { id: 'checkbox', labelKey: 'sidebar.checkbox' },
  { id: 'radio', labelKey: 'sidebar.radio' },
  { id: 'table', labelKey: 'sidebar.table' },
  { id: 'chart', labelKey: 'sidebar.chart' },
  { id: 'dialog', labelKey: 'sidebar.dialog' },
  { id: 'combination', labelKey: 'sidebar.combination' },
  { id: 'dateRangePicker', labelKey: 'sidebar.dateRangePicker' },
  { id: 'progress', labelKey: 'sidebar.progress' },
  { id: 'listbox', labelKey: 'sidebar.listbox' },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps)
{
  const { t } = useI18n();

  return (
    <AxSidebar>
      <AxSidebarHeader>
        <AxSidebarTitle>{t('sidebar.title')}</AxSidebarTitle>
        <AxSidebarSubtitle>{t('sidebar.subtitle')}</AxSidebarSubtitle>
      </AxSidebarHeader>
      <AxMenuList>
        {menuItems.map((item) => (
          <AxMenuItem key={item.id}>
            <AxMenuButton
              $isActive={currentPage === item.id}
              onClick={() => onPageChange(item.id)}
              variant={currentPage === item.id ? 'primary' : 'secondary'}
            >
              {t(item.labelKey)}
            </AxMenuButton>
          </AxMenuItem>
        ))}
      </AxMenuList>
    </AxSidebar>
  );
}

