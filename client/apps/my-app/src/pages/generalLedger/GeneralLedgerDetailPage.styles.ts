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
  align-items: flex-start;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
`;

export const ContentCard = styled(AxCard)`
  display: flex;
  flex-direction: column;
  overflow: visible;
  flex-shrink: 0;
`;

export const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background-color: var(--color-background-secondary);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-lg);
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

