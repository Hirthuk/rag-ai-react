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
} from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";

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
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-300">Value:</span>
          <span className="text-white font-medium">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
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

  // Ensure data has the correct format
  const formattedData = chartData.map((item) => ({
    year: String(item.year),
    value:
      Number(item.value) || Number(item.profit) || Number(item.revenue) || 0,
  }));

  console.log("Rendering chart with data:", formattedData);
  console.log("Chart type:", chartType);

  // Calculate trend for insights
  const values = formattedData.map((d) => d.value);
  const trend = values[values.length - 1] > values[0] ? "upward" : "downward";
  const maxValue = Math.max(...values);
  const maxYear = formattedData.find((d) => d.value === maxValue)?.year;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Header */}
      <div className="flex justify-between items-start mb-4 pb-2 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-semibold text-gray-700">
            Financial Performance
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp
              className={`w-4 h-4 ${trend === "upward" ? "text-green-500" : "text-red-500"}`}
            />
            <span className="text-xs text-gray-500">
              {trend === "upward" ? "Upward trend" : "Downward trend"}
            </span>
            {maxYear && (
              <span className="text-xs text-gray-500">| Peak: {maxYear}</span>
            )}
          </div>
        </div>
        <div className="rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600">
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
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
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
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "white", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
