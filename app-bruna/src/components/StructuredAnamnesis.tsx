import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useAnamnesis } from '../hooks/useAnamnesis';
import { AnamnesisQuestion, AnamnesisResponse, ANAMNESIS_CATEGORIES } from '../types/anamnesis';

interface StructuredAnamnesisProps {
  medicalRecordId: string;
  onResponsesChange?: (responses: AnamnesisResponse[]) => void;
  onValidationChange?: (isValid: boolean) => void;
  onFreeAnamnesisChange?: (text: string) => void;
  freeAnamnesisValue?: string;
}

export function StructuredAnamnesis({ 
  medicalRecordId, 
  onResponsesChange, 
  onValidationChange,
  onFreeAnamnesisChange,
  freeAnamnesisValue = ''
}: StructuredAnamnesisProps) {
  const { 
    questions, 
    responses, 
    loadQuestions, 
    loadResponses, 
    saveResponses, 
    getResponseForQuestion,
    checkRequiredQuestionsAnswered 
  } = useAnamnesis();

  const [localResponses, setLocalResponses] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Check if medicalRecordId is temporary
  const isTemporaryId = medicalRecordId.startsWith('temp-');

  // Load questions and responses on mount
  useEffect(() => {
    loadQuestions();
    if (medicalRecordId && !isTemporaryId) {
      loadResponses(medicalRecordId);
    }
  }, [medicalRecordId, loadQuestions, loadResponses, isTemporaryId]);

  // Update local responses when responses change
  useEffect(() => {
    const localData: Record<string, any> = {};
    responses.forEach(response => {
      console.log('🔄 Processando resposta do banco:', response);
      
      // Inicializar o objeto da pergunta se não existir
      if (!localData[response.question_id]) {
        localData[response.question_id] = {};
      }
      
      // Adicionar cada tipo de resposta
      if (response.boolean_response !== undefined) {
        localData[response.question_id].boolean = response.boolean_response;
      }
      if (response.text_response) {
        localData[response.question_id].text = response.text_response;
      }
      if (response.date_response) {
        localData[response.question_id].date = response.date_response;
      }
    });
    
    console.log('📝 Dados locais mapeados:', localData);
    setLocalResponses(localData);
  }, [responses]);

  // Auto-save disabled - user must manually save
  // useEffect(() => {
  //   const autoSaveTimer = setTimeout(async () => {
  //     if (Object.keys(localResponses).length > 0) {
  //       await handleSaveResponses();
  //     }
  //   }, 2000);

  //   return () => clearTimeout(autoSaveTimer);
  // }, [localResponses]);

  // Check validation based on local responses
  useEffect(() => {
    const requiredQuestions = questions.filter(q => q.is_required);
    const isValid = requiredQuestions.every(question => {
      const response = localResponses[question.id];
      if (question.question_type === 'boolean') {
        return response?.boolean !== undefined;
      } else if (question.question_type === 'text') {
        return response?.text && response.text.trim() !== '';
      } else if (question.question_type === 'date') {
        return response?.date !== undefined;
      }
      return false;
    });
    
    
    onValidationChange?.(isValid);
  }, [localResponses, questions, onValidationChange]);

  // Auto-save responses when they change (for temporary IDs) - with debounce
  useEffect(() => {
    if (isTemporaryId && Object.keys(localResponses).length > 0) {
      const timeoutId = setTimeout(() => {
        const responsesData = Object.entries(localResponses).map(([questionId, data]) => {
          const question = questions.find(q => q.id === questionId);
          return {
            medical_record_id: medicalRecordId,
            question_id: questionId,
            question_number: question?.question_number || 0,
            boolean_response: data.boolean,
            text_response: data.text,
            date_response: data.date
          };
        });
        
        console.log('🔄 Auto-salvando respostas temporárias:', responsesData);
        onResponsesChange?.(responsesData as any);
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [localResponses, isTemporaryId, medicalRecordId, questions, onResponsesChange]);

  const handleResponseChange = useCallback((questionId: string, value: any, type: 'boolean' | 'text' | 'date') => {
    console.log('🔄 handleResponseChange chamado:', { questionId, value, type });
    setLocalResponses(prev => {
      const newResponses = {
        ...prev,
        [questionId]: { 
          ...prev[questionId], 
          [type]: value 
        }
      };
      console.log('📝 Respostas atualizadas:', newResponses);
      return newResponses;
    });
  }, []);

  const handleSaveResponses = async () => {
    if (!medicalRecordId) return;

    try {
      setIsSaving(true);
      const responsesData = Object.entries(localResponses).map(([questionId, data]) => {
        const question = questions.find(q => q.id === questionId);
        return {
          medical_record_id: medicalRecordId,
          question_id: questionId,
          question_number: question?.question_number || 0,
          boolean_response: data.boolean,
          text_response: data.text,
          date_response: data.date
        };
      });
      
      if (isTemporaryId) {
        // Para IDs temporários, apenas notificar as mudanças sem salvar no banco
        onResponsesChange?.(responsesData as any);
        setLastSaved(new Date());
      } else {
        // Para IDs reais, salvar no banco
        const savedResponses = await saveResponses(medicalRecordId, responsesData);
        setLastSaved(new Date());
        onResponsesChange?.(savedResponses);
      }
    } catch (error) {
      console.error('Erro ao salvar respostas da anamnese:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getQuestionResponse = (questionId: string) => {
    return localResponses[questionId] || {};
  };

  const renderQuestion = (question: AnamnesisQuestion) => {
    const response = getQuestionResponse(question.id);
    const isRequired = question.is_required;
    const isAnswered = question.question_type === 'boolean' 
      ? response.boolean !== undefined
      : question.question_type === 'text'
      ? response.text && response.text.trim() !== ''
      : question.question_type === 'date'
      ? response.date !== undefined
      : false;


    return (
      <Card key={question.id} className={`mb-4 ${isRequired && !isAnswered ? 'border-red-200' : ''}`}>
        <CardContent className="pt-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Badge variant={isAnswered ? 'default' : 'outline'} className="text-xs">
                {question.question_number}
              </Badge>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">
                  {question.question_text}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {isAnswered && <Check className="h-4 w-4 text-green-600" />}
              </div>

              {question.question_type === 'boolean' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-yes`}
                        checked={response.boolean === true}
                        onCheckedChange={(checked) => 
                          handleResponseChange(question.id, checked, 'boolean')
                        }
                      />
                      <Label htmlFor={`${question.id}-yes`}>Sim</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-no`}
                        checked={response.boolean === false}
                        onCheckedChange={(checked) => 
                          handleResponseChange(question.id, !checked, 'boolean')
                        }
                      />
                      <Label htmlFor={`${question.id}-no`}>Não</Label>
                    </div>
                  </div>
                  
                  {/* Campo de texto para especificar quando a resposta for "Sim" */}
                  {response.boolean === true && (
                    <div className="ml-6 space-y-2">
                      <Label htmlFor={`${question.id}-specify`} className="text-sm text-gray-600">
                        Especifique:
                      </Label>
                      <Textarea
                        id={`${question.id}-specify`}
                        placeholder="Descreva detalhes sobre a resposta positiva..."
                        value={response.text || ''}
                        onChange={(e) => {
                          handleResponseChange(question.id, e.target.value, 'text');
                        }}
                        className="min-h-[60px]"
                      />
                    </div>
                  )}
                </div>
              )}

              {question.question_type === 'text' && (
                <Textarea
                  placeholder="Especifique..."
                  value={response.text || ''}
                  onChange={(e) => handleResponseChange(question.id, e.target.value, 'text')}
                  className="min-h-[80px]"
                />
              )}

              {question.question_type === 'date' && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !response.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {response.date ? format(new Date(response.date), "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={response.date ? new Date(response.date) : undefined}
                      onSelect={(date) => 
                        handleResponseChange(question.id, date?.toISOString().split('T')[0], 'date')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}

              {isRequired && !isAnswered && (
                <p className="text-xs text-red-500">Esta pergunta é obrigatória</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getQuestionsByCategory = () => {
    const grouped: Record<string, AnamnesisQuestion[]> = {};
    questions.forEach(question => {
      if (!grouped[question.category]) {
        grouped[question.category] = [];
      }
      grouped[question.category].push(question);
    });
    return grouped;
  };

  const groupedQuestions = getQuestionsByCategory();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Anamnese Estruturada</h3>
          <p className="text-sm text-gray-600">
            Responda às perguntas abaixo para completar a anamnese do paciente
          </p>
        </div>
        {!isTemporaryId && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleSaveResponses}
              disabled={isSaving || Object.keys(localResponses).length === 0}
              size="sm"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Anamnese'
              )}
            </Button>
            {lastSaved && !isSaving && (
              <div className="flex items-center text-green-600 text-sm">
                <Check className="h-4 w-4 mr-1" />
                Salvo há {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s
              </div>
            )}
          </div>
        )}
      </div>

      {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
        <div key={category} className="space-y-4">
          <div className="border-b pb-2">
            <h4 className="text-md font-medium text-gray-900">
              {ANAMNESIS_CATEGORIES[category as keyof typeof ANAMNESIS_CATEGORIES] || category}
            </h4>
            <p className="text-sm text-gray-600">
              {categoryQuestions.length} pergunta{categoryQuestions.length !== 1 ? 's' : ''}
            </p>
          </div>
          {categoryQuestions.map(renderQuestion)}
        </div>
      ))}

      {questions.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <p>Nenhuma pergunta de anamnese encontrada.</p>
              <p className="text-sm">Configure as perguntas nas configurações do sistema.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anamnese Livre */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Anamnese Livre</CardTitle>
          <p className="text-sm text-gray-600">
            Descreva livremente o histórico do paciente, queixas principais e outras informações relevantes
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="free-anamnesis">Histórico e Queixas</Label>
            <Textarea
              id="free-anamnesis"
              placeholder="Descreva o histórico do paciente, queixas principais, sintomas, antecedentes familiares, medicações em uso, alergias, etc..."
              value={freeAnamnesisValue}
              onChange={(e) => onFreeAnamnesisChange?.(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-500">
              Este campo é opcional e complementa as perguntas estruturadas acima.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
