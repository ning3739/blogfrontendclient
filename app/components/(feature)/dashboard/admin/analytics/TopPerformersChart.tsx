import { useRouter } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";

interface TopPerformersChartProps {
  title: string;
  data?: Array<{
    title: string;
    value: number;
    blog_slug?: string;
    section_slug?: string;
  }>;
  dataKey: string;
  color?: string;
  isLoading?: boolean;
  error?: unknown;
}

export default function TopPerformersChart({
  title,
  data,
  color = "#3B82F6",
  isLoading,
  error,
}: TopPerformersChartProps) {
  const router = useRouter();

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
  const chartData = data.map((item, index) => ({
    name: item.title.length > 15 ? `${item.title.slice(0, 12)}...` : item.title,
    fullName: item.title,
    value: item.value,
    blog_slug: item.blog_slug,
    section_slug: item.section_slug,
    index,
  }));

  // biome-ignore lint/suspicious/noExplicitAny: Recharts event data type is not well-defined
  const handleBarClick = (data: any) => {
    if (data?.blog_slug && data?.section_slug) {
      router.push(`/${data.section_slug}/${data.blog_slug}`);
    }
  };

  return (
    <div className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-foreground-50 mb-4">{title}</h3>
      <div className="w-full max-w-full" style={{ minHeight: "300px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: -20, right: 10, top: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-50)" opacity={0.3} />
            <XAxis
              type="number"
              stroke="var(--color-foreground-400)"
              style={{ fontSize: "10px" }}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--color-foreground-400)"
              style={{ fontSize: "9px" }}
              width={70}
              tick={{ fontSize: 9, width: 70 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      style={{
                        backgroundColor: "var(--color-card-100)",
                        border: "1px solid var(--color-border-50)",
                        borderRadius: "4px",
                        padding: "8px",
                        fontSize: "11px",
                        color: "var(--color-foreground-50)",
                        maxWidth: "200px",
                      }}
                    >
                      <p className="font-medium mb-1 break-words">{payload[0].payload.fullName}</p>
                      <p className="text-foreground-400">
                        {payload[0].name}: {payload[0].value}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar
              dataKey="value"
              fill={color}
              radius={[0, 4, 4, 0]}
              onClick={handleBarClick}
              style={{ cursor: "pointer" }}
            >
              {chartData.map((entry) => (
                <Cell key={`cell-${entry.name}-${entry.value}`} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
