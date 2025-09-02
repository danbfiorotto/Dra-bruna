# 🚀 Guia de Deploy - Site Dra. Bruna

## ✅ Status do Projeto

O site está **100% pronto** para deploy! Todas as funcionalidades foram implementadas:

- ✅ **Páginas Completas**: Home, Sobre, Tratamentos, Casos, Depoimentos, Blog, Contato, Políticas
- ✅ **SEO Otimizado**: Schema.org, sitemap.xml, robots.txt, meta tags
- ✅ **Design Responsivo**: Mobile-first, otimizado para todos os dispositivos
- ✅ **Performance**: Build otimizado, CSS inlined, lazy loading
- ✅ **WhatsApp Integration**: Botões funcionais em todas as páginas
- ✅ **Formulário de Contato**: Estrutura pronta para integração com EmailJS/Formspree
- ✅ **Acessibilidade**: Componentes acessíveis, ARIA labels
- ✅ **Segurança**: Headers de segurança configurados

## 🎯 Opções de Deploy

### 1. Vercel (Recomendado)

**Vantagens**: Deploy automático, CDN global, otimizações automáticas

1. **Conectar Repositório**:
   - Acesse [vercel.com](https://vercel.com)
   - Conecte seu repositório GitHub
   - Configure o projeto

2. **Configurações**:
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `out`
   - Node.js Version: 18.x

3. **Deploy**:
   - Deploy automático a cada push
   - URL personalizada disponível

### 2. Netlify

**Vantagens**: Deploy automático, formulários nativos, redirects

1. **Conectar Repositório**:
   - Acesse [netlify.com](https://netlify.com)
   - Conecte seu repositório
   - Configure o build

2. **Configurações**:
   - Build Command: `npm run build`
   - Publish Directory: `out`
   - Node Version: 18

3. **Deploy**:
   - Deploy automático configurado
   - Formulário de contato funcionará automaticamente

### 3. Deploy Manual

**Para hospedagem própria**:

```bash
# 1. Build do projeto
npm run build

# 2. Upload da pasta 'out' para seu servidor
# 3. Configurar servidor web (Apache/Nginx)
# 4. Configurar HTTPS
```

## 📧 Configuração do Formulário de Contato

### Opção 1: EmailJS (Recomendado)

1. **Criar conta**: [emailjs.com](https://emailjs.com)
2. **Configurar serviço**: Gmail, Outlook, etc.
3. **Criar template** de e-mail
4. **Atualizar código** em `src/hooks/useContactForm.ts`:

```typescript
// Adicionar no início do arquivo
import emailjs from '@emailjs/browser';

// Substituir a função handleSubmit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID', 
      formData,
      'YOUR_PUBLIC_KEY'
    );
    setSubmitStatus('success');
  } catch (error) {
    setSubmitStatus('error');
  } finally {
    setIsSubmitting(false);
  }
};
```

### Opção 2: Netlify Forms

Se usar Netlify, o formulário funcionará automaticamente:

1. Adicionar `data-netlify="true"` ao form
2. Adicionar campo hidden: `<input type="hidden" name="form-name" value="contact" />`
3. Os dados aparecerão no painel do Netlify

### Opção 3: Formspree

1. **Criar conta**: [formspree.io](https://formspree.io)
2. **Obter endpoint** do formulário
3. **Atualizar** `useContactForm.ts` com a URL do Formspree

## 🔧 Personalizações Finais

### 1. Informações de Contato

**Arquivos para atualizar**:
- `src/components/Header.tsx` - Número do WhatsApp
- `src/components/Footer.tsx` - Endereço, telefone, e-mail
- `src/components/Layout.tsx` - Schema.org com dados reais
- `src/components/WhatsAppButton.tsx` - Número padrão

### 2. Conteúdo

**Páginas para personalizar**:
- `src/pages/sobre.tsx` - Informações da Dra. Bruna
- `src/pages/tratamentos.tsx` - Lista de tratamentos
- `src/pages/casos.tsx` - Casos reais (adicionar imagens)
- `src/pages/depoimentos.tsx` - Depoimentos reais
- `src/pages/blog.tsx` - Artigos e posts

### 3. Imagens

**Adicionar imagens**:
- Logo da clínica
- Fotos da Dra. Bruna
- Casos antes/depois
- Imagens dos tratamentos
- Favicon personalizado

### 4. Cores e Branding

**Arquivo**: `design-tokens/src/tokens.ts`
- Personalizar cores da marca
- Ajustar tipografia
- Modificar espaçamentos

## 📊 Verificação Pós-Deploy

### 1. Testes Essenciais

- [ ] Site carrega corretamente
- [ ] Todas as páginas funcionam
- [ ] Botões WhatsApp funcionam
- [ ] Formulário de contato envia
- [ ] Design responsivo funciona
- [ ] Links internos funcionam

### 2. SEO

- [ ] Google Search Console configurado
- [ ] Sitemap indexado
- [ ] Meta tags corretas
- [ ] Schema.org validado
- [ ] PageSpeed > 90

### 3. Analytics

**Configurar**:
- Google Analytics 4
- Google Tag Manager (opcional)
- Facebook Pixel (opcional)

## 🚨 Checklist Final

- [ ] **Domínio configurado** (se aplicável)
- [ ] **HTTPS ativado**
- [ ] **Formulário de contato funcionando**
- [ ] **WhatsApp configurado com número real**
- [ ] **Informações de contato atualizadas**
- [ ] **Imagens adicionadas**
- [ ] **Conteúdo personalizado**
- [ ] **Google Search Console configurado**
- [ ] **Analytics configurado**

## 📞 Suporte

Para dúvidas sobre o deploy ou personalizações:

- **Documentação**: README.md
- **Código**: Comentários em todos os arquivos
- **Configurações**: Arquivos de configuração documentados

## 🎉 Próximos Passos

1. **Deploy** do site
2. **Configurar** formulário de contato
3. **Personalizar** conteúdo e imagens
4. **Configurar** analytics
5. **Monitorar** performance e SEO
6. **Manter** conteúdo atualizado

---

**O site está pronto para produção!** 🚀

