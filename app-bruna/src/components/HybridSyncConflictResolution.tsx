import React from 'react';
import { useHybridSync } from '../hooks/useHybridSync';
import { ConflictResolution } from './ConflictResolution';

export const HybridSyncConflictResolution: React.FC = () => {
  const {
    conflicts,
    isLoading,
    error,
    syncHybridSystem,
    resolveConflict,
    clearError
  } = useHybridSync();

  const handleResolve = async (resolutions: any[]) => {
    try {
      for (const resolution of resolutions) {
        await resolveConflict(
          resolution.entity_type || 'unknown',
          resolution.entity_id || 'unknown',
          resolution.resolution || 'server_wins'
        );
      }
    } catch (err) {
      console.error('Erro ao resolver conflitos:', err);
      throw err;
    }
  };

  const handleRefresh = async () => {
    try {
      await syncHybridSystem();
    } catch (err) {
      console.error('Erro ao atualizar conflitos:', err);
      throw err;
    }
  };

  // Converter conflitos para o formato esperado pelo componente
  const formattedConflicts = conflicts.map((conflict, index) => ({
    id: `${conflict.entity_type}-${conflict.entity_id}-${index}`,
    entity_type: conflict.entity_type,
    entity_id: conflict.entity_id,
    local_data: conflict.local_data,
    server_data: conflict.server_data,
    conflict_type: conflict.conflict_type,
    recommended_action: conflict.recommended_action,
    created_at: conflict.created_at
  }));

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erro na sincronização
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={clearError}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ConflictResolution
        conflicts={formattedConflicts}
        onResolve={handleResolve}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
    </div>
  );
};

export default HybridSyncConflictResolution;
