import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";

interface DistributionChartProps {
  title: string;
  data?: Array<{ name: string; value: number }>;
  colors?: string[];
  isLoading?: boolean;
  error?: unknown;
}

const DEFAULT_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

export default function DistributionChart({
  title,
  data,
  colors = DEFAULT_COLORS,
  isLoading,
  error,
}: DistributionChartProps) {
  if (isLoading) {
    return <LoadingSpinner message={`加载${title}...`} size="sm" variant="pulse" />;
  }

  if (error || !data) {
    return (
      <ErrorDisplay
        title={`${title}加载失败`}
        message="无法加载数据"
        type="warning"
        className="min-h-0 bg-transparent border-0"
      />
    );
  }
  return (
    <div className="bg-card-50 border border-border-50 rounded-sm p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow w-full max-w-full overflow-hidden">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground-50 mb-5">{title}</h3>
      <div className="w-full max-w-full" style={{ minHeight: "320px" }}>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(props) => {
                const entry = props as unknown as {
                  name: string;
                  percent: number;
                };
                const name = entry.name.length > 10 ? `${entry.name.slice(0, 8)}..` : entry.name;
                return `${name}: ${(entry.percent * 100).toFixed(0)}%`;
              }}
              outerRadius={window.innerWidth < 640 ? 70 : 90}
              fill="#8884d8"
              dataKey="value"
              style={{ fontSize: "13px", fontWeight: "500" }}
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={colors[data.indexOf(entry) % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card-100)",
                border: "1px solid var(--color-border-50)",
                borderRadius: "4px",
                color: "var(--color-foreground-50)",
                fontSize: "14px",
                padding: "8px 12px",
                fontWeight: "500",
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "14px",
                fontWeight: "500",
              }}
              iconSize={12}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
