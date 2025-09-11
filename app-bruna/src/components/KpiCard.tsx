import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KpiCardProps } from '@/types/dashboard';

export function KpiCard({ 
  label, 
  value, 
  delta, 
  suffix = '', 
  sparklineData, 
  onClick, 
  isLoading = false 
}: KpiCardProps) {
  // Format value based on type
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (suffix === 'R$') {
        return val.toLocaleString('pt-BR', { 
          style: 'currency', 
          currency: 'BRL',
          minimumFractionDigits: 2 
        });
      }
      if (suffix === '%') {
        return `${(val * 100).toFixed(1)}%`;
      }
      return val.toLocaleString('pt-BR');
    }
    return val;
  };

  // Get delta display info
  const getDeltaInfo = (deltaValue?: number) => {
    if (deltaValue === undefined || deltaValue === 0) {
      return { icon: Minus, color: 'text-gray-500', text: '0%' };
    }
    
    const isPositive = deltaValue > 0;
    const percentage = Math.abs(deltaValue * 100);
    
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      text: `${isPositive ? '+' : '-'}${percentage.toFixed(1)}%`
    };
  };

  const deltaInfo = getDeltaInfo(delta);

  // Generate sparkline data (simplified - would use a proper charting library in production)
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.data.length === 0) return null;

    const max = Math.max(...sparklineData.data);
    const min = Math.min(...sparklineData.data);
    const range = max - min || 1;

    const points = sparklineData.data.map((value, index) => {
      const x = (index / (sparklineData.data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-8 w-full">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-blue-500"
          />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-20" />
          <div className="mt-2">
            <Skeleton className="h-6 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer min-h-[120px] flex flex-col" 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 min-h-[40px]">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground leading-tight break-words">
          {label}
        </CardTitle>
        {sparklineData && (
          <div className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {sparklineData.period}
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="text-lg sm:text-xl lg:text-2xl font-bold break-all">
          {formatValue(value)}
          {suffix && suffix !== 'R$' && suffix !== '%' && (
            <span className="text-xs sm:text-sm text-muted-foreground ml-1">{suffix}</span>
          )}
        </div>
        
        {delta !== undefined && (
          <div className={`flex items-center text-xs ${deltaInfo.color} mt-1`}>
            <deltaInfo.icon className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{deltaInfo.text}</span>
          </div>
        )}

        {sparklineData && (
          <div className="mt-2 flex-shrink-0">
            {renderSparkline()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Skeleton component for loading state
export function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
        <div className="mt-2">
          <Skeleton className="h-6 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
