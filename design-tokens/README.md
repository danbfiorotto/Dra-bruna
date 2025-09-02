# @bruna/design-tokens

Design tokens centralizados para o sistema Dra. Bruna, garantindo identidade visual unificada entre o site e o aplicativo desktop.

## Instalação

```bash
npm install @bruna/design-tokens
```

## Uso

### Importar tokens

```typescript
import { colors, spacing, typography, designTokens } from '@bruna/design-tokens';
```

### Usar em Tailwind CSS

```typescript
// tailwind.config.js
import { designTokens } from '@bruna/design-tokens';

export default {
  theme: {
    extend: {
      colors: designTokens.colors,
      spacing: designTokens.spacing,
      fontFamily: designTokens.typography.fontFamily,
      // ... outros tokens
    },
  },
};
```

### Fontes self-hosted

Para usar as fontes self-hosted:

```css
@import '@bruna/design-tokens/fonts/fonts.css';
```

## Tokens Disponíveis

- **colors**: Paleta de cores da marca Dra. Bruna
- **spacing**: Escala de espaçamento baseada em 8px
- **typography**: Configurações de tipografia (Inter + Poppins)
- **borderRadius**: Raios de borda padronizados
- **boxShadow**: Sombras consistentes
- **animation**: Durações e easing para animações
- **focus**: Estados de foco acessíveis
- **buttonVariants**: Variantes de botões padronizadas

## Acessibilidade

Todos os tokens foram criados seguindo as diretrizes WCAG AA:
- Contraste adequado para textos
- Estados de foco visíveis
- Cores semânticas para diferentes estados

## Fontes

- **Inter**: Fonte para corpo do texto (400, 500, 600, 700)
- **Poppins**: Fonte para títulos (400, 500, 600, 700)

As fontes estão disponíveis em formato WOFF2 para otimização e funcionamento offline.
