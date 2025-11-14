import React, { useState, useMemo, useEffect, useRef } from 'react';
import styled from 'styled-components';

export interface AxDateRangePickerProps
{
  value?: { start: Date | null; end: Date | null };
  onChange?: (range: { start: Date | null; end: Date | null }) => void;
  months?: 1 | 2;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

interface StyledDateRangePickerProps
{
  $disabled?: boolean;
}

const DateRangePickerContainer = styled.div<StyledDateRangePickerProps>`
  font-family: var(--font-family-base);
  background-color: var(--color-background-default);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: inline-block;
  opacity: ${({ $disabled }) =>
  {
    return $disabled ? 'var(--opacity-disabled)' : '1';
  }};
  pointer-events: ${({ $disabled }) =>
  {
    return $disabled ? 'none' : 'auto';
  }};
`;

const CalendarHeader = styled.div`
  display: grid;
  grid-template-columns: 32px 1fr 32px;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const MonthYearLabel = styled.button`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-align: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-base);

  &:hover:not(:disabled)
  {
    background-color: var(--color-background-disabled);
  }

  &:disabled
  {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }
`;

const MonthYearSelector = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-top: var(--spacing-sm);
  background-color: var(--color-background-default);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  min-width: 200px;
`;

const MonthYearSelectorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const MonthYearSelectorTitle = styled.div`
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
`;

const MonthYearGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
`;

const YearGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-xs);
  max-height: 200px;
  overflow-y: auto;
`;

const MonthYearCell = styled.button<{ $isSelected?: boolean; $isDisabled?: boolean }>`
  padding: var(--spacing-sm);
  border: 2px solid ${({ $isSelected }) =>
  {
    return $isSelected ? 'var(--color-primary)' : 'transparent';
  }};
  border-radius: var(--radius-sm);
  background-color: ${({ $isSelected }) =>
  {
    return $isSelected ? 'var(--color-primary)' : 'transparent';
  }};
  color: ${({ $isSelected }) =>
  {
    return $isSelected ? 'var(--color-text-inverse)' : 'var(--color-text-primary)';
  }};
  font-size: var(--font-size-sm);
  cursor: ${({ $isDisabled }) =>
  {
    return $isDisabled ? 'not-allowed' : 'pointer';
  }};
  transition: all var(--transition-base);
  opacity: ${({ $isDisabled }) =>
  {
    return $isDisabled ? 'var(--opacity-disabled)' : '1';
  }};

  &:hover:not(:disabled)
  {
    background-color: ${({ $isSelected }) =>
    {
      return $isSelected ? 'var(--color-primary-hover)' : 'var(--color-background-disabled)';
    }};
    border-color: ${({ $isSelected }) =>
    {
      return $isSelected ? 'var(--color-primary-hover)' : 'var(--color-border-focus)';
    }};
  }

  &:disabled
  {
    cursor: not-allowed;
  }
`;

const CalendarHeaderWrapper = styled.div`
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-base);

  &:hover:not(:disabled)
  {
    background-color: var(--color-background-disabled);
  }

  &:disabled
  {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-base);
  width: 32px;
  height: 32px;

  &:hover:not(:disabled)
  {
    background-color: var(--color-background-disabled);
  }

  &:disabled
  {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
`;

const DayHeader = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-align: center;
  padding: var(--spacing-sm);
`;

const DayCell = styled.button<{
  $isSelected?: boolean;
  $isInRange?: boolean;
  $isStart?: boolean;
  $isEnd?: boolean;
  $isToday?: boolean;
  $isDisabled?: boolean;
  $isOtherMonth?: boolean;
}>`
  background: ${({ $isInRange, $isStart, $isEnd }) =>
  {
    if ($isStart || $isEnd)
    {
      return 'var(--color-primary)';
    }
    if ($isInRange)
    {
      return 'rgba(0, 123, 255, 0.1)';
    }
    return 'transparent';
  }};
  color: ${({ $isStart, $isEnd, $isToday, $isOtherMonth, $isDisabled }) =>
  {
    if ($isDisabled)
    {
      return 'var(--color-text-tertiary)';
    }
    if ($isOtherMonth)
    {
      return 'var(--color-text-tertiary)';
    }
    if ($isStart || $isEnd)
    {
      return 'var(--color-text-inverse)';
    }
    if ($isToday)
    {
      return 'var(--color-primary)';
    }
    return 'var(--color-text-primary)';
  }};
  border: ${({ $isToday, $isStart, $isEnd }) =>
  {
    if ($isStart || $isEnd)
    {
      return '2px solid var(--color-primary)';
    }
    if ($isToday)
    {
      return '2px solid var(--color-primary)';
    }
    return '2px solid transparent';
  }};
  border-radius: ${({ $isStart, $isEnd, $isInRange }) =>
  {
    if ($isStart && $isInRange)
    {
      return 'var(--radius-sm) 0 0 var(--radius-sm)';
    }
    if ($isEnd && $isInRange)
    {
      return '0 var(--radius-sm) var(--radius-sm) 0';
    }
    if ($isInRange && !$isStart && !$isEnd)
    {
      return '0';
    }
    return 'var(--radius-sm)';
  }};
  font-size: var(--font-size-base);
  font-weight: ${({ $isToday, $isSelected }) =>
  {
    if ($isToday || $isSelected)
    {
      return 'var(--font-weight-semibold)';
    }
    return 'var(--font-weight-normal)';
  }};
  padding: var(--spacing-sm);
  cursor: ${({ $isDisabled }) =>
  {
    return $isDisabled ? 'not-allowed' : 'pointer';
  }};
  transition: all var(--transition-base);
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled)
  {
    background-color: ${({ $isInRange, $isStart, $isEnd }) =>
    {
      if ($isStart || $isEnd)
      {
        return 'var(--color-primary-hover)';
      }
      if ($isInRange)
      {
        return 'rgba(0, 123, 255, 0.15)';
      }
      return 'var(--color-background-disabled)';
    }};
    border-color: ${({ $isStart, $isEnd }) =>
    {
      if ($isStart || $isEnd)
      {
        return 'var(--color-primary-hover)';
      }
      return 'var(--color-border-focus)';
    }};
  }

  &:disabled
  {
    opacity: var(--opacity-disabled);
  }
`;

const CalendarsContainer = styled.div<{ $months: number }>`
  display: flex;
  gap: var(--spacing-2xl);
  flex-direction: ${({ $months }) =>
  {
    return $months === 2 ? 'row' : 'column';
  }};
`;

const CalendarWrapper = styled.div`
  min-width: 280px;
`;

const getDaysInMonth = (date: Date): number =>
{
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date: Date): number =>
{
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

const isSameDay = (date1: Date | null, date2: Date | null): boolean =>
{
  if (!date1 || !date2)
  {
    return false;
  }
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isDateInRange = (date: Date, start: Date | null, end: Date | null): boolean =>
{
  if (!start || !end)
  {
    return false;
  }
  const dateTime = date.getTime();
  const startTime = start.getTime();
  const endTime = end.getTime();
  return dateTime >= startTime && dateTime <= endTime;
};

const isToday = (date: Date): boolean =>
{
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const formatMonthYear = (date: Date): string =>
{
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AxDateRangePicker: React.FC<AxDateRangePickerProps> = ({
  value,
  onChange,
  months = 1,
  minDate,
  maxDate,
  disabled = false,
  className,
}) =>
{
  const [currentDate, setCurrentDate] = useState(() =>
  {
    if (value?.start)
    {
      return new Date(value.start);
    }
    return new Date();
  });

  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStart, setTempStart] = useState<Date | null>(value?.start || null);
  const [tempEnd, setTempEnd] = useState<Date | null>(value?.end || null);
  const [showMonthYearSelector, setShowMonthYearSelector] = useState<number | null>(null); // 0 for first month, 1 for second month
  const [selectorMode, setSelectorMode] = useState<'year' | 'month'>('year'); // 'year' or 'month'
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const startDate = value?.start || tempStart;
  const endDate = value?.end || tempEnd;

  const secondMonthDate = useMemo(() =>
  {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() + 1);
    return date;
  }, [currentDate]);

  const isDateDisabled = (date: Date): boolean =>
  {
    if (minDate && date < minDate)
    {
      return true;
    }
    if (maxDate && date > maxDate)
    {
      return true;
    }
    return false;
  };

  const handleDateClick = (date: Date) =>
  {
    if (disabled || isDateDisabled(date))
    {
      return;
    }

    if (selectingStart || !startDate || (startDate && date < startDate))
    {
      setTempStart(date);
      setTempEnd(null);
      setSelectingStart(false);
      onChange?.({ start: date, end: null });
    }
    else
    {
      setTempEnd(date);
      setSelectingStart(true);
      onChange?.({ start: startDate, end: date });
    }
  };

  const handlePrevMonth = () =>
  {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () =>
  {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleMonthYearClick = (calendarIndex: number) =>
  {
    if (disabled)
    {
      return;
    }
    if (showMonthYearSelector === calendarIndex)
    {
      setShowMonthYearSelector(null);
      setSelectorMode('year');
      setSelectedYear(null);
    }
    else
    {
      setShowMonthYearSelector(calendarIndex);
      setSelectorMode('year');
      setSelectedYear(null);
    }
  };

  const handleMonthSelect = (month: number, calendarIndex: number) =>
  {
    if (selectedYear === null)
    {
      return;
    }

    const targetDate = calendarIndex === 0 ? currentDate : secondMonthDate;
    const newDate = new Date(targetDate);
    newDate.setFullYear(selectedYear);
    newDate.setMonth(month);
    
    // Check if the new date is within min/max constraints
    if (minDate && newDate < minDate)
    {
      return;
    }
    if (maxDate && newDate > maxDate)
    {
      return;
    }

    if (calendarIndex === 0)
    {
      setCurrentDate(newDate);
    }
    else
    {
      // For second month, adjust currentDate so secondMonthDate becomes the selected month
      const adjustedDate = new Date(newDate);
      adjustedDate.setMonth(adjustedDate.getMonth() - 1);
      setCurrentDate(adjustedDate);
    }
    setShowMonthYearSelector(null);
    setSelectorMode('year');
    setSelectedYear(null);
  };

  const handleYearSelect = (year: number) =>
  {
    setSelectedYear(year);
    setSelectorMode('month');
  };

  const handleBackToYear = () =>
  {
    setSelectorMode('year');
    setSelectedYear(null);
  };

  const selectorRef1 = useRef<HTMLDivElement>(null);
  const selectorRef2 = useRef<HTMLDivElement>(null);

  useEffect(() =>
  {
    const handleClickOutside = (event: MouseEvent) =>
    {
      if (showMonthYearSelector === 0)
      {
        if (selectorRef1.current && !selectorRef1.current.contains(event.target as Node))
        {
          setShowMonthYearSelector(null);
        }
      }
      else if (showMonthYearSelector === 1)
      {
        if (selectorRef2.current && !selectorRef2.current.contains(event.target as Node))
        {
          setShowMonthYearSelector(null);
        }
      }
    };

    if (showMonthYearSelector !== null)
    {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () =>
    {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthYearSelector]);

  const generateYearRange = (): number[] =>
  {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    const startYear = minDate ? minDate.getFullYear() : currentYear - 10;
    const endYear = maxDate ? maxDate.getFullYear() : currentYear + 10;
    
    for (let year = startYear; year <= endYear; year++)
    {
      years.push(year);
    }
    return years;
  };

  const renderCalendar = (date: Date, isSecondMonth = false) =>
  {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const days: (Date | null)[] = [];

    // Add days from previous month
    const prevMonthYear = date.getMonth() === 0 ? date.getFullYear() - 1 : date.getFullYear();
    const prevMonthIndex = date.getMonth() === 0 ? 11 : date.getMonth() - 1;
    const daysInPrevMonth = getDaysInMonth(new Date(prevMonthYear, prevMonthIndex, 1));
    
    for (let i = firstDay - 1; i >= 0; i--)
    {
      const dayNumber = daysInPrevMonth - i;
      days.push(new Date(prevMonthYear, prevMonthIndex, dayNumber));
    }

    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++)
    {
      days.push(new Date(date.getFullYear(), date.getMonth(), i));
    }

    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    const nextMonthYear = date.getMonth() === 11 ? date.getFullYear() + 1 : date.getFullYear();
    const nextMonthIndex = date.getMonth() === 11 ? 0 : date.getMonth() + 1;
    for (let i = 1; i <= remainingDays; i++)
    {
      days.push(new Date(nextMonthYear, nextMonthIndex, i));
    }

    const calendarIndex = isSecondMonth ? 1 : 0;
    const isSelectorOpen = showMonthYearSelector === calendarIndex;
    const years = generateYearRange();

    const isMonthDisabled = (month: number, year?: number): boolean =>
    {
      const testYear = year !== undefined ? year : date.getFullYear();
      const testDate = new Date(testYear, month, 1);
      if (minDate && testDate < new Date(minDate.getFullYear(), minDate.getMonth(), 1))
      {
        return true;
      }
      if (maxDate && testDate > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1))
      {
        return true;
      }
      return false;
    };

    const isYearDisabled = (year: number): boolean =>
    {
      if (minDate && year < minDate.getFullYear())
      {
        return true;
      }
      if (maxDate && year > maxDate.getFullYear())
      {
        return true;
      }
      return false;
    };

    return (
      <CalendarWrapper>
        <CalendarHeaderWrapper ref={calendarIndex === 0 ? selectorRef1 : selectorRef2}>
          <CalendarHeader>
            {!isSecondMonth ? (
              <NavButton
                onClick={handlePrevMonth}
                disabled={disabled || (minDate && new Date(currentDate.getFullYear(), currentDate.getMonth() - 1) < minDate)}
                aria-label="Previous month"
              >
                ‹
              </NavButton>
            ) : (
              <div />
            )}
            <MonthYearLabel
              onClick={() => handleMonthYearClick(calendarIndex)}
              disabled={disabled}
              aria-label="Select month and year"
            >
              {formatMonthYear(date)}
            </MonthYearLabel>
            {(isSecondMonth || months === 1) ? (
              <NavButton
                onClick={handleNextMonth}
                disabled={disabled || (maxDate && new Date(currentDate.getFullYear(), currentDate.getMonth() + 1) > maxDate)}
                aria-label="Next month"
              >
                ›
              </NavButton>
            ) : (
              <div />
            )}
          </CalendarHeader>
          {isSelectorOpen && (
            <MonthYearSelector>
              {selectorMode === 'year' ? (
                <>
                  <MonthYearSelectorHeader>
                    <MonthYearSelectorTitle>Select Year</MonthYearSelectorTitle>
                  </MonthYearSelectorHeader>
                  <YearGrid>
                    {years.map((year) =>
                    {
                      const isSelected = date.getFullYear() === year;
                      const isDisabled = isYearDisabled(year);
                      return (
                        <MonthYearCell
                          key={year}
                          $isSelected={isSelected}
                          $isDisabled={isDisabled}
                          onClick={() => handleYearSelect(year)}
                          disabled={isDisabled}
                        >
                          {year}
                        </MonthYearCell>
                      );
                    })}
                  </YearGrid>
                </>
              ) : (
                <>
                  <MonthYearSelectorHeader>
                    <BackButton onClick={handleBackToYear} aria-label="Back to year selection">
                      ‹
                    </BackButton>
                    <MonthYearSelectorTitle>Select Month</MonthYearSelectorTitle>
                    <div style={{ width: '32px' }} />
                  </MonthYearSelectorHeader>
                  <MonthYearGrid>
                    {monthNames.map((monthName, monthIndex) =>
                    {
                      if (selectedYear === null)
                      {
                        return null;
                      }
                      const isSelected = date.getMonth() === monthIndex && date.getFullYear() === selectedYear;
                      const isDisabled = isMonthDisabled(monthIndex, selectedYear);
                      return (
                        <MonthYearCell
                          key={monthIndex}
                          $isSelected={isSelected}
                          $isDisabled={isDisabled}
                          onClick={() => handleMonthSelect(monthIndex, calendarIndex)}
                          disabled={isDisabled}
                        >
                          {monthName}
                        </MonthYearCell>
                      );
                    })}
                  </MonthYearGrid>
                </>
              )}
            </MonthYearSelector>
          )}
        </CalendarHeaderWrapper>
        <CalendarGrid>
          {weekDays.map((day) => (
            <DayHeader key={day}>{day}</DayHeader>
          ))}
          {days.map((day, index) =>
          {
            if (!day)
            {
              return null;
            }
            const isOtherMonth = day.getMonth() !== date.getMonth();
            const isSelectedStart = !!(startDate && isSameDay(day, startDate));
            const isSelectedEnd = !!(endDate && isSameDay(day, endDate));
            const isInRange = !!(startDate && endDate && isDateInRange(day, startDate, endDate));
            const isSelected = isSelectedStart || isSelectedEnd;
            const isDisabled = isDateDisabled(day);

            return (
              <DayCell
                key={`${day.getTime()}-${index}`}
                onClick={() => handleDateClick(day)}
                $isSelected={isSelected}
                $isInRange={isInRange && !isSelected}
                $isStart={isSelectedStart}
                $isEnd={isSelectedEnd}
                $isToday={isToday(day)}
                $isDisabled={isDisabled}
                $isOtherMonth={isOtherMonth}
                disabled={isDisabled}
              >
                {day.getDate()}
              </DayCell>
            );
          })}
        </CalendarGrid>
      </CalendarWrapper>
    );
  };

  return (
    <DateRangePickerContainer $disabled={disabled} className={className}>
      <CalendarsContainer $months={months}>
        {renderCalendar(currentDate)}
        {months === 2 && renderCalendar(secondMonthDate, true)}
      </CalendarsContainer>
    </DateRangePickerContainer>
  );
};
