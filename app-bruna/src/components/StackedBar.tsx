import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StackedBarProps } from '@/types/dashboard';

export function StackedBar({ series, onSegmentClick, isLoading = false }: StackedBarProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const total = series.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recebido × Pendente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-h-[200px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm sm:text-base">Recebido × Pendente</CardTitle>
      </CardHeader>
      <CardContent className="card-content flex-1 flex flex-col space-y-3">
        {/* Bar Chart */}
        <div className="h-6 sm:h-8 bg-gray-100 rounded-lg overflow-hidden flex min-h-[24px]">
          {series.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const color = item.color || (index === 0 ? '#10b981' : '#f59e0b');
            
            return (
              <div
                key={item.name}
                className="flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity min-w-0"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: color
                }}
                onClick={() => onSegmentClick?.(item.name)}
              >
                {percentage > 15 && (
                  <span className="truncate px-1">
                    {percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4">
          {series.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const color = item.color || (index === 0 ? '#10b981' : '#f59e0b');
            
            return (
              <div key={item.name} className="flex items-center gap-2 min-w-0">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs sm:text-sm text-muted-foreground truncate">
                  {item.name}: {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} ({percentage.toFixed(1)}%)
                </span>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="pt-2 border-t mt-auto">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-medium truncate ml-2">
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
