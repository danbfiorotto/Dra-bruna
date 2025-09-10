import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAnamnesis } from '@/hooks/useAnamnesis';
import { AnamnesisQuestion, AnamnesisResponse } from '@/types/anamnesis';

interface AnamnesisResponsesViewProps {
  medicalRecordId: string;
}

export function AnamnesisResponsesView({ medicalRecordId }: AnamnesisResponsesViewProps) {
  const { questions, responses, loadQuestions, loadResponses } = useAnamnesis();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          loadQuestions(),
          loadResponses(medicalRecordId)
        ]);
      } catch (error) {
        console.error('Erro ao carregar anamnese:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (medicalRecordId) {
      loadData();
    }
  }, [medicalRecordId, loadQuestions, loadResponses]);

  const getResponseForQuestion = (questionId: string): AnamnesisResponse | undefined => {
    return responses.find(response => response.question_id === questionId);
  };

  const formatResponse = (question: AnamnesisQuestion, response?: AnamnesisResponse): string => {
    if (!response) return 'Não respondido';

    if (question.question_type === 'boolean') {
      if (response.boolean_response === true) {
        return 'Sim' + (response.text_response ? ` - ${response.text_response}` : '');
      } else if (response.boolean_response === false) {
        return 'Não';
      }
      return 'Não respondido';
    } else if (question.question_type === 'text') {
      return response.text_response || 'Não respondido';
    } else if (question.question_type === 'date') {
      return response.date_response ? new Date(response.date_response).toLocaleDateString('pt-BR') : 'Não respondido';
    }

    return 'Não respondido';
  };

  const getResponseColor = (question: AnamnesisQuestion, response?: AnamnesisResponse): string => {
    if (!response) return 'bg-gray-100 text-gray-600';

    if (question.question_type === 'boolean') {
      if (response.boolean_response === true) {
        return 'bg-green-100 text-green-800';
      } else if (response.boolean_response === false) {
        return 'bg-red-100 text-red-800';
      }
    } else if (question.question_type === 'text' && response.text_response) {
      return 'bg-blue-100 text-blue-800';
    } else if (question.question_type === 'date' && response.date_response) {
      return 'bg-purple-100 text-purple-800';
    }

    return 'bg-gray-100 text-gray-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anamnese Estruturada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-gray-600">Carregando anamnese...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anamnese Estruturada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Nenhuma pergunta de anamnese encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  const answeredQuestions = questions.filter(question => {
    const response = getResponseForQuestion(question.id);
    return response && (
      response.boolean_response !== undefined ||
      (response.text_response && response.text_response.trim() !== '') ||
      response.date_response
    );
  });

  if (answeredQuestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anamnese Estruturada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Nenhuma resposta de anamnese encontrada para este prontuário.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anamnese Estruturada</CardTitle>
        <p className="text-sm text-gray-600">
          {answeredQuestions.length} de {questions.length} perguntas respondidas
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {answeredQuestions.map((question) => {
            const response = getResponseForQuestion(question.id);
            return (
              <div key={question.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {question.question_number}. {question.question_text}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="secondary" 
                      className={getResponseColor(question, response)}
                    >
                      {question.question_type === 'boolean' ? 'Sim/Não' : 
                       question.question_type === 'text' ? 'Texto' : 'Data'}
                    </Badge>
                    {question.is_required && (
                      <Badge variant="destructive" className="text-xs">
                        Obrigatória
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-700">
                    {formatResponse(question, response)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
