import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, DollarSign } from 'lucide-react';
import { TodayListProps } from '@/types/dashboard';

export function TodayList({ 
  appointments, 
  isLoading = false 
}: Omit<TodayListProps, 'onConfirm' | 'onMarkCompleted' | 'onOpenRecord'>) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!appointments || appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consultas de Hoje</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="space-y-2">
            <Clock className="h-8 w-8 mb-2" />
            <p className="text-sm">Nenhuma consulta agendada para hoje</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmada':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Pendente':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'Pago':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmada':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pago':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultas de Hoje</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors gap-2"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getStatusIcon(appointment.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {appointment.time}
                    </span>
                    <span className="text-sm font-medium truncate">
                      {appointment.patient}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {appointment.clinic} • {appointment.procedure}
                  </div>
                  {appointment.amount > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {appointment.amount.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end sm:justify-start">
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="pt-4 mt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total de consultas</div>
              <div className="font-medium">{appointments.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Confirmadas</div>
              <div className="font-medium">
                {appointments.filter(a => a.status === 'Confirmada').length}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
