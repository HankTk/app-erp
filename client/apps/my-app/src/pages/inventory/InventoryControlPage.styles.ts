import styled from '@emotion/styled';
import { AxCard, AxParagraph } from '@ui/components';

export const PageContainer = styled.div`
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

export const CardsContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  padding-top: calc(var(--spacing-4xl) + 100px);
`;

export const HeaderCard = styled(AxCard)`
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg) !important;
`;

export const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
  gap: var(--spacing-md);
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  flex: 1;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

export const MenuCardsGrid = styled.div`
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

export const MenuCard = styled(AxCard)`
  width: 400px;
  height: 200px;
  padding: var(--spacing-3xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform var(--transition-base), box-shadow var(--transition-base);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }
`;

export const MenuCardTitle = styled(AxParagraph)`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm) 0;
  text-align: center;
`;

export const MenuCardSubtitle = styled(AxParagraph)`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin: 0;
  text-align: center;
`;

