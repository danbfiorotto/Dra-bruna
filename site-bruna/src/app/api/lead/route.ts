import { NextResponse } from 'next/server';
import { z } from 'zod';
import { insertLead } from '@/lib/supabaseAdmin';

// Schema de validação para o formulário de contato
const LeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(120, 'Nome muito longo'),
  email: z.string().email('E-mail inválido').max(200, 'E-mail muito longo'),
  message: z.string().max(2000, 'Mensagem muito longa').optional(),
  utm: z.record(z.string()).optional()
});

// Rate limiting simples (em produção, use Redis ou similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5; // 5 requests
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(ip: string): string {
  return `rate_limit_${ip}`;
}

function checkRateLimit(ip: string): boolean {
  const key = getRateLimitKey(ip);
  const now = Date.now();
  const limit = rateLimit.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'rate_limit_exceeded', message: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      );
    }

    // Parse e validação do JSON
    const json = await req.json().catch(() => ({}));
    const parsed = LeadSchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json(
        { 
          error: 'validation_error', 
          message: 'Dados inválidos',
          issues: parsed.error.issues 
        },
        { status: 400 }
      );
    }

    const { name, email, message, utm } = parsed.data;

    // Inserir no banco de dados
    const lead = await insertLead({
      name,
      email,
      message,
      utm
    });

    // Log para auditoria
    console.log(`Novo lead recebido: ${email} - ${name}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Contato enviado com sucesso!',
      id: lead.id 
    });

  } catch (error) {
    console.error('Erro no endpoint /api/lead:', error);
    
    return NextResponse.json(
      { 
        error: 'server_error', 
        message: 'Erro interno do servidor. Tente novamente mais tarde.' 
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    message: 'API de contato funcionando',
    timestamp: new Date().toISOString()
  });
}

// Configuração do runtime
export const runtime = 'nodejs';
