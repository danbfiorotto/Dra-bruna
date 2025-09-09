import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Merge, 
  Eye, 
  RefreshCw,
  Trash2
} from 'lucide-react';

export interface ConflictInfo {
  id: string;
  entity_type: string;
  entity_id: string;
  local_data: any;
  server_data: any;
  conflict_type: string;
  recommended_action: string;
  created_at: string;
}

export interface ConflictResolution {
  conflict_id: string;
  resolution: 'local_wins' | 'server_wins' | 'merge' | 'manual';
  merged_data?: any;
}

interface ConflictResolutionProps {
  conflicts: ConflictInfo[];
  onResolve: (resolutions: ConflictResolution[]) => Promise<void>;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export const ConflictResolution: React.FC<ConflictResolutionProps> = ({
  conflicts,
  onResolve,
  onRefresh,
  isLoading = false
}) => {
  const [resolutions, setResolutions] = useState<Map<string, ConflictResolution>>(new Map());
  const [expandedConflicts, setExpandedConflicts] = useState<Set<string>>(new Set());
  const [isResolving, setIsResolving] = useState(false);

  // Inicializar resoluções recomendadas
  useEffect(() => {
    const initialResolutions = new Map<string, ConflictResolution>();
    
    conflicts.forEach(conflict => {
      const resolution: ConflictResolution = {
        conflict_id: conflict.id,
        resolution: getRecommendedResolution(conflict.recommended_action),
      };
      initialResolutions.set(conflict.id, resolution);
    });
    
    setResolutions(initialResolutions);
  }, [conflicts]);

  const getRecommendedResolution = (action: string): 'local_wins' | 'server_wins' | 'merge' | 'manual' => {
    switch (action.toLowerCase()) {
      case 'localwins':
        return 'local_wins';
      case 'serverwins':
        return 'server_wins';
      case 'merge':
        return 'merge';
      case 'manual':
        return 'manual';
      default:
        return 'server_wins';
    }
  };

  const getConflictIcon = (conflictType: string) => {
    switch (conflictType) {
      case 'deleted_remotely':
        return <Trash2 className="h-4 w-4 text-red-500" />;
      case 'both_modified':
        return <Merge className="h-4 w-4 text-yellow-500" />;
      case 'duplicate_creation':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResolutionIcon = (resolution: string) => {
    switch (resolution) {
      case 'local_wins':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'server_wins':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'merge':
        return <Merge className="h-4 w-4 text-purple-500" />;
      case 'manual':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getResolutionLabel = (resolution: string) => {
    switch (resolution) {
      case 'local_wins':
        return 'Local vence';
      case 'server_wins':
        return 'Servidor vence';
      case 'merge':
        return 'Mesclar';
      case 'manual':
        return 'Resolução manual';
      default:
        return 'Não resolvido';
    }
  };

  const getResolutionColor = (resolution: string) => {
    switch (resolution) {
      case 'local_wins':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'server_wins':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'merge':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manual':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleResolutionChange = (conflictId: string, resolution: string) => {
    setResolutions(prev => {
      const newResolutions = new Map(prev);
      const current = newResolutions.get(conflictId);
      if (current) {
        newResolutions.set(conflictId, {
          ...current,
          resolution: resolution as any,
        });
      }
      return newResolutions;
    });
  };

  const toggleExpanded = (conflictId: string) => {
    setExpandedConflicts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(conflictId)) {
        newSet.delete(conflictId);
      } else {
        newSet.add(conflictId);
      }
      return newSet;
    });
  };

  const handleResolveAll = async () => {
    setIsResolving(true);
    try {
      const resolutionArray = Array.from(resolutions.values());
      await onResolve(resolutionArray);
    } catch (error) {
      console.error('Erro ao resolver conflitos:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleRefresh = async () => {
    await onRefresh();
  };

  const getConflictsByType = () => {
    const grouped = conflicts.reduce((acc, conflict) => {
      if (!acc[conflict.entity_type]) {
        acc[conflict.entity_type] = [];
      }
      acc[conflict.entity_type].push(conflict);
      return acc;
    }, {} as Record<string, ConflictInfo[]>);

    return grouped;
  };

  const conflictsByType = getConflictsByType();
  const totalConflicts = conflicts.length;
  const resolvedConflicts = Array.from(resolutions.values()).filter(r => r.resolution !== 'manual').length;

  if (totalConflicts === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum conflito encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            Todos os dados estão sincronizados corretamente.
          </p>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Resolução de Conflitos
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {resolvedConflicts} de {totalConflicts} conflitos resolvidos
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Button
                onClick={handleResolveAll}
                disabled={isResolving || resolvedConflicts === totalConflicts}
              >
                {isResolving ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Resolver Todos
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Barra de progresso */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(resolvedConflicts / totalConflicts) * 100}%` }}
        />
      </div>

      {/* Conflitos por tipo */}
      <Tabs defaultValue={Object.keys(conflictsByType)[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {Object.keys(conflictsByType).map((type) => (
            <TabsTrigger key={type} value={type}>
              {type} ({conflictsByType[type].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(conflictsByType).map(([type, typeConflicts]) => (
          <TabsContent key={type} value={type} className="space-y-4">
            {typeConflicts.map((conflict) => {
              const resolution = resolutions.get(conflict.id);
              const isExpanded = expandedConflicts.has(conflict.id);
              
              return (
                <Card key={conflict.id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getConflictIcon(conflict.conflict_type)}
                        <div>
                          <h4 className="font-semibold">
                            {conflict.entity_type} - {conflict.entity_id}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(conflict.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getResolutionColor(resolution?.resolution || 'manual')}>
                          {getResolutionIcon(resolution?.resolution || 'manual')}
                          {getResolutionLabel(resolution?.resolution || 'manual')}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(conflict.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Ações de resolução */}
                        <div className="flex gap-2 flex-wrap">
                          <Button
                            size="sm"
                            variant={resolution?.resolution === 'local_wins' ? 'default' : 'outline'}
                            onClick={() => handleResolutionChange(conflict.id, 'local_wins')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Local vence
                          </Button>
                          <Button
                            size="sm"
                            variant={resolution?.resolution === 'server_wins' ? 'default' : 'outline'}
                            onClick={() => handleResolutionChange(conflict.id, 'server_wins')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Servidor vence
                          </Button>
                          <Button
                            size="sm"
                            variant={resolution?.resolution === 'merge' ? 'default' : 'outline'}
                            onClick={() => handleResolutionChange(conflict.id, 'merge')}
                          >
                            <Merge className="h-4 w-4 mr-1" />
                            Mesclar
                          </Button>
                          <Button
                            size="sm"
                            variant={resolution?.resolution === 'manual' ? 'default' : 'outline'}
                            onClick={() => handleResolutionChange(conflict.id, 'manual')}
                          >
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Manual
                          </Button>
                        </div>

                        <Separator />

                        {/* Comparação de dados */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">Dados Locais</h5>
                            <ScrollArea className="h-32 w-full border rounded p-2 bg-green-50">
                              <pre className="text-xs text-green-800">
                                {JSON.stringify(conflict.local_data, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                          <div>
                            <h5 className="font-medium text-blue-700 mb-2">Dados do Servidor</h5>
                            <ScrollArea className="h-32 w-full border rounded p-2 bg-blue-50">
                              <pre className="text-xs text-blue-800">
                                {JSON.stringify(conflict.server_data, null, 2)}
                              </pre>
                            </ScrollArea>
                          </div>
                        </div>

                        {/* Informações adicionais */}
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Tipo de conflito:</strong> {conflict.conflict_type}<br />
                            <strong>Ação recomendada:</strong> {conflict.recommended_action}
                          </AlertDescription>
                        </Alert>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ConflictResolution;
