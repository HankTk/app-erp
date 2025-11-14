import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

export interface ListboxOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface AxListboxProps {
  options: ListboxOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
}

interface StyledListboxContainerProps {
  $fullWidth?: boolean;
}

const StyledListboxContainer = styled.div<StyledListboxContainerProps>`
  position: relative;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

interface StyledListboxButtonProps {
  $error?: boolean;
  $disabled?: boolean;
  $isOpen?: boolean;
  $size?: 'small' | 'medium' | 'large';
  $fullWidth?: boolean;
}

const StyledListboxButton = styled.button<StyledListboxButtonProps>`
  font-family: var(--font-family-base);
  font-size: ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'var(--font-size-sm)';
      case 'large':
        return 'var(--font-size-md)';
      default:
        return 'var(--font-size-base)';
    }
  }};
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  padding: ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'var(--spacing-xs) calc(var(--spacing-sm) + 4px)';
      case 'large':
        return 'var(--spacing-md) calc(var(--spacing-md) + 8px)';
      default:
        return 'var(--spacing-sm) calc(var(--spacing-sm) + 6px)';
    }
  }};
  border: 2px solid ${({ $error, $isOpen }) => {
    if ($error) return 'var(--color-border-error)';
    if ($isOpen) return 'var(--color-border-focus)';
    return 'var(--color-border-default)';
  }};
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-width: 200px;
  color: var(--color-text-primary);
  background-color: var(--color-background-default);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  text-align: left;

  &:focus {
    border-color: ${({ $error }) =>
      $error ? 'var(--color-border-error)' : 'var(--color-border-focus)'};
    box-shadow: ${({ $error }) =>
      $error ? 'var(--shadow-focus-error)' : 'var(--shadow-focus-sm)'};
  }

  &:disabled {
    background-color: var(--color-background-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }

  &:hover:not(:disabled) {
    border-color: ${({ $error, $isOpen }) => {
      if ($error) return 'var(--color-border-error)';
      if ($isOpen) return 'var(--color-border-focus)';
      return 'var(--color-border-focus)';
    }};
  }
`;

const StyledListboxButtonText = styled.span<{ $placeholder?: boolean }>`
  flex: 1;
  color: ${({ $placeholder }) =>
    $placeholder ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)'};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledListboxIcon = styled.span<{ $isOpen?: boolean }>`
  display: inline-flex;
  align-items: center;
  transition: transform var(--transition-base);
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
`;

interface StyledListboxDropdownProps {
  $isOpen?: boolean;
  $fullWidth?: boolean;
}

const StyledListboxDropdown = styled.div<StyledListboxDropdownProps>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-width: 100%;
  background-color: var(--color-background-default);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  margin-top: var(--spacing-xs);
`;

interface StyledListboxOptionProps {
  $selected?: boolean;
  $disabled?: boolean;
  $multiple?: boolean;
}

const StyledListboxOption = styled.li<StyledListboxOptionProps>`
  padding: var(--spacing-sm) calc(var(--spacing-sm) + 6px);
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  background-color: ${({ $selected }) =>
    $selected ? 'var(--color-primary-light)' : 'transparent'};
  color: ${({ $selected, $disabled }) => {
    if ($disabled) return 'var(--color-text-tertiary)';
    if ($selected) return 'var(--color-text-primary)';
    return 'var(--color-text-primary)';
  }};
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  transition: background-color var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  opacity: ${({ $disabled }) => ($disabled ? 'var(--opacity-disabled)' : '1')};

  &:hover:not([data-disabled='true']) {
    background-color: ${({ $selected }) =>
      $selected ? 'var(--color-primary-light)' : 'var(--color-background-disabled)'};
  }

  &:first-child {
    border-top-left-radius: var(--radius-md);
    border-top-right-radius: var(--radius-md);
  }

  &:last-child {
    border-bottom-left-radius: var(--radius-md);
    border-bottom-right-radius: var(--radius-md);
  }
`;

const StyledListboxOptionCheck = styled.span<{ $selected?: boolean }>`
  width: 16px;
  height: 16px;
  border: 2px solid
    ${({ $selected }) =>
      $selected ? 'var(--color-primary)' : 'var(--color-border-default)'};
  border-radius: var(--radius-sm);
  background-color: ${({ $selected }) =>
    $selected ? 'var(--color-primary)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--transition-base);

  &::after {
    content: '';
    display: ${({ $selected }) => ($selected ? 'block' : 'none')};
    width: 4px;
    height: 8px;
    border: solid var(--color-text-inverse);
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
    margin-top: -2px;
  }
`;

const StyledListboxOptionText = styled.span`
  flex: 1;
`;

interface StyledSearchInputProps {
  $error?: boolean;
  $size?: 'small' | 'medium' | 'large';
  $fullWidth?: boolean;
}

const StyledSearchInput = styled.input<StyledSearchInputProps>`
  font-family: var(--font-family-base);
  font-size: ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'var(--font-size-sm)';
      case 'large':
        return 'var(--font-size-md)';
      default:
        return 'var(--font-size-base)';
    }
  }};
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  padding: ${({ $size = 'medium' }) => {
    switch ($size) {
      case 'small':
        return 'var(--spacing-xs) calc(var(--spacing-sm) + 4px)';
      case 'large':
        return 'var(--spacing-md) calc(var(--spacing-md) + 8px)';
      default:
        return 'var(--spacing-sm) calc(var(--spacing-sm) + 6px)';
    }
  }};
  border: 2px solid ${({ $error }) =>
    $error ? 'var(--color-border-error)' : 'var(--color-border-default)'};
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  min-width: 200px;
  color: var(--color-text-primary);
  background-color: var(--color-background-default);
  padding-right: calc(var(--spacing-xl) + 8px);

  &:focus {
    border-color: ${({ $error }) =>
      $error ? 'var(--color-border-error)' : 'var(--color-border-focus)'};
    box-shadow: ${({ $error }) =>
      $error ? 'var(--shadow-focus-error)' : 'var(--shadow-focus-sm)'};
  }

  &:disabled {
    background-color: var(--color-background-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }

  &::placeholder {
    color: var(--color-text-tertiary);
  }
`;

const StyledSearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledSearchIcon = styled.span<{ $isOpen?: boolean }>`
  position: absolute;
  right: calc(var(--spacing-sm) + 6px);
  display: inline-flex;
  align-items: center;
  transition: transform var(--transition-base);
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  pointer-events: none;
`;

const StyledNoResults = styled.div`
  padding: var(--spacing-md);
  text-align: center;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-family: var(--font-family-base);
`;

export const AxListbox: React.FC<AxListboxProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
  error = false,
  fullWidth = false,
  placeholder = '選択してください',
  size = 'medium',
  searchable = false,
  searchPlaceholder = '検索...',
  noResultsText = '該当する結果がありません',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setSearchQuery('');
        if (searchable) {
          inputRef.current?.focus();
        } else {
          buttonRef.current?.focus();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, searchable]);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen && searchable) {
        setSearchQuery('');
      }
    }
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange?.(newValues);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      const selectedOptions = options.filter((opt) =>
        Array.isArray(value) ? value.includes(opt.value) : false
      );
      if (selectedOptions.length === 0) {
        return placeholder;
      }
      if (selectedOptions.length === 1) {
        return selectedOptions[0].label;
      }
      return `${selectedOptions.length}個選択中`;
    } else {
      const selectedOption = options.find((opt) => opt.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(value) ? value.includes(optionValue) : false;
    }
    return value === optionValue;
  };

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const getInputValue = () => {
    if (searchable) {
      if (multiple) {
        return searchQuery;
      } else {
        if (searchQuery) {
          return searchQuery;
        }
        const selectedOption = options.find((opt) => opt.value === value);
        return selectedOption ? selectedOption.label : '';
      }
    }
    return '';
  };

  return (
    <StyledListboxContainer ref={containerRef} $fullWidth={fullWidth}>
      {searchable ? (
        <StyledSearchInputWrapper>
          <StyledSearchInput
            ref={inputRef}
            type="text"
            value={getInputValue()}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onClick={handleInputFocus}
            placeholder={
              multiple
                ? searchPlaceholder
                : value
                ? getDisplayText()
                : placeholder
            }
            $error={error}
            $size={size}
            $fullWidth={fullWidth}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          />
          <StyledSearchIcon $isOpen={isOpen}>▼</StyledSearchIcon>
        </StyledSearchInputWrapper>
      ) : (
        <StyledListboxButton
          ref={buttonRef}
          type="button"
          onClick={handleToggle}
          $error={error}
          $disabled={disabled}
          $isOpen={isOpen}
          $size={size}
          $fullWidth={fullWidth}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <StyledListboxButtonText $placeholder={!value || (Array.isArray(value) && value.length === 0)}>
            {getDisplayText()}
          </StyledListboxButtonText>
          <StyledListboxIcon $isOpen={isOpen}>▼</StyledListboxIcon>
        </StyledListboxButton>
      )}
      <StyledListboxDropdown $isOpen={isOpen} $fullWidth={fullWidth} role="listbox">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <StyledListboxOption
              key={option.value}
              onClick={() => !option.disabled && handleSelect(option.value)}
              $selected={isSelected(option.value)}
              $disabled={option.disabled}
              $multiple={multiple}
              data-disabled={option.disabled}
              role="option"
              aria-selected={isSelected(option.value)}
            >
              {multiple && (
                <StyledListboxOptionCheck $selected={isSelected(option.value)} />
              )}
              <StyledListboxOptionText>{option.label}</StyledListboxOptionText>
            </StyledListboxOption>
          ))
        ) : (
          <StyledNoResults>{noResultsText}</StyledNoResults>
        )}
      </StyledListboxDropdown>
    </StyledListboxContainer>
  );
};

