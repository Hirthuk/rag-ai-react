import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";

// Format large numbers
const formatCurrency = (value) => {
  if (!value && value !== 0) return "$0";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
};

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-white font-semibold mb-2">{label}</p>
      {payload.map((entry, i) =>
        entry.value !== null ? (
          <div key={i} className="flex items-center gap-2 text-sm mt-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-300">{entry.name}:</span>
            <span className="text-white font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ) : null
      )}
    </div>
  );
};

// Main Component
export default function FinancialChart({ chartData, chartType }) {
  // Validate chart data
  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 rounded-lg border border-gray-200">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
        <div className="text-gray-500">No chart data available</div>
        <div className="text-gray-400 text-sm mt-1">
          Ask about company profits, revenue, or growth trends
        </div>
      </div>
    );
  }

  // Format data for display
  const formattedData = chartData.map((item) => ({
    year: String(item.year),
    profit: Number(item.profit) || Number(item.value) || 0,
    type: item.type,
  }));

  // Build two-series data when historical/forecast types are present
  const hasTypedData = formattedData.some(
    (d) => d.type === "historical" || d.type === "forecast"
  );
  const lastHistIdx = hasTypedData
    ? formattedData.reduce((acc, d, i) => (d.type === "historical" ? i : acc), -1)
    : -1;
  const twoSeriesData = hasTypedData
    ? formattedData.map((d, i) => ({
        year: d.year,
        Historical: d.type === "historical" ? d.profit : null,
        // Share the last historical point in Forecast series so the lines connect
        Forecast:
          d.type === "forecast" ? d.profit : i === lastHistIdx ? d.profit : null,
      }))
    : null;

  console.log("Rendering chart:", { formattedData, chartType });

  // Calculate trend
  const values = formattedData.map((d) => d.profit);
  const firstValue = values[0];
  const lastValue = values[values.length - 1];
  const trend = lastValue > firstValue ? "upward" : "downward";
  const percentChange = (((lastValue - firstValue) / firstValue) * 100).toFixed(
    1,
  );

  const maxValue = Math.max(...values);
  const maxYear = formattedData.find((d) => d.profit === maxValue)?.year;
  const minValue = Math.min(...values);
  const minYear = formattedData.find((d) => d.profit === minValue)?.year;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Header with detailed insights */}
      <div className="flex justify-between items-start mb-4 pb-2 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">
            Financial Performance
          </h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {trend === "upward" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className="text-xs font-medium text-gray-700">
              {trend === "upward" ? "↑" : "↓"} {Math.abs(percentChange)}%
              {trend === "upward" ? " growth" : " decline"}
            </span>
            <span className="text-xs text-gray-500">
              {formatCurrency(firstValue)} → {formatCurrency(lastValue)}
            </span>
            {maxYear && (
              <span className="text-xs text-gray-500">
                | Peak: {formatCurrency(maxValue)} ({maxYear})
              </span>
            )}
            {minYear && minValue !== maxValue && (
              <span className="text-xs text-gray-500">
                | Low: {formatCurrency(minValue)} ({minYear})
              </span>
            )}
          </div>
        </div>
        <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
          {chartType === "bar" ? "Bar chart" : "Line chart"}
        </div>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          {chartType === "bar" ? (
            <BarChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="profit"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                label={{
                  position: "top",
                  formatter: (value) => formatCurrency(value),
                  fontSize: 11,
                  fill: "#6b7280",
                }}
              />
            </BarChart>
          ) : hasTypedData ? (
            // Two-series line chart: solid blue = historical, dashed amber = forecast
            <LineChart data={twoSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "#6b7280", paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="Historical"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: "#3b82f6" }}
                activeDot={{ r: 7 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="Forecast"
                stroke="#f59e0b"
                strokeWidth={3}
                strokeDasharray="6 4"
                dot={{ r: 5, fill: "#f59e0b" }}
                activeDot={{ r: 7 }}
                connectNulls={false}
              />
            </LineChart>
          ) : (
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <YAxis
                tickFormatter={formatCurrency}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                axisLine={{ stroke: "#e5e7eb" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 5, fill: "#3b82f6", strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
