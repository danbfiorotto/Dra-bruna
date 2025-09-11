import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  CheckCircle, 
  DollarSign, 
  FileText, 
  Clock,
  AlertCircle
} from 'lucide-react';
import { ActivityFeedProps } from '@/types/dashboard';

export function ActivityFeed({ events, isLoading = false }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="space-y-4">
            <Clock className="h-8 w-8 mb-2" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'patient.created':
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case 'appointment.completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'payment.registered':
        return <DollarSign className="h-4 w-4 text-emerald-600" />;
      case 'document.sent':
        return <FileText className="h-4 w-4 text-purple-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'patient.created':
        return 'bg-blue-100 text-blue-800';
      case 'appointment.completed':
        return 'bg-green-100 text-green-800';
      case 'payment.registered':
        return 'bg-emerald-100 text-emerald-800';
      case 'document.sent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'patient.created':
        return 'Paciente';
      case 'appointment.completed':
        return 'Consulta';
      case 'payment.registered':
        return 'Pagamento';
      case 'document.sent':
        return 'Documento';
      default:
        return 'Atividade';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(event.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {event.title}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getActivityColor(event.type)}`}
                  >
                    {getActivityTypeLabel(event.type)}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {event.by} • {event.ago}
                </div>
                
                {event.details && (
                  <div className="text-xs text-gray-600 mt-1">
                    {event.details}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="pt-4 mt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total de atividades</div>
              <div className="font-medium">{events.length}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Última atividade</div>
              <div className="font-medium">
                {events[0]?.ago || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
