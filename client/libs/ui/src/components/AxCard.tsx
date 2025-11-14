import React from 'react';
import styled from 'styled-components';

export interface AxCardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4;
  padding?: 'none' | 'small' | 'medium' | 'large';
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
  height?: string;
}

interface StyledCardProps
{
  $elevation?: 0 | 1 | 2 | 3 | 4;
  $padding?: 'none' | 'small' | 'medium' | 'large';
  $maxWidth?: string;
  $maxHeight?: string;
  $width?: string;
  $height?: string;
}

const StyledCard = styled.div<StyledCardProps>`
  font-family: var(--font-family-base);
  background-color: var(--color-background-default);
  border-radius: var(--radius-lg);
  transition: box-shadow var(--transition-base);

  ${({ $maxWidth }) => $maxWidth && `max-width: ${$maxWidth};`}
  ${({ $maxHeight }) => $maxHeight && `max-height: ${$maxHeight};`}
  ${({ $width }) => $width && `width: ${$width};`}
  ${({ $height }) => $height && `height: ${$height};`}

  ${({ $elevation = 1 }) =>
  {
    switch ($elevation)
    {
      case 0:
        return 'box-shadow: var(--shadow-none);';
      case 1:
        return 'box-shadow: var(--shadow-md);';
      case 2:
        return 'box-shadow: var(--shadow-lg);';
      case 3:
        return 'box-shadow: var(--shadow-xl);';
      case 4:
        return 'box-shadow: var(--shadow-2xl);';
    }
  }}

  ${({ $padding = 'medium' }) =>
  {
    switch ($padding)
    {
      case 'none':
        return 'padding: 0;';
      case 'small':
        return 'padding: var(--spacing-md);';
      case 'large':
        return 'padding: var(--spacing-3xl);';
      default:
        return 'padding: var(--spacing-xl);';
    }
  }}
`;

export const AxCard: React.FC<AxCardProps> = ({
  children,
  elevation,
  padding,
  maxWidth,
  maxHeight,
  width,
  height,
  ...props
}) =>
{
  return (
    <StyledCard
      $elevation={elevation}
      $padding={padding}
      $maxWidth={maxWidth}
      $maxHeight={maxHeight}
      $width={width}
      $height={height}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

