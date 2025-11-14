import React from 'react';
import styled, { keyframes } from 'styled-components';

export interface AxProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Progress value (0-100) */
  value?: number;
  /** Variant style */
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  /** Size of the progress bar */
  size?: 'small' | 'medium' | 'large';
  /** Type of progress indicator */
  type?: 'line' | 'circle';
  /** Show percentage text */
  showLabel?: boolean;
  /** Custom label text */
  label?: string;
  /** Animation duration in seconds */
  animationDuration?: number;
}

interface StyledProgressProps {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger';
  $size?: 'small' | 'medium' | 'large';
  $type?: 'line' | 'circle';
  $value?: number;
  $animationDuration?: number;
}

// Animation for progress bar
const progressAnimation = keyframes`
  from {
    width: 0%;
  }
`;

// Animation for circular progress
const circularProgressAnimation = keyframes`
  from {
    stroke-dashoffset: 283;
  }
`;

// Line Progress Container
const StyledLineProgressContainer = styled.div<StyledProgressProps>`
  width: 100%;
  position: relative;
  
  ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'height: 4px;';
      case 'large':
        return 'height: 12px;';
      default:
        return 'height: 8px;';
    }
  }}
`;

// Line Progress Track
const StyledLineProgressTrack = styled.div<StyledProgressProps>`
  width: 100%;
  height: 100%;
  background-color: var(--color-background-disabled);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
`;

// Line Progress Fill
const StyledLineProgressFill = styled.div<StyledProgressProps>`
  height: 100%;
  width: ${({ $value = 0 }) => `${$value}%`};
  border-radius: var(--radius-full);
  transition: width var(--transition-base);
  animation: ${progressAnimation} ${({ $animationDuration = 0.5 }) => `${$animationDuration}s`} ease-out;
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return 'background-color: var(--color-primary);';
      case 'secondary':
        return 'background-color: var(--color-secondary);';
      case 'success':
        return 'background-color: var(--color-success);';
      case 'danger':
        return 'background-color: var(--color-danger);';
    }
  }}
`;

// Line Progress Label
const StyledLineProgressLabel = styled.div`
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: center;
`;

// Circle Progress Container
const StyledCircleProgressContainer = styled.div<StyledProgressProps>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  
  ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'width: 64px; height: 64px;';
      case 'large':
        return 'width: 120px; height: 120px;';
      default:
        return 'width: 96px; height: 96px;';
    }
  }}
`;

// Circle Progress SVG
const StyledCircleProgressSvg = styled.svg<StyledProgressProps>`
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
`;

// Circle Progress Track
const StyledCircleProgressTrack = styled.circle<StyledProgressProps>`
  fill: none;
  stroke: var(--color-background-disabled);
  
  ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'stroke-width: 4;';
      case 'large':
        return 'stroke-width: 8;';
      default:
        return 'stroke-width: 6;';
    }
  }}
`;

// Circle Progress Fill
const StyledCircleProgressFill = styled.circle<StyledProgressProps>`
  fill: none;
  stroke-linecap: round;
  transition: stroke-dashoffset var(--transition-base);
  animation: ${circularProgressAnimation} ${({ $animationDuration = 0.5 }) => `${$animationDuration}s`} ease-out;
  
  ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'stroke-width: 4;';
      case 'large':
        return 'stroke-width: 8;';
      default:
        return 'stroke-width: 6;';
    }
  }}
  
  ${({ $variant = 'primary' }) => {
    switch ($variant) {
      case 'primary':
        return 'stroke: var(--color-primary);';
      case 'secondary':
        return 'stroke: var(--color-secondary);';
      case 'success':
        return 'stroke: var(--color-success);';
      case 'danger':
        return 'stroke: var(--color-danger);';
    }
  }}
  
  ${({ $value = 0, $size = 'medium' }) => {
    // Calculate circumference based on size
    const radius = $size === 'small' ? 28 : $size === 'large' ? 52 : 42;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (($value / 100) * circumference);
    return `stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset};`;
  }}
`;

// Circle Progress Label
const StyledCircleProgressLabel = styled.div<StyledProgressProps>`
  position: absolute;
  font-size: ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'var(--font-size-sm);';
      case 'large':
        return 'var(--font-size-xl);';
      default:
        return 'var(--font-size-base);';
    }
  }};
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
`;

export const AxProgress: React.FC<AxProgressProps> = ({
  value = 0,
  variant = 'primary',
  size = 'medium',
  type = 'line',
  showLabel = false,
  label,
  animationDuration = 0.5,
  ...props
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);
  const displayLabel = label || `${Math.round(clampedValue)}%`;

  if (type === 'circle') {
    const radius = size === 'small' ? 28 : size === 'large' ? 52 : 42;
    const center = size === 'small' ? 32 : size === 'large' ? 60 : 48;

    return (
      <StyledCircleProgressContainer $size={size} {...props}>
        <StyledCircleProgressSvg $size={size}>
          <StyledCircleProgressTrack
            $size={size}
            cx={center}
            cy={center}
            r={radius}
          />
          <StyledCircleProgressFill
            $variant={variant}
            $size={size}
            $value={clampedValue}
            $animationDuration={animationDuration}
            cx={center}
            cy={center}
            r={radius}
          />
        </StyledCircleProgressSvg>
        {showLabel && (
          <StyledCircleProgressLabel $size={size}>
            {displayLabel}
          </StyledCircleProgressLabel>
        )}
      </StyledCircleProgressContainer>
    );
  }

  return (
    <StyledLineProgressContainer $size={size} {...props}>
      <StyledLineProgressTrack $size={size}>
        <StyledLineProgressFill
          $variant={variant}
          $size={size}
          $value={clampedValue}
          $animationDuration={animationDuration}
        />
      </StyledLineProgressTrack>
      {showLabel && (
        <StyledLineProgressLabel>{displayLabel}</StyledLineProgressLabel>
      )}
    </StyledLineProgressContainer>
  );
};

