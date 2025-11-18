import styled from '@emotion/styled';
import { AxCard } from '@ui/components';

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
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

export const TableCard = styled(AxCard)`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  max-height: calc(100% - 6rem);
  overflow: hidden;
`;

export const StyledTextarea = styled.textarea`
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  padding: var(--spacing-sm) calc(var(--spacing-sm) + 6px);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  width: 100%;
  min-height: 120px;
  resize: vertical;
  color: var(--color-text-primary);
  background-color: var(--color-background-default);

  &:focus {
    border-color: var(--color-border-focus);
    box-shadow: var(--shadow-focus-sm);
  }

  &:disabled {
    background-color: var(--color-background-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

