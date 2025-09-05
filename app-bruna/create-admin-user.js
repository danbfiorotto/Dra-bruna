// Script para criar usuário admin via API do Supabase
// Execute com: node create-admin-user.js

const { createClient } = require('@supabase/supabase-js');

// Configure suas credenciais do Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseServiceKey = 'your-service-role-key'; // Use a service role key, não a anon key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdminUser() {
  try {
    console.log('Criando usuário admin...');
    
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@drabruna.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        name: 'Administrador'
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      return;
    }

    console.log('Usuário criado com sucesso:', authData.user.email);
    console.log('ID do usuário:', authData.user.id);
    
    // O perfil será criado automaticamente pelo trigger
    console.log('Perfil será criado automaticamente pelo trigger');
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

createAdminUser();

