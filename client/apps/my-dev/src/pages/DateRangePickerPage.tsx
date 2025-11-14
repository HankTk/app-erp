import { useState } from 'react';
import { AxCard, AxDateRangePicker, AxHeading3, AxParagraph } from '@ui/components';
import styled from 'styled-components';

const ExampleContainer = styled.div`
  margin-bottom: var(--spacing-4xl);
  width: 100%;
  max-width: 1200px;
`;

const RangeDisplay = styled.div`
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--color-background-disabled);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

const CalendarWithMenuContainer = styled.div`
  display: flex;
  gap: var(--spacing-xl);
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px)
  {
    flex-direction: column;
    gap: var(--spacing-xl);
  }
`;

const PredefinedRangesContainer = styled.div`
  flex-shrink: 0;
  min-width: 220px;
  max-width: 220px;
  width: 220px;
  background-color: var(--color-background-default);
  border: 2px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow-md);
  box-sizing: border-box;
  overflow: hidden;
`;

const MenuListTitle = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border-default);
`;

const MenuItem = styled.button<{ $isActive?: boolean; $isClear?: boolean }>`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md);
  background-color: ${({ $isActive }) =>
  {
    return $isActive ? 'var(--color-primary)' : 'transparent';
  }};
  color: ${({ $isActive, $isClear }) =>
  {
    if ($isClear)
    {
      return 'var(--color-danger)';
    }
    return $isActive ? 'var(--color-text-inverse)' : 'var(--color-text-primary)';
  }};
  border: 2px solid ${({ $isActive }) =>
  {
    return $isActive ? 'var(--color-primary)' : 'transparent';
  }};
  border-radius: var(--radius-sm);
  text-align: left;
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  cursor: pointer;
  transition: all var(--transition-base);
  min-height: 40px;
  display: flex;
  align-items: center;

  &:hover:not(:disabled)
  {
    background-color: ${({ $isActive, $isClear }) =>
    {
      if ($isClear)
      {
        return 'rgba(220, 53, 69, 0.1)';
      }
      return $isActive ? 'var(--color-primary-hover)' : 'var(--color-background-disabled)';
    }};
    border-color: ${({ $isActive, $isClear }) =>
    {
      if ($isClear)
      {
        return 'var(--color-danger)';
      }
      return $isActive ? 'var(--color-primary-hover)' : 'var(--color-border-focus)';
    }};
  }

  &:disabled
  {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }
`;

const formatDate = (date: Date | null): string => {
  if (!date) return 'Not selected';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export function DateRangePickerPage() {
  const [range1, setRange1] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [range2, setRange2] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [range3, setRange3] = useState<{ start: Date | null; end: Date | null }>({
    start: new Date(2024, 0, 15),
    end: new Date(2024, 0, 25),
  });

  const [range4, setRange4] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [range5, setRange5] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const [selectedPredefinedRange, setSelectedPredefinedRange] = useState<string | null>(null);

  const today = new Date();
  const minDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);

  const getPredefinedRange = (rangeType: string): { start: Date; end: Date } | null =>
  {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    switch (rangeType)
    {
      case 'today':
        return { start: startOfToday, end: endOfToday };
      case 'yesterday':
        const yesterday = new Date(startOfToday);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: yesterday, end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59, 999) };
      case 'last7days':
        const last7Start = new Date(startOfToday);
        last7Start.setDate(last7Start.getDate() - 6);
        return { start: last7Start, end: endOfToday };
      case 'last30days':
        const last30Start = new Date(startOfToday);
        last30Start.setDate(last30Start.getDate() - 29);
        return { start: last30Start, end: endOfToday };
      case 'thisWeek':
        const dayOfWeek = now.getDay();
        const thisWeekStart = new Date(startOfToday);
        thisWeekStart.setDate(thisWeekStart.getDate() - dayOfWeek);
        return { start: thisWeekStart, end: endOfToday };
      case 'lastWeek':
        const dayOfWeek2 = now.getDay();
        const lastWeekStart = new Date(startOfToday);
        lastWeekStart.setDate(lastWeekStart.getDate() - dayOfWeek2 - 7);
        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekEnd.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);
        return { start: lastWeekStart, end: lastWeekEnd };
      case 'thisMonth':
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: thisMonthStart, end: endOfToday };
      case 'lastMonth':
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        return { start: lastMonthStart, end: lastMonthEnd };
      case 'thisYear':
        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        return { start: thisYearStart, end: endOfToday };
      case 'lastYear':
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        return { start: lastYearStart, end: lastYearEnd };
      default:
        return null;
    }
  };

  const handlePredefinedRangeClick = (rangeType: string) =>
  {
    const range = getPredefinedRange(rangeType);
    if (range)
    {
      setRange5(range);
      setSelectedPredefinedRange(rangeType);
    }
  };

  const handleCustomRangeChange = (range: { start: Date | null; end: Date | null }) =>
  {
    setRange5(range);
    setSelectedPredefinedRange(null);
  };

  const handleClear = () =>
  {
    setRange5({ start: null, end: null });
    setSelectedPredefinedRange(null);
  };

  const predefinedRanges = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: 'last7days', label: 'Last 7 Days' },
    { key: 'last30days', label: 'Last 30 Days' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'lastWeek', label: 'Last Week' },
    { key: 'thisMonth', label: 'This Month' },
    { key: 'lastMonth', label: 'Last Month' },
    { key: 'thisYear', label: 'This Year' },
    { key: 'lastYear', label: 'Last Year' },
  ];

  return (
    <>
      <ExampleContainer>
        <AxCard padding="large" maxWidth="600px">
          <AxHeading3>Single Month View</AxHeading3>
          <AxParagraph>
            Basic date range picker with a single month calendar view.
          </AxParagraph>
          <AxDateRangePicker
            value={range1}
            onChange={setRange1}
            months={1}
          />
          <RangeDisplay>
            <strong>Selected Range:</strong> {formatDate(range1.start)} - {formatDate(range1.end)}
          </RangeDisplay>
        </AxCard>
      </ExampleContainer>

      <ExampleContainer>
        <AxCard padding="large" maxWidth="900px">
          <AxHeading3>Two Month View</AxHeading3>
          <AxParagraph>
            Date range picker displaying two months side by side for easier range selection.
          </AxParagraph>
          <AxDateRangePicker
            value={range2}
            onChange={setRange2}
            months={2}
          />
          <RangeDisplay>
            <strong>Selected Range:</strong> {formatDate(range2.start)} - {formatDate(range2.end)}
          </RangeDisplay>
        </AxCard>
      </ExampleContainer>

      <ExampleContainer>
        <AxCard padding="large" maxWidth="600px">
          <AxHeading3>With Pre-selected Range</AxHeading3>
          <AxParagraph>
            Date range picker with a pre-selected date range.
          </AxParagraph>
          <AxDateRangePicker
            value={range3}
            onChange={setRange3}
            months={1}
          />
          <RangeDisplay>
            <strong>Selected Range:</strong> {formatDate(range3.start)} - {formatDate(range3.end)}
          </RangeDisplay>
        </AxCard>
      </ExampleContainer>

      <ExampleContainer>
        <AxCard padding="large" maxWidth="900px">
          <AxHeading3>Two Month View with Date Constraints</AxHeading3>
          <AxParagraph>
            Date range picker with min and max date constraints. Dates outside the allowed range are disabled.
          </AxParagraph>
          <AxDateRangePicker
            value={range4}
            onChange={setRange4}
            months={2}
            minDate={minDate}
            maxDate={maxDate}
          />
          <RangeDisplay>
            <strong>Selected Range:</strong> {formatDate(range4.start)} - {formatDate(range4.end)}
            <br />
            <strong>Allowed Range:</strong> {formatDate(minDate)} - {formatDate(maxDate)}
          </RangeDisplay>
        </AxCard>
      </ExampleContainer>

      <ExampleContainer>
        <AxCard padding="large" maxWidth="600px">
          <AxHeading3>Disabled State</AxHeading3>
          <AxParagraph>
            Date range picker in disabled state.
          </AxParagraph>
          <AxDateRangePicker
            value={range1}
            onChange={setRange1}
            months={1}
            disabled
          />
        </AxCard>
      </ExampleContainer>

      <ExampleContainer>
        <AxCard padding="large" maxWidth="1060px">
          <AxHeading3>Predefined and Custom Range Selection</AxHeading3>
          <AxParagraph>
            Select from predefined date ranges or choose a custom range using the date picker.
          </AxParagraph>
          <CalendarWithMenuContainer>
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <AxDateRangePicker
                value={range5}
                onChange={handleCustomRangeChange}
                months={2}
              />
            </div>
            <PredefinedRangesContainer>
              <MenuListTitle>Quick Select</MenuListTitle>
              {predefinedRanges.map((range) =>
              {
                return (
                  <MenuItem
                    key={range.key}
                    $isActive={selectedPredefinedRange === range.key}
                    onClick={() => handlePredefinedRangeClick(range.key)}
                  >
                    {range.label}
                  </MenuItem>
                );
              })}
              <MenuItem
                $isClear
                onClick={handleClear}
                disabled={!range5.start && !range5.end}
              >
                Clear Selection
              </MenuItem>
            </PredefinedRangesContainer>
          </CalendarWithMenuContainer>
          <RangeDisplay>
            <strong>Selected Range:</strong> {formatDate(range5.start)} - {formatDate(range5.end)}
            {selectedPredefinedRange && (
              <>
                <br />
                <strong>Predefined Range:</strong> {selectedPredefinedRange.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </>
            )}
          </RangeDisplay>
        </AxCard>
      </ExampleContainer>
    </>
  );
}

