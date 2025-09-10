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
import { Plus, Edit, Trash2, DollarSign, FileText } from 'lucide-react';
import { useBudgets } from '../hooks/useBudgets';
import { useProcedures } from '../hooks/useProcedures';
import { Budget, BudgetItem, CreateBudgetData, CreateBudgetItemData, BUDGET_STATUS } from '../types/budget';

interface BudgetManagerProps {
  medicalRecordId: string;
  onBudgetCreated?: (budget: Budget) => void;
}

export function BudgetManager({ medicalRecordId, onBudgetCreated }: BudgetManagerProps) {
  const {
    budgets,
    budgetItems,
    isLoading,
    error,
    loadBudgetsByMedicalRecord,
    loadBudgetItems,
    createBudget,
    updateBudget,
    deleteBudget,
    createBudgetItem,
    updateBudgetItem,
    deleteBudgetItem,
    updateBudgetTotal
  } = useBudgets();

  const { procedures } = useProcedures();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  // Form states
  const [budgetForm, setBudgetForm] = useState<CreateBudgetData>({
    medical_record_id: medicalRecordId,
    total_value: 0,
    description: '',
    status: 'draft',
    valid_until: ''
  });

  const [itemForm, setItemForm] = useState<CreateBudgetItemData>({
    procedure_id: '',
    description: '',
    quantity: 1,
    unit_value: 0,
    total_value: 0
  });

  // Load data on mount
  useEffect(() => {
    loadBudgetsByMedicalRecord(medicalRecordId);
  }, [medicalRecordId, loadBudgetsByMedicalRecord]);

  const handleCreateBudget = async () => {
    try {
      const newBudget = await createBudget(budgetForm);
      onBudgetCreated?.(newBudget);
      setBudgetForm({
        medical_record_id: medicalRecordId,
        total_value: 0,
        description: '',
        status: 'draft',
        valid_until: ''
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget) return;

    try {
      await updateBudget(editingBudget.id, budgetForm);
      setEditingBudget(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        await deleteBudget(id);
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
      }
    }
  };

  const handleCreateItem = async () => {
    if (!selectedBudget) return;

    try {
      const totalValue = itemForm.quantity * itemForm.unit_value;
      await createBudgetItem({
        ...itemForm,
        budget_id: selectedBudget.id,
        total_value: totalValue
      });
      setItemForm({
        procedure_id: '',
        description: '',
        quantity: 1,
        unit_value: 0,
        total_value: 0
      });
      setIsItemDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar item do orçamento:', error);
    }
  };

  const handleUpdateItem = async (itemId: string) => {
    try {
      const totalValue = itemForm.quantity * itemForm.unit_value;
      await updateBudgetItem(itemId, {
        ...itemForm,
        total_value: totalValue
      });
      setItemForm({
        procedure_id: '',
        description: '',
        quantity: 1,
        unit_value: 0,
        total_value: 0
      });
      setIsItemDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar item do orçamento:', error);
    }
  };

  const handleDeleteItem = async (itemId: string, budgetId: string) => {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteBudgetItem(itemId, budgetId);
      } catch (error) {
        console.error('Erro ao excluir item do orçamento:', error);
      }
    }
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      medical_record_id: budget.medical_record_id,
      total_value: budget.total_value,
      description: budget.description || '',
      status: budget.status,
      valid_until: budget.valid_until || ''
    });
    setIsEditDialogOpen(true);
  };

  const openItemDialog = (budget: Budget) => {
    setSelectedBudget(budget);
    setItemForm({
      procedure_id: '',
      description: '',
      quantity: 1,
      unit_value: 0,
      total_value: 0
    });
    setIsItemDialogOpen(true);
  };

  const loadItemsForBudget = async (budgetId: string) => {
    await loadBudgetItems(budgetId);
  };

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
        <p>Erro ao carregar orçamentos: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Orçamentos</h3>
          <p className="text-sm text-gray-600">
            Gerencie orçamentos e itens de procedimentos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Orçamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={budgetForm.description}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do orçamento"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={budgetForm.status}
                  onValueChange={(value: any) => setBudgetForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(BUDGET_STATUS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="valid_until">Válido até</Label>
                <Input
                  id="valid_until"
                  type="date"
                  value={budgetForm.valid_until}
                  onChange={(e) => setBudgetForm(prev => ({ ...prev, valid_until: e.target.value }))}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateBudget}>
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budgets list */}
      <div className="space-y-4">
        {budgets.map((budget) => (
          <Card key={budget.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Orçamento #{budget.id.slice(-8)}</span>
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1">
                    {budget.description || 'Sem descrição'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={budget.status === 'approved' ? 'default' : 'outline'}>
                    {BUDGET_STATUS[budget.status]}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(budget)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteBudget(budget.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-lg font-semibold text-green-600">
                    R$ {budget.total_value.toFixed(2)}
                  </span>
                </div>
                <Button
                  size="sm"
                  onClick={() => openItemDialog(budget)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Adicionar Item
                </Button>
              </div>

              {/* Budget items */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadItemsForBudget(budget.id)}
                  className="w-full justify-start"
                >
                  Ver itens ({budget.items?.length || 0})
                </Button>
                {budget.items && budget.items.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Qtd</TableHead>
                        <TableHead>Valor Unit.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budget.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm">{item.description}</TableCell>
                          <TableCell className="text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-sm">R$ {item.unit_value.toFixed(2)}</TableCell>
                          <TableCell className="text-sm font-medium">R$ {item.total_value.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setItemForm({
                                    procedure_id: item.procedure_id || '',
                                    description: item.description,
                                    quantity: item.quantity,
                                    unit_value: item.unit_value,
                                    total_value: item.total_value
                                  });
                                  setSelectedBudget(budget);
                                  setIsItemDialogOpen(true);
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id, budget.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {budgets.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum orçamento encontrado.</p>
              <p className="text-sm">Crie um novo orçamento para este prontuário.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={budgetForm.description}
                onChange={(e) => setBudgetForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do orçamento"
              />
            </div>
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={budgetForm.status}
                onValueChange={(value: any) => setBudgetForm(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BUDGET_STATUS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-valid_until">Válido até</Label>
              <Input
                id="edit-valid_until"
                type="date"
                value={budgetForm.valid_until}
                onChange={(e) => setBudgetForm(prev => ({ ...prev, valid_until: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateBudget}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Dialog */}
      <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Item ao Orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-procedure">Procedimento (opcional)</Label>
              <Select
                value={itemForm.procedure_id}
                onValueChange={(value) => setItemForm(prev => ({ ...prev, procedure_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um procedimento" />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map((procedure) => (
                    <SelectItem key={procedure.id} value={procedure.id}>
                      {procedure.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="item-description">Descrição *</Label>
              <Input
                id="item-description"
                value={itemForm.description}
                onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do item"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-quantity">Quantidade</Label>
                <Input
                  id="item-quantity"
                  type="number"
                  min="1"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                />
              </div>
              <div>
                <Label htmlFor="item-unit-value">Valor Unitário</Label>
                <Input
                  id="item-unit-value"
                  type="number"
                  step="0.01"
                  min="0"
                  value={itemForm.unit_value}
                  onChange={(e) => setItemForm(prev => ({ ...prev, unit_value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div>
              <Label>Total: R$ {(itemForm.quantity * itemForm.unit_value).toFixed(2)}</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateItem}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
