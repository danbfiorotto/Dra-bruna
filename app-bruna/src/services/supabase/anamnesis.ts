import { supabase } from '../supabase';
import { 
  AnamnesisQuestion, 
  AnamnesisResponse, 
  CreateAnamnesisQuestionData, 
  UpdateAnamnesisQuestionData,
  CreateAnamnesisResponseData,
  UpdateAnamnesisResponseData
} from '../../types/anamnesis';

export class AnamnesisService {
  // Anamnesis Questions
  static async getAnamnesisQuestions(): Promise<AnamnesisQuestion[]> {
    const { data, error } = await supabase
      .from('anamnesis_questions')
      .select('*')
      .order('question_number', { ascending: true });

    if (error) {
      console.error('Erro ao buscar perguntas da anamnese:', error);
      throw error;
    }

    return data || [];
  }

  static async getAnamnesisQuestion(id: string): Promise<AnamnesisQuestion | null> {
    const { data, error } = await supabase
      .from('anamnesis_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  static async createAnamnesisQuestion(questionData: CreateAnamnesisQuestionData): Promise<AnamnesisQuestion> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('anamnesis_questions')
      .insert([{
        ...questionData,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar pergunta da anamnese: ${error.message}`);
    }

    return data;
  }

  static async updateAnamnesisQuestion(id: string, questionData: UpdateAnamnesisQuestionData): Promise<AnamnesisQuestion> {
    const { data, error } = await supabase
      .from('anamnesis_questions')
      .update(questionData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar pergunta da anamnese: ${error.message}`);
    }

    return data;
  }

  static async deleteAnamnesisQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('anamnesis_questions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar pergunta da anamnese: ${error.message}`);
    }
  }

  // Anamnesis Responses
  static async getAnamnesisResponses(medicalRecordId: string): Promise<AnamnesisResponse[]> {
    const { data, error } = await supabase
      .from('anamnesis_responses')
      .select(`
        *,
        question:anamnesis_questions(*)
      `)
      .eq('medical_record_id', medicalRecordId)
      .order('question_number', { ascending: true });

    if (error) {
      console.error('Erro ao buscar respostas da anamnese:', error);
      throw error;
    }

    return data || [];
  }

  static async getAnamnesisResponse(id: string): Promise<AnamnesisResponse | null> {
    const { data, error } = await supabase
      .from('anamnesis_responses')
      .select(`
        *,
        question:anamnesis_questions(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  }

  static async createAnamnesisResponse(responseData: CreateAnamnesisResponseData): Promise<AnamnesisResponse> {
    const { data, error } = await supabase
      .from('anamnesis_responses')
      .insert([responseData])
      .select(`
        *,
        question:anamnesis_questions(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar resposta da anamnese: ${error.message}`);
    }

    return data;
  }

  static async updateAnamnesisResponse(id: string, responseData: UpdateAnamnesisResponseData): Promise<AnamnesisResponse> {
    const { data, error } = await supabase
      .from('anamnesis_responses')
      .update(responseData)
      .eq('id', id)
      .select(`
        *,
        question:anamnesis_questions(*)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar resposta da anamnese: ${error.message}`);
    }

    return data;
  }

  static async deleteAnamnesisResponse(id: string): Promise<void> {
    const { error } = await supabase
      .from('anamnesis_responses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar resposta da anamnese: ${error.message}`);
    }
  }

  // Bulk operations
  static async saveAnamnesisResponses(medicalRecordId: string, responses: CreateAnamnesisResponseData[]): Promise<AnamnesisResponse[]> {
    console.log('🔧 AnamnesisService.saveAnamnesisResponses chamado');
    console.log('📊 Medical Record ID:', medicalRecordId);
    console.log('📝 Número de respostas:', responses.length);
    console.log('📋 Respostas:', responses);

    // First, delete existing responses for this medical record
    console.log('🗑️ Excluindo respostas existentes...');
    const deleteResult = await supabase
      .from('anamnesis_responses')
      .delete()
      .eq('medical_record_id', medicalRecordId);
    
    console.log('✅ Resultado da exclusão:', deleteResult);

    // Transform responses to match database schema
    const transformedResponses = responses.map(response => ({
      medical_record_id: response.medical_record_id,
      question_id: response.question_id,
      question_number: response.question_number,
      boolean_response: response.boolean_response,
      text_response: response.text_response,
      date_response: response.date_response
    }));

    console.log('🔄 Respostas transformadas:', transformedResponses);

    // Then insert new responses
    console.log('💾 Inserindo novas respostas...');
    const { data, error } = await supabase
      .from('anamnesis_responses')
      .insert(transformedResponses)
      .select(`
        *,
        question:anamnesis_questions(*)
      `);

    console.log('📊 Resultado da inserção:', { data, error });

    if (error) {
      console.error('❌ Erro ao salvar respostas:', error);
      throw new Error(`Erro ao salvar respostas da anamnese: ${error.message}`);
    }

    console.log('✅ Respostas salvas com sucesso:', data);
    return data || [];
  }

  // Get questions grouped by category
  static async getAnamnesisQuestionsByCategory(): Promise<Record<string, AnamnesisQuestion[]>> {
    const questions = await this.getAnamnesisQuestions();
    
    return questions.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push(question);
      return acc;
    }, {} as Record<string, AnamnesisQuestion[]>);
  }
}
