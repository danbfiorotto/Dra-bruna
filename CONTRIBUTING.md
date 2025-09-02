# Guia de Contribuição - Sistema Dra. Bruna

Obrigado por considerar contribuir com o Sistema Dra. Bruna! Este documento fornece diretrizes e informações para contribuidores.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Convenções de Código](#convenções-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Melhorias](#sugerindo-melhorias)

## 🤝 Código de Conduta

Este projeto segue um código de conduta para garantir um ambiente acolhedor e respeitoso para todos os contribuidores.

### Nossos Compromissos
- Ser respeitoso e inclusivo
- Aceitar críticas construtivas
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros

### Comportamentos Inaceitáveis
- Linguagem ou imagens sexualizadas
- Trolling, comentários insultuosos ou ataques pessoais
- Assédio público ou privado
- Publicar informações privadas sem permissão

## 🚀 Como Contribuir

### Tipos de Contribuição
- 🐛 **Bug fixes**: Correção de problemas
- ✨ **Features**: Novas funcionalidades
- 📚 **Documentação**: Melhorias na documentação
- 🧪 **Testes**: Adição de testes
- 🎨 **UI/UX**: Melhorias na interface
- 🔧 **Refatoração**: Melhoria do código

### Processo de Contribuição
1. **Fork** o repositório
2. **Clone** seu fork localmente
3. **Crie** uma branch para sua feature
4. **Faça** suas alterações
5. **Teste** suas alterações
6. **Commit** com mensagem descritiva
7. **Push** para seu fork
8. **Abra** um Pull Request

## 🛠️ Configuração do Ambiente

### Pré-requisitos
```bash
# Node.js 18+
node --version

# Rust 1.75+
rustc --version

# npm 9+
npm --version
```

### Setup Inicial
```bash
# Clone o repositório
git clone https://github.com/dra-bruna/sistema-dra-bruna.git
cd sistema-dra-bruna

# Instale dependências
npm install

# Verifique se tudo está funcionando
npm run lint
npm run build:site
npm run build:app
```

### Desenvolvimento
```bash
# Site (Next.js)
npm run dev:site

# App (Tauri)
npm run dev:app

# Ambos em paralelo
npm run dev:site & npm run dev:app
```

## 📝 Convenções de Código

### Commits
Seguimos [Conventional Commits](https://conventionalcommits.org/):

```bash
# Formato
<type>[optional scope]: <description>

# Exemplos
feat: adiciona autenticação de usuário
fix: corrige bug na validação de email
docs: atualiza README com novas instruções
style: formata código com Prettier
refactor: reorganiza estrutura de componentes
test: adiciona testes para módulo de pacientes
chore: atualiza dependências
```

### Branches
```bash
# Nomenclatura
feature/nome-da-funcionalidade
hotfix/correcao-urgente
bugfix/descricao-do-bug
docs/atualizacao-documentacao

# Exemplos
feature/agenda-calendario
hotfix/corrige-crash-login
bugfix/validação-cpf
docs/adiciona-exemplos-api
```

### TypeScript
- Use tipos explícitos
- Evite `any`
- Prefira interfaces para objetos
- Use enums para constantes

```typescript
// ✅ Bom
interface Patient {
  id: string;
  name: string;
  email?: string;
}

// ❌ Evitar
const patient: any = { ... };
```

### React
- Use functional components
- Prefira hooks customizados
- Use TypeScript para props
- Evite prop drilling

```typescript
// ✅ Bom
interface PatientCardProps {
  patient: Patient;
  onEdit: (id: string) => void;
}

export function PatientCard({ patient, onEdit }: PatientCardProps) {
  return (
    <div>
      <h3>{patient.name}</h3>
      <button onClick={() => onEdit(patient.id)}>Editar</button>
    </div>
  );
}
```

### Rust
- Use `cargo clippy` para linting
- Use `cargo fmt` para formatação
- Documente funções públicas
- Use `Result` para error handling

```rust
// ✅ Bom
/// Cria um novo paciente no banco de dados
pub async fn create_patient(
    pool: &SqlitePool,
    patient: CreatePatientRequest,
) -> Result<Patient, AppError> {
    // implementação
}
```

## 🔄 Processo de Pull Request

### Antes de Abrir um PR
- [ ] Código segue as convenções
- [ ] Lint passa sem erros
- [ ] Type check passa
- [ ] Build funciona
- [ ] Testes passam (quando aplicável)
- [ ] Documentação atualizada

### Template de PR
```markdown
## Descrição
Breve descrição das alterações.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova feature
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código testado
- [ ] Documentação atualizada
- [ ] Lint sem erros
- [ ] Build funcionando

## Screenshots (se aplicável)
Adicione screenshots para mudanças de UI.

## Issues Relacionadas
Closes #123
```

### Review Process
1. **Automático**: CI/CD pipeline
2. **Manual**: Review de código
3. **Aprovação**: Pelo menos 1 reviewer
4. **Merge**: Após aprovação

## 🐛 Reportando Bugs

### Template de Bug Report
```markdown
## Descrição
Descrição clara do bug.

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## Comportamento Esperado
O que deveria acontecer.

## Screenshots
Se aplicável, adicione screenshots.

## Ambiente
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Versão: [e.g. 1.0.0]

## Logs
Adicione logs relevantes.
```

## 💡 Sugerindo Melhorias

### Template de Feature Request
```markdown
## Descrição
Descrição clara da melhoria sugerida.

## Problema
Qual problema isso resolve?

## Solução Proposta
Como você gostaria que funcionasse?

## Alternativas
Outras soluções consideradas.

## Contexto Adicional
Qualquer contexto adicional.
```

## 🧪 Testes

### Executando Testes
```bash
# Todos os testes
npm run test

# Testes específicos
npm run test --workspace=site-bruna
npm run test --workspace=app-bruna

# Testes com coverage
npm run test:coverage
```

### Escrevendo Testes
- Teste casos de sucesso e erro
- Use mocks para dependências externas
- Mantenha testes simples e focados
- Nomeie testes de forma descritiva

## 📚 Recursos Úteis

### Documentação
- [Next.js Docs](https://nextjs.org/docs)
- [Tauri Docs](https://tauri.app/)
- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

### Ferramentas
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)

## ❓ Dúvidas?

Se você tem dúvidas sobre como contribuir:
- Abra uma [issue](https://github.com/dra-bruna/sistema-dra-bruna/issues)
- Consulte a [documentação](docs/)
- Verifique os [ADRs](docs/adr/)

---

Obrigado por contribuir com o Sistema Dra. Bruna! 🎉
