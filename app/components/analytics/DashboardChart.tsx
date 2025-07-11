// app/components/analytics/DashboardChart.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Select } from '@components/ui/select';
import { Skeleton } from '@components/ui/skeleton';
import { Alert } from '@components/ui/alert';
import { formatNumber, formatDate, formatPercentage } from '@utils/formatters';
import {
  generateChartColors,
  calculateTrend,
  processAnalyticsData,
} from '@utils/helpers';
import { trackAnalyticsEvent } from '@lib/analytics/tracker';
import type { AnalyticsData, ChartType, TimeRange } from '@types/analytics';

interface DashboardChartProps {
  title: string;
  data: AnalyticsData[];
  chartType?: ChartType;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  onExport?: () => void;
  loading?: boolean;
  error?: string;
  showTrend?: boolean;
  height?: number;
  className?: string;
}

export const DashboardChart: React.FC<DashboardChartProps> = ({
  title,
  data,
  chartType = 'line',
  timeRange = '7d',
  onTimeRangeChange,
  onExport,
  loading = false,
  error,
  showTrend = true,
  height = 300,
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [processedData, setProcessedData] = useState<any[]>([]);

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart', icon: Activity },
    { value: 'area', label: 'Area Chart', icon: TrendingUp },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChartIcon },
  ];

  useEffect(() => {
    if (data && data.length > 0) {
      const processed = processAnalyticsData(data, chartType, timeRange);
      setProcessedData(processed);
    }
  }, [data, chartType, timeRange]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await trackAnalyticsEvent('chart_refresh', {
        chartTitle: title,
        chartType,
        timeRange,
      });
      // Trigger parent refresh if available
      window.location.reload();
    } catch (error) {
      console.error('Chart refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = async () => {
    try {
      await trackAnalyticsEvent('chart_export', {
        chartTitle: title,
        chartType,
        timeRange,
        dataPoints: processedData.length,
      });
      onExport?.();
    } catch (error) {
      console.error('Chart export failed:', error);
    }
  };

  const trend =
    showTrend && processedData.length > 1
      ? calculateTrend(processedData)
      : null;

  const colors = generateChartColors(chartType);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <p className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {entry.name}: <strong>{formatNumber(entry.value)}</strong>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          <Skeleton height="200px" />
          <div className="flex space-x-2">
            <Skeleton width="60px" height="20px" />
            <Skeleton width="80px" height="20px" />
            <Skeleton width="70px" height="20px" />
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="error" title="Chart Error">
          {error}
        </Alert>
      );
    }

    if (!processedData || processedData.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p>No data available for the selected time range</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: processedData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={colors.primary}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={colors.primary}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={date => formatDate(date, 'short')}
                className="text-xs"
              />
              <YAxis tickFormatter={formatNumber} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.primary}
                fillOpacity={1}
                fill="url(#colorGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={date => formatDate(date, 'short')}
                className="text-xs"
              />
              <YAxis tickFormatter={formatNumber} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="value"
                fill={colors.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${formatPercentage(percent)}`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors.palette[index % colors.palette.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default: // line
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tickFormatter={date => formatDate(date, 'short')}
                className="text-xs"
              />
              <YAxis tickFormatter={formatNumber} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.primary}
                strokeWidth={3}
                dot={{ fill: colors.primary, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: colors.primary, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Chart Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {trend && (
            <Badge
              variant={
                trend.direction === 'up'
                  ? 'success'
                  : trend.direction === 'down'
                    ? 'error'
                    : 'default'
              }
              className="flex items-center space-x-1"
            >
              <TrendingUp
                size={12}
                className={trend.direction === 'down' ? 'rotate-180' : ''}
              />
              <span>{formatPercentage(Math.abs(trend.percentage))}</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {onTimeRangeChange && (
            <Select
              options={timeRangeOptions}
              value={timeRange}
              onChange={value => onTimeRangeChange(value as TimeRange)}
              className="min-w-[140px]"
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            isLoading={isRefreshing}
          >
            <RefreshCw size={16} />
          </Button>

          {onExport && (
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderChart()}
      </motion.div>

      {/* Chart Footer with Summary Stats */}
      {!loading && !error && processedData.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatNumber(Math.max(...processedData.map(d => d.value)))}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Peak
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatNumber(Math.min(...processedData.map(d => d.value)))}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Low
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatNumber(
                  processedData.reduce((sum, d) => sum + d.value, 0) /
                    processedData.length
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Average
              </div>
            </div>

            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatNumber(
                  processedData.reduce((sum, d) => sum + d.value, 0)
                )}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Total
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
