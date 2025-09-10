import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useProcedures } from '../hooks/useProcedures';
import { Procedure, ProcedureExecution, CreateProcedureData, CreateProcedureExecutionData, PROCEDURE_CATEGORIES } from '../types/procedure';

interface ProcedureManagerProps {
  appointmentId?: string;
  onProcedureExecuted?: (execution: ProcedureExecution) => void;
}

export function ProcedureManager({ appointmentId, onProcedureExecuted }: ProcedureManagerProps) {
  const {
    procedures,
    executions,
    isLoading,
    error,
    loadProcedures,
    loadExecutionsByAppointment,
    createProcedure,
    updateProcedure,
    deleteProcedure,
    createExecution,
    updateExecution,
    deleteExecution
  } = useProcedures();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExecuteDialogOpen, setIsExecuteDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);

  // Form states
  const [procedureForm, setProcedureForm] = useState<CreateProcedureData>({
    name: '',
    description: '',
    category: 'consultation',
    default_duration: 30,
    is_active: true
  });

  const [executionForm, setExecutionForm] = useState<CreateProcedureExecutionData>({
    appointment_id: appointmentId || '',
    procedure_id: '',
    performed_at: new Date().toISOString(),
    notes: ''
  });

  // Load data on mount
  useEffect(() => {
    loadProcedures();
    if (appointmentId) {
      loadExecutionsByAppointment(appointmentId);
    }
  }, [appointmentId, loadProcedures, loadExecutionsByAppointment]);

  const handleCreateProcedure = async () => {
    try {
      await createProcedure(procedureForm);
      setProcedureForm({
        name: '',
        description: '',
        category: 'consultation',
        default_duration: 30,
        is_active: true
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar procedimento:', error);
    }
  };

  const handleUpdateProcedure = async () => {
    if (!editingProcedure) return;

    try {
      await updateProcedure(editingProcedure.id, procedureForm);
      setEditingProcedure(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error);
    }
  };

  const handleDeleteProcedure = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
      try {
        await deleteProcedure(id);
      } catch (error) {
        console.error('Erro ao excluir procedimento:', error);
      }
    }
  };

  const handleExecuteProcedure = async () => {
    if (!selectedProcedure || !appointmentId) return;

    try {
      const execution = await createExecution({
        ...executionForm,
        appointment_id: appointmentId,
        procedure_id: selectedProcedure.id
      });
      onProcedureExecuted?.(execution);
      setExecutionForm({
        appointment_id: appointmentId,
        procedure_id: '',
        performed_at: new Date().toISOString(),
        notes: ''
      });
      setSelectedProcedure(null);
      setIsExecuteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao executar procedimento:', error);
    }
  };

  const openEditDialog = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setProcedureForm({
      name: procedure.name,
      description: procedure.description || '',
      category: procedure.category,
      default_duration: procedure.default_duration || 30,
      is_active: procedure.is_active
    });
    setIsEditDialogOpen(true);
  };

  const openExecuteDialog = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    setExecutionForm(prev => ({
      ...prev,
      procedure_id: procedure.id
    }));
    setIsExecuteDialogOpen(true);
  };

  const getProceduresByCategory = () => {
    const grouped: Record<string, Procedure[]> = {};
    procedures.forEach(procedure => {
      if (!grouped[procedure.category]) {
        grouped[procedure.category] = [];
      }
      grouped[procedure.category].push(procedure);
    });
    return grouped;
  };

  const groupedProcedures = getProceduresByCategory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>Erro ao carregar procedimentos: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Procedimentos</h3>
          <p className="text-sm text-gray-600">
            Gerencie e execute procedimentos médicos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Procedimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Procedimento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={procedureForm.name}
                  onChange={(e) => setProcedureForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome do procedimento"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={procedureForm.description}
                  onChange={(e) => setProcedureForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do procedimento"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={procedureForm.category}
                  onValueChange={(value: any) => setProcedureForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROCEDURE_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duração Padrão (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={procedureForm.default_duration}
                  onChange={(e) => setProcedureForm(prev => ({ ...prev, default_duration: parseInt(e.target.value) || 30 }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateProcedure}>
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Procedures by category */}
      {Object.entries(groupedProcedures).map(([category, categoryProcedures]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-md font-medium text-gray-900">
            {PROCEDURE_CATEGORIES[category as keyof typeof PROCEDURE_CATEGORIES] || category}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryProcedures.map((procedure) => (
              <Card key={procedure.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{procedure.name}</CardTitle>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(procedure)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteProcedure(procedure.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {procedure.description && (
                    <p className="text-xs text-gray-600 mb-2">{procedure.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {procedure.default_duration}min
                      </span>
                    </div>
                    {appointmentId && (
                      <Button
                        size="sm"
                        onClick={() => openExecuteDialog(procedure)}
                      >
                        Executar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Executions for this appointment */}
      {appointmentId && executions.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-900">Procedimentos Executados</h4>
          <div className="space-y-2">
            {executions.map((execution) => (
              <Card key={execution.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{execution.procedure?.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(execution.performed_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {execution.notes && (
                    <Badge variant="outline" className="text-xs">
                      {execution.notes}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Procedimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={procedureForm.name}
                onChange={(e) => setProcedureForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do procedimento"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={procedureForm.description}
                onChange={(e) => setProcedureForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do procedimento"
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria *</Label>
              <Select
                value={procedureForm.category}
                onValueChange={(value: any) => setProcedureForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROCEDURE_CATEGORIES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-duration">Duração Padrão (minutos)</Label>
              <Input
                id="edit-duration"
                type="number"
                value={procedureForm.default_duration}
                onChange={(e) => setProcedureForm(prev => ({ ...prev, default_duration: parseInt(e.target.value) || 30 }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateProcedure}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Execute Dialog */}
      <Dialog open={isExecuteDialogOpen} onOpenChange={setIsExecuteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Executar Procedimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Procedimento</Label>
              <p className="text-sm text-gray-600">{selectedProcedure?.name}</p>
            </div>
            <div>
              <Label htmlFor="execution-notes">Observações</Label>
              <Textarea
                id="execution-notes"
                value={executionForm.notes}
                onChange={(e) => setExecutionForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Observações sobre a execução do procedimento"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsExecuteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleExecuteProcedure}>
                Executar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
