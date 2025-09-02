# ADR-0012: Design System (Tokens, Fontes, Ícones)

## Status
Accepted

## Context
Manter identidade visual consistente entre site e aplicativo desktop, com acessibilidade e performance otimizadas. Atualização da identidade visual para design dourado/preto elegante e sofisticado.

## Decision
Implementar design system centralizado:
- **Tokens**: Pacote `@bruna/design-tokens` compartilhado
- **Fontes**: Self-hosted (Inter + Playfair Display) para offline
- **Ícones**: Lucide React unificado
- **Acessibilidade**: WCAG AA compliance
- **Identidade Visual**: Design dourado/preto elegante e sofisticado

## Rationale
- **Centralized Tokens**: Consistência e manutenibilidade
- **Self-hosted Fonts**: Performance e funcionamento offline
- **Unified Icons**: Consistência visual e acessibilidade
- **WCAG AA**: Conformidade com padrões de acessibilidade
- **Design Dourado/Preto**: Elegância, sofisticação e profissionalismo

## Consequences
### Positive
- Identidade visual unificada e elegante
- Performance otimizada
- Funcionamento offline garantido
- Acessibilidade melhorada
- Design sofisticado e profissional

### Negative
- Complexidade de sincronização de tokens
- Necessidade de manter fontes atualizadas
- Overhead de bundle para ícones

## Implementation
- **Design Tokens**: NPM workspace package
- **Fonts**: WOFF2 self-hosted com fallbacks
- **Icons**: Lucide React com labels acessíveis
- **Colors**: Paleta Dra. Bruna dourado/preto com contraste AA
- **Spacing**: Escala baseada em 8px
- **Typography**: Inter (body) + Playfair Display (headings)
- **Primary Color**: #D4AF37 (dourado)
- **Secondary Color**: #000000 (preto)
