// Teste simples da consulta de perfil
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yzegxffboezduzqbrrfv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6ZWd4ZmZib2V6ZHV6cWJycmZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MTYyMTEsImV4cCI6MjA3MjQ5MjIxMX0.L5nffqlwK6cWYjyZKywrCVmd124emU7sDizDcHpcC9M';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const testProfileQuery = async () => {
  try {
    console.log('🔍 Testando consulta de perfil...');
    
    // Primeiro, fazer login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'admin@drabruna.com',
      password: 'admin123' // Senha padrão para teste
    });
    
    if (authError) {
      console.error('❌ Erro no login:', authError);
      return false;
    }
    
    console.log('✅ Login realizado:', authData.user?.email);
    
    // Agora tentar consultar o perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user?.id)
      .single();
    
    console.log('📊 Resultado da consulta de perfil:', { profile, profileError });
    
    if (profileError) {
      console.error('❌ Erro na consulta de perfil:', profileError);
      return false;
    }
    
    console.log('✅ Perfil obtido com sucesso:', profile);
    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return false;
  }
};

// Executar teste automaticamente
testProfileQuery();
