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
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { useAnamnesis } from '../hooks/useAnamnesis';
import { AnamnesisQuestion, CreateAnamnesisQuestionData, ANAMNESIS_CATEGORIES } from '../types/anamnesis';

export function AnamnesisQuestionsManager() {
  const {
    questions,
    isLoading,
    error,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion
  } = useAnamnesis();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AnamnesisQuestion | null>(null);

  // Form state
  const [questionForm, setQuestionForm] = useState<CreateAnamnesisQuestionData>({
    question_number: 1,
    question_text: '',
    question_type: 'boolean',
    is_required: false,
    category: 'medical_history'
  });

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleCreateQuestion = async () => {
    try {
      // Get next question number
      const nextNumber = Math.max(...questions.map(q => q.question_number), 0) + 1;
      await createQuestion({
        ...questionForm,
        question_number: nextNumber
      });
      setQuestionForm({
        question_number: nextNumber + 1,
        question_text: '',
        question_type: 'boolean',
        is_required: false,
        category: 'medical_history'
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
    }
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestion) return;

    try {
      await updateQuestion(editingQuestion.id, questionForm);
      setEditingQuestion(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
      try {
        await deleteQuestion(id);
      } catch (error) {
        console.error('Erro ao excluir pergunta:', error);
      }
    }
  };

  const openEditDialog = (question: AnamnesisQuestion) => {
    setEditingQuestion(question);
    setQuestionForm({
      question_number: question.question_number,
      question_text: question.question_text,
      question_type: question.question_type,
      is_required: question.is_required,
      category: question.category
    });
    setIsEditDialogOpen(true);
  };

  const moveQuestion = async (questionId: string, direction: 'up' | 'down') => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const currentIndex = questions.findIndex(q => q.id === questionId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= questions.length) return;

    const targetQuestion = questions[newIndex];
    
    try {
      // Swap question numbers
      await updateQuestion(questionId, { question_number: targetQuestion.question_number });
      await updateQuestion(targetQuestion.id, { question_number: question.question_number });
    } catch (error) {
      console.error('Erro ao mover pergunta:', error);
    }
  };

  const getQuestionsByCategory = () => {
    const grouped: Record<string, AnamnesisQuestion[]> = {};
    questions.forEach(question => {
      if (!grouped[question.category]) {
        grouped[question.category] = [];
      }
      grouped[question.category].push(question);
    });
    
    // Sort questions within each category by question_number
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => a.question_number - b.question_number);
    });
    
    return grouped;
  };

  const groupedQuestions = getQuestionsByCategory();

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
        <p>Erro ao carregar perguntas: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Perguntas da Anamnese</h3>
          <p className="text-sm text-gray-600">
            {questions.length} pergunta{questions.length !== 1 ? 's' : ''} configurada{questions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Pergunta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Pergunta da Anamnese</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="question_text">Pergunta *</Label>
                <Textarea
                  id="question_text"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                  placeholder="Digite a pergunta da anamnese..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="question_type">Tipo de Resposta *</Label>
                  <Select
                    value={questionForm.question_type}
                    onValueChange={(value: any) => setQuestionForm(prev => ({ ...prev, question_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Sim/Não</SelectItem>
                      <SelectItem value="text">Texto Livre</SelectItem>
                      <SelectItem value="date">Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={questionForm.category}
                    onValueChange={(value: any) => setQuestionForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ANAMNESIS_CATEGORIES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_required"
                  checked={questionForm.is_required}
                  onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, is_required: !!checked }))}
                />
                <Label htmlFor="is_required">Pergunta obrigatória</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateQuestion}>
                  Criar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questions by category */}
      {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
        <Card key={category}>
          <CardHeader className="pb-3">
            <CardTitle className="text-md flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>{ANAMNESIS_CATEGORIES[category as keyof typeof ANAMNESIS_CATEGORIES] || category}</span>
              <Badge variant="outline">{categoryQuestions.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Pergunta</TableHead>
                  <TableHead className="w-24">Tipo</TableHead>
                  <TableHead className="w-20">Obrigatória</TableHead>
                  <TableHead className="w-32">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryQuestions.map((question, index) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{question.question_number}</TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm">{question.question_text}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {question.question_type === 'boolean' ? 'Sim/Não' : 
                         question.question_type === 'text' ? 'Texto' : 'Data'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {question.is_required ? (
                        <Badge variant="default" className="text-xs">Sim</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveQuestion(question.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => moveQuestion(question.id, 'down')}
                          disabled={index === categoryQuestions.length - 1}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(question)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteQuestion(question.id)}
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

      {questions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma pergunta configurada.</p>
              <p className="text-sm">Crie a primeira pergunta da anamnese.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Pergunta da Anamnese</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question_text">Pergunta *</Label>
              <Textarea
                id="edit-question_text"
                value={questionForm.question_text}
                onChange={(e) => setQuestionForm(prev => ({ ...prev, question_text: e.target.value }))}
                placeholder="Digite a pergunta da anamnese..."
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-question_type">Tipo de Resposta *</Label>
                <Select
                  value={questionForm.question_type}
                  onValueChange={(value: any) => setQuestionForm(prev => ({ ...prev, question_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boolean">Sim/Não</SelectItem>
                    <SelectItem value="text">Texto Livre</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Categoria *</Label>
                <Select
                  value={questionForm.category}
                  onValueChange={(value: any) => setQuestionForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ANAMNESIS_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-is_required"
                checked={questionForm.is_required}
                onCheckedChange={(checked) => setQuestionForm(prev => ({ ...prev, is_required: !!checked }))}
              />
              <Label htmlFor="edit-is_required">Pergunta obrigatória</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateQuestion}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
