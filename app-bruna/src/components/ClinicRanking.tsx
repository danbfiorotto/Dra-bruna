import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Medal, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { ClinicRankingProps } from '@/types/dashboard';

export function ClinicRanking({
  rows,
  onRowClick,
  onSeeAll,
  isLoading = false
}: ClinicRankingProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="card-content">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Clínicas</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Nenhum dado disponível
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Medal className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-medium text-gray-400">#{index + 1}</span>;
    }
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (delta < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  return (
    <Card className="h-full flex flex-col min-w-[320px]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Ranking de Clínicas</CardTitle>
          {onSeeAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSeeAll} 
              className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
            >
              Ver todas <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="card-content flex-1 flex flex-col pt-0">
        <div className="space-y-3 flex-1">
          {rows.slice(0, 5).map((clinic, index) => (
            <div
              key={clinic.clinic_id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onRowClick?.(clinic.clinic_id)}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 flex justify-center">
                {getRankIcon(index)}
              </div>

              {/* Clinic */}
              <div className="flex-1 min-w-0 px-2">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {clinic.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {clinic.appointments} atendimentos • Ticket {clinic.avg_ticket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </div>
              </div>

              {/* Revenue + Delta */}
              <div className="flex items-center space-x-2">
                <div className="text-lg font-bold text-gray-900">
                  {clinic.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </div>
                {getDeltaIcon(clinic.delta)}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="pt-4 mt-4 border-t border-gray-200 grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-xs text-gray-500">Total de clínicas</div>
            <div className="font-semibold text-gray-900">{rows.length}</div>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-xs text-gray-500">Receita total</div>
            <div className="font-semibold text-gray-900">
              {rows.reduce((sum, clinic) => sum + clinic.revenue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}