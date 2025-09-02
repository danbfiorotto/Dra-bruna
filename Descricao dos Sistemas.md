Descrição Completa do Objetivo Final – Sistema Dra. Bruna
1. Visão Geral do Produto

O Sistema Dra. Bruna é uma solução integrada composta por:

Site institucional (Web Vitrine): canal público de divulgação do trabalho da Dra. Bruna, com informações sobre tratamentos, casos clínicos, depoimentos, artigos e contato direto via formulário/WhatsApp.

Aplicativo Desktop (Windows, Tauri + React/TS): software clínico para gestão completa de pacientes, agenda, prontuários, documentos e finanças, funcionando offline com sincronização híbrida para a nuvem (Supabase), pronto para evoluir para acesso web e mobile no futuro.

O produto entrega profissionalismo, eficiência operacional, segurança de dados (LGPD) e uma experiência de uso fluida e moderna.

2. Arquitetura e Stack Tecnológico
2.1 Web Vitrine

Framework: Next.js em modo estático (SSG).

Hospedagem: Vercel/Netlify.

Front-end: React/TS + TailwindCSS + shadcn/ui (Radix).

Conteúdo: páginas estáticas otimizadas com SEO inteligente, schema.org LocalBusiness.

Contato: formulário integrado a e-mail e botão WhatsApp.

Segurança/Políticas: páginas de Termos e Política de Privacidade.

Performance: PageSpeed > 90 em dispositivos móveis e desktop.

2.2 Aplicativo Windows

Core: Tauri (Rust) + React/TS.

UI/UX: React + shadcn/ui (Radix), com estilo profissional e acessível.

Banco local: SQLite com SQLCipher (criptografia total).

Sincronização: cache local com sync para Supabase (Postgres + Auth + Storage).

Camadas:

Domain (TS): entidades e regras de negócio.

Infra Local (Rust/SQLite): persistência, criptografia, backup.

Infra Cloud (Supabase): autenticação, RLS, sincronização de dados.

Use Cases (TS): orquestração das funcionalidades (agenda, prontuário, etc.).

Linguagens:

Frontend: TypeScript + React.

Backend local: Rust (Tauri commands).

Cloud: SQL (Postgres), policies RLS, edge functions Supabase.

3. Funcionalidades
3.1 Web (Vitrine)

Home (proposta de valor e CTA).

Sobre (formação, abordagem humanizada).

Tratamentos (detalhes, indicações, FAQ).

Casos Antes/Depois (galeria de imagens otimizadas).

Depoimentos (textos e vídeos opcionais).

Blog/Artigos (conteúdo educacional em MDX).

Contato (formulário integrado a e-mail + botão WhatsApp).

Endereço/Mapa (Google Maps embed).

Políticas (Privacidade e Termos).

3.2 Aplicativo Desktop

Pacientes: cadastro, histórico clínico, alergias, contatos.

Agenda: visão diária/semana/mês; agendar, reagendar, cancelar; status e notas.

Prontuário: anamnese, diagnóstico, plano, relatório pós (JSON versionado).

Documentos: upload de exames/laudos com criptografia cliente-side (AES-GCM); visualização segura.

Financeiro: lançamentos de receitas/despesas, categorias, gráficos; relatórios financeiros.

Relatórios:

Agenda do Dia (impressão).

Fluxo de Caixa do Mês (PDF/CSV).

Exportações: CSV e PDF de pacientes, consultas, lançamentos.

Backup: automático diário (dump + anexos, criptografado, com checksum).

Restore: verificação de versão e integridade; botão “Testar Backup/Restore”.

Pesquisa Global (Ctrl+K): pacientes, consultas, documentos.

Atalhos: N (nova consulta), F (buscar paciente), Ctrl+P (imprimir agenda).

Autosave: em prontuários e agendamentos.

Auditoria: audit_log de todas as ações sensíveis.

Deploy: NSIS/MSIX, com auto-update habilitado (canais estável/beta).

4. Segurança e Criptografia

Banco local: SQLite + SQLCipher (AES-256).

Sessões: Supabase Auth (tokens armazenados no Windows DPAPI).

Documentos: criptografia cliente-side (AES-GCM), com IV, salt e hash armazenados em metadados.

Backup: criptografado e assinado (checksum SHA-256).

Auditoria: registro completo de ações (usuário, ação, entidade, timestamp, host).

LGPD: políticas publicadas, consentimento registrado em ações críticas, exportabilidade dos dados (paciente pode receber dossiê ZIP com PDFs/JSON).

5. Design & UX

Identidade visual: baseada no site já existente (cores, tipografia, imagens).

Tom: profissional de autoridade, mas acolhedor e humanizado.

UX Operativa:

Navegação clara, pesquisa global, atalhos de teclado.

Layout clean com shadcn/ui (componentes acessíveis e responsivos).

Autosave e feedback visual imediato (“Salvo há X segundos”).

Relatórios: templates padronizados com logo, cabeçalho, rodapé, numeração.

6. Qualidade & Testes

Unit tests: regras de negócio (Domain).

Integração: persistência SQLite/SQLCipher, sync Supabase, geração de relatórios.

E2E crítico: fluxo completo paciente → agendamento → prontuário → documento → financeiro → relatório.

Smoke test: build + instalação em múltiplos PCs.

Observabilidade: logging local + envio opcional de erros (sem PII).

7. Deploy & Distribuição

Site: deploy automático em Netlify/Vercel, com SEO monitorado (Search Console).

App Windows: build Tauri → instalador NSIS/MSIX → canal estável e beta com auto-update.

Ciclo de versões: SemVer (1.0.0 para MVP).

Distribuição: entrega interna + futura publicação em Windows Store (opcional).

8. Objetivo Final (resumido)

Entregar uma solução profissional, segura, eficiente e humanizada, composta por:

Um site vitrine altamente otimizado e responsivo, para divulgar o trabalho da Dra. Bruna, atrair pacientes e facilitar o contato.

Um aplicativo Windows robusto e offline-first, que centraliza todas as operações da clínica: cadastro de pacientes, agenda completa, prontuários detalhados, anexos/documentos criptografados, controle financeiro, relatórios padronizados, backups automáticos e auditoria.

Uma base tecnológica moderna (Tauri + React/TS + Rust + Supabase + SQLCipher), pronta para escalar no futuro para acesso web e mobile, sem comprometer a performance nem a segurança dos dados sensíveis de saúde.