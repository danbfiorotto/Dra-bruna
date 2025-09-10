import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnamnesisQuestion, AnamnesisResponse } from '../types/anamnesis';
import { AnamnesisService } from '../services/supabase/anamnesis';
import { Check, X, CalendarDays, Type } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UnifiedAnamnesisViewProps {
  medicalRecordId: string;
  freeAnamnesis?: string;
}

export const UnifiedAnamnesisView: React.FC<UnifiedAnamnesisViewProps> = ({ 
  medicalRecordId, 
  freeAnamnesis 
}) => {
  const [questions, setQuestions] = useState<AnamnesisQuestion[]>([]);
  const [responses, setResponses] = useState<AnamnesisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnamnesisData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedQuestions = await AnamnesisService.getAnamnesisQuestions();
        setQuestions(fetchedQuestions);

        const fetchedResponses = await AnamnesisService.getAnamnesisResponses(medicalRecordId);
        setResponses(fetchedResponses);
      } catch (err) {
        console.error('Erro ao carregar dados da anamnese:', err);
        setError('Erro ao carregar dados da anamnese.');
      } finally {
        setIsLoading(false);
      }
    };

    if (medicalRecordId) {
      fetchAnamnesisData();
    }
  }, [medicalRecordId]);

  // Filtrar apenas respostas "Sim" para exibição
  const positiveResponses = questions
    .filter(q => responses.some(r => r.question_id === q.id && r.boolean_response === true))
    .sort((a, b) => a.question_number - b.question_number);

  const hasAnyContent = freeAnamnesis?.trim() || positiveResponses.length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anamnese</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
            <span>Carregando anamnese...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-400 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Erro ao Carregar Anamnese</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnyContent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anamnese</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Nenhuma informação de anamnese encontrada para este prontuário.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Anamnese</CardTitle>
        <div className="flex space-x-2">
          {freeAnamnesis?.trim() && (
            <Badge variant="secondary" className="text-sm">
              Histórico Livre
            </Badge>
          )}
          {positiveResponses.length > 0 && (
            <Badge variant="secondary" className="text-sm">
              {positiveResponses.length} achado{positiveResponses.length !== 1 ? 's' : ''} positivo{positiveResponses.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Anamnese Livre */}
        {freeAnamnesis?.trim() && (
          <div className="space-y-2">
            <h4 className="text-md font-medium text-gray-900">Histórico e Queixas</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{freeAnamnesis}</p>
            </div>
          </div>
        )}

        {/* Anamnese Estruturada - Apenas respostas positivas */}
        {positiveResponses.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Achados Positivos</h4>
            <div className="space-y-3">
              {positiveResponses.map(question => {
                const response = responses.find(r => r.question_id === question.id);
                if (!response) return null;

                return (
                  <div key={question.id} className="border-l-4 border-green-500 bg-green-50 rounded-r-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">
                        {question.question_number}. {question.question_text}
                      </p>
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <Check className="h-3 w-3 mr-1" /> Sim
                      </Badge>
                    </div>
                    
                    {/* Especificação se houver */}
                    {response.text_response && (
                      <div className="mt-2 p-3 bg-white rounded border-l-2 border-green-300">
                        <p className="text-xs font-medium text-gray-600 mb-1">Especificação:</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {response.text_response}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
