# Site Institucional - Dra. Bruna

Site institucional para a Dra. Bruna, especialista em estética e dermatologia. Desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 🚀 Características

- **Design Responsivo**: Otimizado para desktop, tablet e mobile
- **SEO Otimizado**: Schema.org, sitemap, meta tags otimizadas
- **Performance**: PageSpeed > 90, lazy loading, otimizações de CSS
- **Acessibilidade**: Componentes acessíveis com ARIA labels
- **Formulário de Contato**: Integração com WhatsApp e formulário de e-mail
- **Páginas Completas**: Home, Sobre, Tratamentos, Casos, Depoimentos, Blog, Contato, Políticas

## 🛠️ Tecnologias

- **Next.js 14**: Framework React com SSG
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Framework CSS utilitário
- **Lucide React**: Ícones modernos
- **Design Tokens**: Sistema de design unificado

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente (se necessário)
3. Deploy automático a cada push

### Netlify

1. Conecte seu repositório ao Netlify
2. Configure o build command: `npm run build`
3. Configure o publish directory: `out`
4. Deploy automático a cada push

### Deploy Manual

```bash
# Build do projeto
npm run build

# Os arquivos estáticos estarão na pasta 'out'
# Faça upload para seu servidor web
```

## 📧 Configuração do Formulário de Contato

Para ativar o envio de e-mails, configure um dos serviços abaixo:

### EmailJS (Recomendado para sites estáticos)

1. Crie uma conta no [EmailJS](https://www.emailjs.com/)
2. Configure um serviço de e-mail (Gmail, Outlook, etc.)
3. Crie um template de e-mail
4. Adicione as credenciais no arquivo `src/hooks/useContactForm.ts`

### Netlify Forms

1. Adicione `netlify` e `data-netlify="true"` ao formulário
2. Configure o Netlify para processar formulários
3. Os dados serão enviados para o painel do Netlify

### Formspree

1. Crie uma conta no [Formspree](https://formspree.io/)
2. Configure o endpoint no formulário
3. Adicione a URL do Formspree no hook

## 🎨 Personalização

### Cores

As cores estão definidas no arquivo `design-tokens/src/tokens.ts` e podem ser personalizadas:

```typescript
export const colors = {
  primary: {
    DEFAULT: '#3A7CA5', // Azul principal
  },
  accent: {
    DEFAULT: '#2D9C8F', // Verde/turquesa para CTAs
  },
  // ... outras cores
};
```

### Conteúdo

- **Páginas**: Edite os arquivos em `src/pages/`
- **Componentes**: Modifique em `src/components/`
- **Estilos**: Ajuste em `src/styles/globals.css`

### SEO

- **Meta tags**: Configure em cada página individual
- **Schema.org**: Atualize em `src/components/Layout.tsx`
- **Sitemap**: Modifique `public/sitemap.xml`

## 📱 WhatsApp Integration

O botão WhatsApp está configurado com:
- **Número**: +55 11 99999-9999 (altere conforme necessário)
- **Mensagem padrão**: Personalizável em cada componente
- **Componente reutilizável**: `src/components/WhatsAppButton.tsx`

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Servidor de produção
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas de lint
npm run type-check   # Verificar tipos TypeScript
npm run clean        # Limpar arquivos de build
```

## 📊 Performance

O site está otimizado para:
- **Lighthouse Score**: > 90 em todas as métricas
- **Core Web Vitals**: Otimizado
- **SEO**: Schema.org, sitemap, meta tags
- **Acessibilidade**: WCAG 2.1 AA

## 🛡️ Segurança

- Headers de segurança configurados
- Validação de formulários
- Sanitização de dados
- HTTPS obrigatório

## 📞 Suporte

Para dúvidas ou suporte técnico:
- **E-mail**: contato@drabrura.com.br
- **WhatsApp**: (11) 99999-9999

## 📄 Licença

Este projeto é propriedade da Dra. Bruna. Todos os direitos reservados.

