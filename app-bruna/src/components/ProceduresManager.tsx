import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Stethoscope, Clock } from 'lucide-react';
import { useProcedures } from '../hooks/useProcedures';
import { Procedure, CreateProcedureData, PROCEDURE_CATEGORIES } from '../types/procedure';

export function ProceduresManager() {
  const {
    procedures,
    isLoading,
    error,
    loadProcedures,
    createProcedure,
    updateProcedure,
    deleteProcedure
  } = useProcedures();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);

  // Form state
  const [procedureForm, setProcedureForm] = useState<CreateProcedureData>({
    name: '',
    description: '',
    category: 'consultation',
    default_duration: 30,
    is_active: true
  });

  // Load procedures on mount
  useEffect(() => {
    loadProcedures();
  }, [loadProcedures]);

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
          <h3 className="text-lg font-semibold">Procedimentos Médicos</h3>
          <p className="text-sm text-gray-600">
            {procedures.length} procedimento{procedures.length !== 1 ? 's' : ''} configurado{procedures.length !== 1 ? 's' : ''}
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
              <DialogTitle>Novo Procedimento Médico</DialogTitle>
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
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                    min="1"
                    value={procedureForm.default_duration}
                    onChange={(e) => setProcedureForm(prev => ({ ...prev, default_duration: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={procedureForm.is_active}
                  onCheckedChange={(checked) => setProcedureForm(prev => ({ ...prev, is_active: !!checked }))}
                />
                <Label htmlFor="is_active">Procedimento ativo</Label>
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
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-md flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>{PROCEDURE_CATEGORIES[category as keyof typeof PROCEDURE_CATEGORIES] || category}</span>
              <Badge variant="outline">{categoryProcedures.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="w-24">Duração</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryProcedures.map((procedure) => (
                  <TableRow key={procedure.id}>
                    <TableCell className="font-medium">{procedure.name}</TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm text-gray-600 truncate">
                          {procedure.description || 'Sem descrição'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{procedure.default_duration}min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {procedure.is_active ? (
                        <Badge variant="default" className="text-xs">Ativo</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {procedures.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <Stethoscope className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum procedimento configurado.</p>
              <p className="text-sm">Crie o primeiro procedimento médico.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Procedimento Médico</DialogTitle>
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
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                  min="1"
                  value={procedureForm.default_duration}
                  onChange={(e) => setProcedureForm(prev => ({ ...prev, default_duration: parseInt(e.target.value) || 30 }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_active"
                checked={procedureForm.is_active}
                onCheckedChange={(checked) => setProcedureForm(prev => ({ ...prev, is_active: !!checked }))}
              />
              <Label htmlFor="edit-is_active">Procedimento ativo</Label>
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
    </div>
  );
}
