import styled from 'styled-components';

export const AxContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--color-background-page);
  min-height: 100vh;
  transition: background-color var(--transition-base);
`;

export const AxHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4xl);
`;

export const AxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-2xl);
  margin-bottom: var(--spacing-4xl);
`;

export const AxSection = styled.section`
  margin-bottom: var(--spacing-4xl);
`;

export const AxSectionTitle = styled.h2`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xl);
  color: var(--color-text-primary);
  transition: color var(--transition-base);
`;

