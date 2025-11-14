import React from 'react';
import styled from 'styled-components';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface AxChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: Array<Record<string, any>>;
  dataKey: string;
  dataKeys?: string[];
  width?: number | string;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  title?: string;
}

interface StyledChartContainerProps {
  $width?: number | string;
  $height?: number;
}

const StyledChartContainer = styled.div<StyledChartContainerProps>`
  font-family: var(--font-family-base);
  width: ${({ $width }) => ($width ? (typeof $width === 'number' ? `${$width}px` : $width) : '100%')};
  height: ${({ $height }) => ($height ? `${$height}px` : '400px')};
  padding: var(--spacing-lg);
  background-color: var(--color-background-default);
  border-radius: var(--radius-md);
`;

const StyledChartTitle = styled.h3`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
`;

const defaultColors = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-danger)',
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#00ff00',
];

// Convert CSS variables to hex colors for Recharts
const cssVarToColor = (cssVar: string): string => {
  // For now, return a default color if it's a CSS variable
  // In a real implementation, you might want to compute the actual color
  const colorMap: Record<string, string> = {
    'var(--color-primary)': '#3b82f6',
    'var(--color-secondary)': '#8b5cf6',
    'var(--color-danger)': '#ef4444',
  };
  return colorMap[cssVar] || cssVar;
};

export const AxChart: React.FC<AxChartProps> = ({
  type,
  data,
  dataKey,
  dataKeys = [],
  width,
  height = 400,
  colors = defaultColors,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  title,
}) => {
  const renderChart = () => {
    const chartProps = {
      data,
      width: width ? (typeof width === 'number' ? width : undefined) : undefined,
      height,
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />}
              <XAxis dataKey={dataKey} stroke="var(--color-text-secondary)" />
              <YAxis stroke="var(--color-text-secondary)" />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {dataKeys.length > 0 ? (
                dataKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={cssVarToColor(colors[index % colors.length])}
                    strokeWidth={2}
                  />
                ))
              ) : (
                <Line type="monotone" dataKey="value" stroke={cssVarToColor(colors[0])} strokeWidth={2} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />}
              <XAxis dataKey={dataKey} stroke="var(--color-text-secondary)" />
              <YAxis stroke="var(--color-text-secondary)" />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {dataKeys.length > 0 ? (
                dataKeys.map((key, index) => (
                  <Bar key={key} dataKey={key} fill={cssVarToColor(colors[index % colors.length])} />
                ))
              ) : (
                <Bar dataKey="value" fill={cssVarToColor(colors[0])} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart {...chartProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default)" />}
              <XAxis dataKey={dataKey} stroke="var(--color-text-secondary)" />
              <YAxis stroke="var(--color-text-secondary)" />
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
              {dataKeys.length > 0 ? (
                dataKeys.map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={cssVarToColor(colors[index % colors.length])}
                    fill={cssVarToColor(colors[index % colors.length])}
                    fillOpacity={0.6}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={cssVarToColor(colors[0])}
                  fill={cssVarToColor(colors[0])}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={cssVarToColor(colors[index % colors.length])} />
                ))}
              </Pie>
              {showTooltip && <Tooltip />}
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <StyledChartContainer $width={width} $height={height}>
      {title && <StyledChartTitle>{title}</StyledChartTitle>}
      {renderChart()}
    </StyledChartContainer>
  );
};

