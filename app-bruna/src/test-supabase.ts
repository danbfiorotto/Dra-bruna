// Teste simples do Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yzegxffboezduzqbrrfv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZWd4ZmZib2V6ZHV6cWJycmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTYyMTEsImV4cCI6MjA3MjQ5MjIxMX0.L5nffqlwK6cWYjyZKywrCVmd124emU7sDizDcHpcC9M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Teste 1: Verificar se consegue acessar a tabela profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Erro ao acessar profiles:', profilesError);
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando');
    console.log('📊 Dados de profiles:', profiles);
    
    // Teste 2: Tentar fazer login
    console.log('🔐 Testando login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@drabruna.com',
      password: 'admin123' // Senha padrão para teste
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError);
      return false;
    }
    
    console.log('✅ Login realizado com sucesso');
    console.log('👤 Usuário autenticado:', authData.user);
    
    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
};

// Executar teste automaticamente
testSupabaseConnection();
