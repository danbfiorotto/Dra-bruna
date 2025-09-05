import { createClient } from '@supabase/supabase-js';

// Cliente Supabase Admin (apenas no servidor)
// Usa Service Role Key - NUNCA expor no browser
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Função para inserir lead de contato
export async function insertLead(data: {
  name: string;
  email: string;
  message?: string;
  utm?: Record<string, string>;
}) {
  const { data: lead, error } = await supabaseAdmin
    .from('leads')
    .insert({
      name: data.name,
      email: data.email,
      message: data.message,
      utm: data.utm,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Erro ao inserir lead:', error);
    throw new Error('Falha ao salvar contato');
  }

  return lead;
}

// Função para obter leads (apenas para admin)
export async function getLeads(limit = 100) {
  const { data: leads, error } = await supabaseAdmin
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Erro ao buscar leads:', error);
    throw new Error('Falha ao buscar contatos');
  }

  return leads;
}
