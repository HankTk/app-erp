import React from 'react';
import styled from '@emotion/styled';

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

export interface AxParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  color?: 'default' | 'secondary' | 'error' | 'danger' | 'warning' | 'success' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  italic?: boolean;
  marginBottom?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  marginTop?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: 'normal' | 'tight';
}

interface StyledParagraphProps {
  $color?: 'default' | 'secondary' | 'error' | 'danger' | 'warning' | 'success' | 'primary';
  $size?: 'sm' | 'md' | 'lg';
  $weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  $italic?: boolean;
  $marginBottom?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  $marginTop?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  $textAlign?: 'left' | 'center' | 'right';
  $lineHeight?: 'normal' | 'tight';
}

const StyledParagraph = styled.p<StyledParagraphProps>`
  color: ${({ $color }) => {
    switch ($color) {
      case 'secondary':
        return 'var(--color-text-secondary)';
      case 'error':
      case 'danger':
        return 'var(--color-error)';
      case 'warning':
        return 'var(--color-warning)';
      case 'success':
        return 'var(--color-success)';
      case 'primary':
        return 'var(--color-primary)';
      case 'default':
      default:
        return 'var(--color-text-secondary)';
    }
  }};
  font-size: ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return 'var(--font-size-sm)';
      case 'lg':
        return 'var(--font-size-lg)';
      case 'md':
      default:
        return 'inherit';
    }
  }};
  font-weight: ${({ $weight }) => {
    switch ($weight) {
      case 'medium':
        return 'var(--font-weight-medium)';
      case 'semibold':
        return 'var(--font-weight-semibold)';
      case 'bold':
        return 'var(--font-weight-bold)';
      case 'normal':
      default:
        return 'normal';
    }
  }};
  font-style: ${({ $italic }) => ($italic ? 'italic' : 'normal')};
  margin-bottom: ${({ $marginBottom }) => ($marginBottom ? `var(--spacing-${$marginBottom})` : '0')};
  margin-top: ${({ $marginTop }) => ($marginTop ? `var(--spacing-${$marginTop})` : '0')};
  text-align: ${({ $textAlign }) => $textAlign || 'left'};
  line-height: ${({ $lineHeight }) => ($lineHeight === 'tight' ? 'var(--line-height-tight)' : 'normal')};
  transition: color var(--transition-base);
`;

export const AxParagraph: React.FC<AxParagraphProps> = ({
  color = 'default',
  size,
  weight,
  italic,
  marginBottom,
  marginTop,
  textAlign,
  lineHeight,
  ...props
}) => {
  return (
    <StyledParagraph
      $color={color}
      $size={size}
      $weight={weight}
      $italic={italic}
      $marginBottom={marginBottom}
      $marginTop={marginTop}
      $textAlign={textAlign}
      $lineHeight={lineHeight}
      {...props}
    />
  );
};

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

