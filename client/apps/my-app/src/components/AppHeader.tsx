import styled from 'styled-components';
import { AxButton } from '@ui/components';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) 0;
  background-color: var(--color-background-default);
  border-bottom: 1px solid var(--color-border-default);
  flex-shrink: 0;
  z-index: 101;
  position: relative;
  width: 100%;
  box-sizing: border-box;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-left: var(--spacing-lg);
`;

const HeaderCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  text-align: center;
`;

const HeaderTitle = styled.h1`
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin: 0;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding-right: var(--spacing-lg);
`;

const MenuButton = styled(AxButton)`
  min-width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: var(--color-background-default);
  border: 2px solid var(--color-border-default);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  
  &:hover {
    background-color: var(--color-background-hover);
    border-color: var(--color-primary);
    color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: scale(1.05);
  }
`;

const SettingsButton = styled(AxButton)`
  min-width: 44px;
  height: 44px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  background-color: var(--color-background-default);
  border: 2px solid var(--color-border-default);
  box-shadow: var(--shadow-sm);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  
  &:hover {
    background-color: var(--color-background-hover);
    border-color: var(--color-primary);
    color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: scale(1.05);
  }
`;

interface AppHeaderProps {
  onMenuClick: () => void;
  onSettingsClick: () => void;
  title?: string;
}

export function AppHeader({ onMenuClick, onSettingsClick, title }: AppHeaderProps) {
  return (
    <HeaderContainer>
      <HeaderLeft>
        <MenuButton
          onClick={onMenuClick}
          variant="secondary"
          aria-label="Menu"
        >
          ☰
        </MenuButton>
      </HeaderLeft>
      {title && (
        <HeaderCenter>
          <HeaderTitle>{title}</HeaderTitle>
        </HeaderCenter>
      )}
      <HeaderRight>
        <SettingsButton
          onClick={onSettingsClick}
          variant="secondary"
          aria-label="Settings"
        >
          ⚙️
        </SettingsButton>
      </HeaderRight>
    </HeaderContainer>
  );
}

