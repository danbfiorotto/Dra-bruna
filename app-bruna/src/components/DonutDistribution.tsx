import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DonutDistributionProps } from '@/types/dashboard';

export function DonutDistribution({
  slices,
  onSliceClick,
  isLoading = false
}: DonutDistributionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="card-content">
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!slices || slices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Clínica</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...slices].sort((a, b) => b.revenue - a.revenue);
  const top = sorted.slice(0, 5);
  const others = sorted.slice(5);
  const otherRevenue = others.reduce((s, c) => s + c.revenue, 0);
  const otherShare = others.reduce((s, c) => s + c.share, 0);
  const display = otherRevenue > 0 ? [...top, { clinic: 'Outras', revenue: otherRevenue, share: otherShare }] : top;

  const colors = [
    '#60a5fa', // blue-400
    '#34d399', // emerald-400
    '#fbbf24', // amber-400
    '#f87171', // red-400
    '#a78bfa', // violet-400
    '#9ca3af'  // gray-400
  ];

  const total = display.reduce((s, c) => s + c.revenue, 0);

  return (
    <Card className="h-full flex flex-col min-w-[320px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Distribuição por Clínica</CardTitle>
      </CardHeader>
      <CardContent className="card-content flex-1 flex flex-col items-center justify-center pt-0">
        {/* Donut */}
        <div className="relative w-64 h-64 mb-6">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="35" fill="none" stroke="#f3f4f6" strokeWidth="12" />
            {display.map((slice, i) => {
              const circumference = 2 * Math.PI * 35;
              const stroke = colors[i % colors.length];
              const strokeDasharray = `${(slice.share * circumference) / 100} ${circumference}`;
              const strokeDashoffset = display
                .slice(0, i)
                .reduce((off, prev) => off - (prev.share * circumference) / 100, 0);
              return (
                <circle
                  key={slice.clinic}
                  cx="50"
                  cy="50"
                  r="35"
                  fill="none"
                  stroke={stroke}
                  strokeWidth="12"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => onSliceClick?.(slice.clinic)}
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-xl font-bold text-gray-900">
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-3">
          {display.map((slice, i) => (
            <div
              key={slice.clinic}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onSliceClick?.(slice.clinic)}
            >
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="text-sm font-medium text-gray-900 truncate">{slice.clinic}</span>
              </div>
              <div className="text-sm text-gray-600">{(slice.share * 100).toFixed(1)}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}