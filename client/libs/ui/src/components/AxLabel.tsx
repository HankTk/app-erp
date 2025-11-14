import styled from 'styled-components';

export const AxLabel = styled.label`
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-secondary);
  transition: color var(--transition-base);
`;

export const AxTitle = styled.h1`
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-primary);
  transition: color var(--transition-base);
`;

export const AxSubtitle = styled.p`
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4xl);
  transition: color var(--transition-base);
`;

export const AxHeading3 = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-primary);
  transition: color var(--transition-base);
`;

export const AxParagraph = styled.p`
  color: var(--color-text-secondary);
  transition: color var(--transition-base);
`;

export const AxTypographyExample = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background-color: var(--color-background-disabled);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-xl);
`;

export const AxTypographyRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

export const AxTypographyLabel = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  min-width: 120px;
`;

