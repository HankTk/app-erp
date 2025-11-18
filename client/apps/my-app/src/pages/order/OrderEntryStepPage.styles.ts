import styled from '@emotion/styled';

export const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  overflow: visible;
`;

export const ItemsTable = styled.div`
  overflow-x: auto;
`;

export const SubStepIndicator = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
`;

export const SubStep = styled.div<{ $active: boolean; $completed: boolean }>`
  flex: 1;
  padding: var(--spacing-xs) var(--spacing-sm);
  text-align: center;
  border-radius: var(--radius-sm);
  background-color: ${props =>
    props.$active
      ? 'var(--color-primary)'
      : props.$completed
        ? 'var(--color-success)'
        : 'transparent'};
  color: ${props =>
    props.$active || props.$completed
      ? 'var(--color-text-inverse)'
      : 'var(--color-text-secondary)'};
  cursor: ${props => (props.$completed || props.$active ? 'pointer' : 'default')};
  font-size: var(--font-size-sm);
`;

