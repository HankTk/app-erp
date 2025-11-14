import React from 'react';
import styled from 'styled-components';

export interface AxRadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: boolean;
}

interface StyledRadioWrapperProps {
  $error?: boolean;
  $disabled?: boolean;
}

const StyledRadioWrapper = styled.label<StyledRadioWrapperProps>`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  user-select: none;
  opacity: ${({ $disabled }) => ($disabled ? 'var(--opacity-disabled)' : '1')};
`;

const StyledRadioInput = styled.input.attrs({ type: 'radio' })<{ $error?: boolean }>`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid ${({ $error }) =>
  {
    return $error ? 'var(--color-border-error)' : 'var(--color-border-default)';
  }};
  border-radius: var(--radius-full);
  background-color: var(--color-background-default);
  cursor: pointer;
  position: relative;
  transition: all var(--transition-base);
  flex-shrink: 0;

  &:checked
  {
    border-color: var(--color-primary);

    &::after
    {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: var(--radius-full);
      background-color: var(--color-primary);
    }
  }

  &:focus
  {
    outline: none;
    box-shadow: ${({ $error }) =>
    {
      return $error ? 'var(--shadow-focus-error)' : 'var(--shadow-focus-sm)';
    }};
  }

  &:hover:not(:disabled):not(:checked)
  {
    border-color: ${({ $error }) =>
    {
      return $error ? 'var(--color-border-error)' : 'var(--color-border-focus)';
    }};
  }

  &:disabled
  {
    background-color: var(--color-background-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }
`;

const StyledRadioLabel = styled.span`
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-text-primary);
`;

export const AxRadio: React.FC<AxRadioProps> = ({
  label,
  error,
  disabled,
  id,
  ...props
}) =>
{
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <StyledRadioWrapper $error={error} $disabled={disabled} htmlFor={radioId}>
      <StyledRadioInput
        id={radioId}
        $error={error}
        disabled={disabled}
        {...props}
      />
      {label && <StyledRadioLabel>{label}</StyledRadioLabel>}
    </StyledRadioWrapper>
  );
};

