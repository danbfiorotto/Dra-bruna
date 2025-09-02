# Contribuindo para o Sistema Dra. Bruna

Obrigado por considerar contribuir para o Sistema Dra. Bruna! Este documento fornece diretrizes para contribuições.

## Código de Conduta

Este projeto segue um código de conduta profissional. Ao participar, você concorda em manter um ambiente respeitoso e inclusivo.

## Como Contribuir

### 1. Configuração do Ambiente

```bash
# Clone o repositório
git clone https://github.com/dra-bruna/sistema-dra-bruna.git
cd sistema-dra-bruna

# Instale as dependências
npm install

# Build dos design tokens
npm run build --workspace=design-tokens
```

### 2. Convenções de Commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos de Commit

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação, sem mudança de código
- `refactor`: Refatoração de código
- `test`: Adição ou correção de testes
- `chore`: Tarefas de manutenção

#### Exemplos

```bash
feat(auth): adicionar autenticação com Google
fix(ui): corrigir contraste de cores em modo escuro
docs(api): atualizar documentação da API de pacientes
style: formatar código com prettier
refactor(db): otimizar queries do banco de dados
test(auth): adicionar testes para login
chore(deps): atualizar dependências
```

### 3. Política de Branches

#### Estrutura de Branches

- `main`: Branch principal, sempre estável
- `develop`: Branch de desenvolvimento
- `feature/*`: Novas funcionalidades
- `fix/*`: Correções de bugs
- `hotfix/*`: Correções urgentes para produção

#### Nomenclatura

```bash
feature/auth-google-signin
fix/patient-form-validation
hotfix/security-patch
docs/api-documentation
```

### 4. Processo de Pull Request

#### Antes de Criar um PR

1. **Sincronize com a branch base**:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/sua-feature
   git rebase develop
   ```

2. **Execute os testes**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

3. **Build local**:
   ```bash
   npm run build:site
   npm run build:app
   ```

#### Template de Pull Request

```markdown
## Descrição
Breve descrição das mudanças.

## Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação

## Checklist
- [ ] Código segue as convenções do projeto
- [ ] Testes foram adicionados/atualizados
- [ ] Documentação foi atualizada
- [ ] Build passa sem warnings
- [ ] Lint passa sem erros

## Screenshots (se aplicável)
Adicione screenshots para mudanças visuais.

## Issues Relacionadas
Closes #123
```

### 5. Checklist de Release

#### Antes de Fazer Release

- [ ] Todos os testes passam
- [ ] Build sem warnings
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] Version bump nos package.json
- [ ] ADRs atualizados se necessário

#### Processo de Release

1. **Criar branch de release**:
   ```bash
   git checkout develop
   git checkout -b release/v1.2.0
   ```

2. **Atualizar versões**:
   ```bash
   npm version patch  # ou minor/major
   ```

3. **Merge para main**:
   ```bash
   git checkout main
   git merge release/v1.2.0
   git tag v1.2.0
   git push origin main --tags
   ```

4. **Merge de volta para develop**:
   ```bash
   git checkout develop
   git merge release/v1.2.0
   git push origin develop
   ```

### 6. Padrões de Código

#### TypeScript/React

- Use TypeScript strict mode
- Prefira interfaces sobre types
- Use hooks funcionais
- Componentes em PascalCase
- Arquivos em kebab-case

#### Rust

- Siga as convenções do Rust
- Use `cargo fmt` e `cargo clippy`
- Documente funções públicas
- Use `Result<T, E>` para error handling

#### CSS/Tailwind

- Use design tokens do `@bruna/design-tokens`
- Prefira classes utilitárias do Tailwind
- Mantenha contraste AA para acessibilidade
- Use variáveis CSS para temas

### 7. Testes

#### Estrutura de Testes

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── Button.stories.tsx
```

#### Executar Testes

```bash
# Todos os testes
npm test

# Testes com watch
npm run test:watch

# Coverage
npm run test:coverage
```

### 8. Design System

#### Usando Design Tokens

```typescript
import { colors, spacing, typography } from '@bruna/design-tokens';

// Em componentes
<div style={{ 
  color: colors.primary.DEFAULT,
  padding: spacing[3],
  fontFamily: typography.fontFamily.sans
}}>
```

#### Adicionando Novos Tokens

1. Atualize `design-tokens/src/tokens.ts`
2. Build o pacote: `npm run build --workspace=design-tokens`
3. Teste em ambos os projetos

### 9. Acessibilidade

#### Checklist de Acessibilidade

- [ ] Contraste AA (4.5:1) para texto normal
- [ ] Contraste AAA (7:1) para texto pequeno
- [ ] Estados de foco visíveis
- [ ] Labels para todos os inputs
- [ ] Alt text para imagens
- [ ] Navegação por teclado
- [ ] Screen reader friendly

### 10. Segurança

#### Checklist de Segurança

- [ ] Dados sensíveis criptografados
- [ ] Validação de inputs
- [ ] Sanitização de dados
- [ ] Headers de segurança
- [ ] Secrets não versionados
- [ ] Dependências atualizadas

## Suporte

- **Issues**: Use o GitHub Issues para bugs e feature requests
- **Discussões**: Use GitHub Discussions para perguntas
- **Email**: contato@drabruna.com.br

## Agradecimentos

Obrigado por contribuir para o Sistema Dra. Bruna! Suas contribuições ajudam a melhorar o atendimento odontológico.