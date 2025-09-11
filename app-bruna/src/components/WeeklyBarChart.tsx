import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { WeeklyBarChartProps } from '@/types/dashboard';

export function WeeklyBarChart({ 
  data, 
  metric = 'appointments', 
  onBarClick, 
  isLoading = false 
}: WeeklyBarChartProps) {
  const [selectedMetric, setSelectedMetric] = React.useState<'appointments' | 'revenue'>(metric);

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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produtividade Semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d[selectedMetric]));
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getValue = (item: any) => {
    return selectedMetric === 'appointments' ? item.appointments : item.revenue;
  };

  const formatValue = (value: number) => {
    if (selectedMetric === 'revenue') {
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Produtividade Semanal</CardTitle>
          <ToggleGroup
            type="single"
            value={selectedMetric}
            onValueChange={(value) => setSelectedMetric(value as 'appointments' | 'revenue')}
          >
            <ToggleGroupItem value="appointments">Atendimentos</ToggleGroupItem>
            <ToggleGroupItem value="revenue">Receita</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="card-content">
        <div className="space-y-4">
          {/* Chart */}
          <div className="h-48 flex items-end justify-between gap-2">
            {data.map((item) => {
              const value = getValue(item);
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              const dayName = dayNames[new Date(item.date).getDay()];
              
              return (
                <div key={item.date} className="flex flex-col items-center flex-1">
                  <div className="flex flex-col items-center space-y-2">
                    {/* Bar */}
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 cursor-pointer transition-colors rounded-t"
                      style={{ height: `${height}%` }}
                      onClick={() => onBarClick?.(item.date)}
                    />
                    
                    {/* Occupancy line */}
                    {item.occupancy > 0 && (
                      <div
                        className="w-full border-t-2 border-dashed border-gray-400"
                        style={{ height: `${(item.occupancy * height) / 100}%` }}
                      />
                    )}
                  </div>
                  
                  {/* Day label */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {dayName}
                  </div>
                  
                  {/* Value label */}
                  <div className="text-xs font-medium">
                    {formatValue(value)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              {selectedMetric === 'appointments' ? 'Atendimentos' : 'Receita'}
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 border-t-2 border-dashed border-gray-400" />
              Ocupação
            </div>
          </div>

          {/* Summary */}
          <div className="pt-2 border-t">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-muted-foreground">Total</div>
                <div className="font-medium">
                  {formatValue(data.reduce((sum, item) => sum + getValue(item), 0))}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Média</div>
                <div className="font-medium">
                  {formatValue(data.reduce((sum, item) => sum + getValue(item), 0) / data.length)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground">Ocupação</div>
                <div className="font-medium">
                  {((data.reduce((sum, item) => sum + item.occupancy, 0) / data.length) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
