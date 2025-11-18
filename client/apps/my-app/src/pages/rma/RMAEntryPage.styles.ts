import styled from '@emotion/styled';
import { AxCard } from '@ui/components';

export const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  height: 100%;
  width: 100%;
  min-height: 0;
  overflow: hidden;
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
  gap: var(--spacing-lg);
  margin-bottom: 0;
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
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

export const ContentCard = styled(AxCard)`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-lg) !important;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-md);
  border-top: 2px solid var(--color-border-default);
  flex-shrink: 0;
`;

