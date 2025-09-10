import { useState, useEffect, useCallback } from 'react';
import { AnamnesisService } from '../services/supabase/anamnesis';
import { 
  AnamnesisQuestion, 
  AnamnesisResponse, 
  CreateAnamnesisQuestionData, 
  UpdateAnamnesisQuestionData,
  CreateAnamnesisResponseData,
  UpdateAnamnesisResponseData
} from '../types/anamnesis';

export const useAnamnesis = () => {
  const [questions, setQuestions] = useState<AnamnesisQuestion[]>([]);
  const [responses, setResponses] = useState<AnamnesisResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load anamnesis questions
  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AnamnesisService.getAnamnesisQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load anamnesis questions');
      console.error('Failed to load anamnesis questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load anamnesis responses for a medical record
  const loadResponses = useCallback(async (medicalRecordId: string) => {
    try {
      setError(null);
      const data = await AnamnesisService.getAnamnesisResponses(medicalRecordId);
      setResponses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load anamnesis responses');
      console.error('Failed to load anamnesis responses:', err);
    }
  }, []);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Create anamnesis question
  const createQuestion = useCallback(async (questionData: CreateAnamnesisQuestionData) => {
    try {
      setError(null);
      const newQuestion = await AnamnesisService.createAnamnesisQuestion(questionData);
      setQuestions(prev => [...prev, newQuestion]);
      return newQuestion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create anamnesis question');
      throw err;
    }
  }, []);

  // Update anamnesis question
  const updateQuestion = useCallback(async (id: string, questionData: UpdateAnamnesisQuestionData) => {
    try {
      setError(null);
      const updatedQuestion = await AnamnesisService.updateAnamnesisQuestion(id, questionData);
      setQuestions(prev => prev.map(q => q.id === id ? updatedQuestion : q));
      return updatedQuestion;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update anamnesis question');
      throw err;
    }
  }, []);

  // Delete anamnesis question
  const deleteQuestion = useCallback(async (id: string) => {
    try {
      setError(null);
      await AnamnesisService.deleteAnamnesisQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete anamnesis question');
      throw err;
    }
  }, []);

  // Save anamnesis responses
  const saveResponses = useCallback(async (medicalRecordId: string, responsesData: CreateAnamnesisResponseData[]) => {
    try {
      setError(null);
      const savedResponses = await AnamnesisService.saveAnamnesisResponses(medicalRecordId, responsesData);
      setResponses(savedResponses);
      return savedResponses;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save anamnesis responses');
      throw err;
    }
  }, []);

  // Get questions grouped by category
  const getQuestionsByCategory = useCallback(async () => {
    try {
      setError(null);
      return await AnamnesisService.getAnamnesisQuestionsByCategory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get questions by category');
      throw err;
    }
  }, []);

  // Get response for a specific question
  const getResponseForQuestion = useCallback((questionId: string) => {
    return responses.find(response => response.question_id === questionId);
  }, [responses]);

  // Check if all required questions are answered
  const checkRequiredQuestionsAnswered = useCallback(() => {
    const requiredQuestions = questions.filter(q => q.is_required);
    return requiredQuestions.every(question => {
      const response = getResponseForQuestion(question.id);
      if (question.question_type === 'boolean') {
        return response?.boolean_response !== undefined;
      } else if (question.question_type === 'text') {
        return response?.text_response && response.text_response.trim() !== '';
      } else if (question.question_type === 'date') {
        return response?.date_response !== undefined;
      }
      return false;
    });
  }, [questions, getResponseForQuestion]);

  return {
    questions,
    responses,
    isLoading,
    error,
    loadQuestions,
    loadResponses,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    saveResponses,
    getQuestionsByCategory,
    getResponseForQuestion,
    checkRequiredQuestionsAnswered
  };
};
