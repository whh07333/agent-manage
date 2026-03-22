import { Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

export interface StatsCardProps {
  title: string;
  value: number | string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
  loading?: boolean;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  trend,
  loading = false,
  className = '',
}) => {
  const renderTrend = () => {
    if (!trend) return null;

    const { value: trendValue, isPositive = true, label } = trend;
    const color = isPositive ? '#3f8600' : '#cf1322';
    const Icon = isPositive ? ArrowUpOutlined : ArrowDownOutlined;

    return (
      <div className="flex items-center gap-1" style={{ color }}>
        <Icon />
        <span className="text-sm">{trendValue}%</span>
        {label && <span className="text-xs text-gray-500 ml-1">{label}</span>}
      </div>
    );
  };

  return (
    <Card
      className={`shadow-sm hover:shadow-md transition-shadow ${className}`}
      loading={loading}
      bodyStyle={{ padding: '16px' }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="text-gray-500 text-sm mb-1">{title}</div>
          <div className="flex items-baseline gap-2">
            {prefix && <span className="text-lg">{prefix}</span>}
            <span className="text-2xl font-bold">{value}</span>
            {suffix && <span className="text-lg">{suffix}</span>}
          </div>
          {renderTrend()}
        </div>
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-600">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;