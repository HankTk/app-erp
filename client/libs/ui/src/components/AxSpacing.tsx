import styled from 'styled-components';

export const AxSpacingExample = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-background-disabled);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-xl);
`;

export const AxSpacingRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

export const AxSpacingVisual = styled.div<{ spacing: string }>`
  display: flex;
  align-items: center;
  gap: ${({ spacing }) =>
  {
    return spacing;
  }};
  padding: var(--spacing-sm);
  background-color: var(--color-background-default);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border-default);
`;

export const AxSpacingBox = styled.div`
  width: 40px;
  height: 40px;
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-inverse);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
`;

export const AxSpacingInfo = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

export const AxSpacingItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 100px;
`;

export const AxSpacingLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
`;

export const AxSpacingValue = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  font-family: monospace;
`;

