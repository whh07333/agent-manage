import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface LineChartProps {
  data: any[];
  xKey: string;
  yKeys: { key: string; name: string; color: string }[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  loading?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKeys,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  loading = false,
}) => {
  if (loading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height: `${height}px` }}
      >
        <div className="text-gray-500">暂无数据</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <div className="text-lg font-medium mb-4">{title}</div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />}
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {yKeys.map(({ key, name, color }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={name}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;