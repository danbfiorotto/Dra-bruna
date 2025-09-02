## Cores do UI

As cores são definidas usando variáveis CSS no arquivo `globals.css`:

### Modo Claro
- `--background`: 0 0% 100% (Branco)
- `--foreground`: 222.2 84% 4.9% (Quase preto)
- `--card`: 0 0% 100% (Branco)
- `--card-foreground`: 222.2 84% 4.9% (Quase preto)
- `--popover`: 0 0% 100% (Branco)
- `--popover-foreground`: 222.2 84% 4.9% (Quase preto)
- `--primary`: 195 75% 40% (Um tom de azul/ciano)
- `--primary-foreground`: 210 40% 98% (Branco acinzentado)
- `--secondary`: 210 40% 96.1% (Cinza muito claro)
- `--secondary-foreground`: 222.2 47.4% 11.2% (Cinza escuro)
- `--muted`: 210 40% 96.1% (Cinza muito claro)
- `--muted-foreground`: 215.4 16.3% 46.9% (Cinza médio)
- `--accent`: 210 40% 96.1% (Cinza muito claro)
- `--accent-foreground`: 222.2 47.4% 11.2% (Cinza escuro)
- `--destructive`: 0 84.2% 60.2% (Vermelho)
- `--destructive-foreground`: 210 40% 98% (Branco acinzentado)
- `--border`: 214.3 31.8% 91.4% (Cinza claro)
- `--input`: 214.3 31.8% 91.4% (Cinza claro)
- `--ring`: 195 75% 40% (Um tom de azul/ciano)
- `--radius`: 0.5rem

### Cores da Marca (Custom Brand Colors)
- `--gold`: 38 47% 61% (Dourado)
- `--black`: 0 0% 0% (Preto)
- `--light-gray`: 0 0% 96% (Cinza claro)
- `--soft-pink`: 357 42% 85% (Rosa suave)

### Modo Escuro
- `--background`: 222.2 84% 4.9% (Quase preto)
- `--foreground`: 210 40% 98% (Branco acinzentado)
- `--card`: 222.2 84% 4.9% (Quase preto)
- `--card-foreground`: 210 40% 98% (Branco acinzentado)
- `--popover`: 222.2 84% 4.9% (Quase preto)
- `--popover-foreground`: 210 40% 98% (Branco acinzentado)
- `--primary`: 195 75% 40% (Um tom de azul/ciano)
- `--primary-foreground`: 210 40% 98% (Branco acinzentado)
- `--secondary`: 217.2 32.6% 17.5% (Cinza escuro)
- `--secondary-foreground`: 210 40% 98% (Branco acinzentado)
- `--muted`: 217.2 32.6% 17.5% (Cinza escuro)
- `--muted-foreground`: 215 20.2% 65.1% (Cinza médio)
- `--accent`: 217.2 32.6% 17.5% (Cinza escuro)
- `--accent-foreground`: 210 40% 98% (Branco acinzentado)
- `--destructive`: 0 62.8% 30.6% (Vermelho escuro)
- `--destructive-foreground`: 210 40% 98% (Branco acinzentado)
- `--border`: 217.2 32.6% 17.5% (Cinza escuro)
- `--input`: 217.2 32.6% 17.5% (Cinza escuro)
- `--ring`: 195 75% 40% (Um tom de azul/ciano)





## Fontes

As fontes são definidas no arquivo `globals.css`:
- `font-serif`: `var(--font-playfair), serif;` (Provavelmente Playfair Display)
- `font-sans`: `var(--font-inter), sans-serif;` (Provavelmente Inter)

Para confirmar as fontes exatas, preciso verificar onde `var(--font-playfair)` e `var(--font-inter)` são definidos. Isso geralmente acontece no `layout.tsx` ou `next.config.mjs`.




As fontes exatas são:
- **Playfair Display** para `font-serif`
- **Inter** para `font-sans`




## Estrutura do Layout e Componentes

O site utiliza um layout responsivo, com componentes bem definidos, provavelmente construídos com React/Next.js e estilizados com Tailwind CSS. A estrutura geral inclui:

### Header (MainLayout.tsx)
- **Fixo no topo:** `fixed top-0 left-0 right-0 z-50`
- **Cor de fundo:** `bg-black` (preto)
- **Sombra:** `shadow-md`
- **Conteúdo:**
    - **Logo:** Imagem `/images/logo.png` (40x40px) e texto "Dra. Bruna Torelli Soares" (`text-gold text-xl sm:text-2xl font-serif`).
    - **Navegação (Desktop):** `hidden md:flex` para ocultar em telas pequenas e exibir em médias/grandes.
        - Links de navegação (`text-white hover:text-gold`).
        - Botão de ação "Agendar Consulta" ou "Área do Cliente" (`bg-gold hover:bg-opacity-80 text-black px-4 py-2 rounded`).
    - **Navegação (Mobile):** Ícone de hambúrguer (`md:hidden`) que revela um menu dropdown (`absolute right-0 top-10 w-screen bg-black shadow-lg`).

### Main Content (`<main>` tag)
- O conteúdo principal é renderizado dentro da tag `<main>`.
- Possui um `pt-16` (padding-top de 16 unidades) quando não está em um dashboard, para compensar o header fixo.

### Footer (MainLayout.tsx)
- **Cor de fundo:** `bg-black` (preto)
- **Cor do texto:** `text-white`
- **Padding:** `py-8`
- **Estrutura:** Grid responsivo (`grid grid-cols-1 md:grid-cols-4 gap-8`) com 4 colunas em telas maiores.
    - **Informações de Contato:** Título (`text-gold text-xl font-serif font-semibold mb-4`), texto (`text-gold/80 text-sm mb-4`, `text-gray-300`).
    - **Serviços:** Título (`text-xl font-serif font-semibold mb-4 text-gold`), lista de links (`text-gray-300 hover:text-gold`).
    - **Links Rápidos e Horário de Atendimento:** Dois blocos de conteúdo, cada um com título (`text-xl font-serif font-semibold mb-4 text-gold`) e lista de links/texto.
    - **Ícones de Redes Sociais:** Ícones SVG para Instagram, Facebook, WhatsApp (`text-gray-300 hover:text-gold`).
- **Direitos Autorais:** `border-t border-gray-800 text-center text-gray-400` no final.

### Seções Comuns (page.tsx)

#### Hero Section
- **Altura:** `h-[500px] sm:h-[600px]` (responsivo)
- **Fundo:** Imagem de fundo (`/images/dentist-hero.jpg`) com overlay preto (`bg-black/70`).
- **Conteúdo Centralizado:** `flex flex-col justify-center items-center text-center`.
- **Elementos:**
    - Logo da Dra. Bruna (`/images/logo.png`, `w-32 h-32 sm:w-auto sm:h-auto`).
    - Título principal: "Dra. Bruna Torelli Soares" (`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gold`).
    - Subtítulo: "Cirurgiã Dentista • Especialista em Endodontia" (`text-lg sm:text-xl text-white mb-2 sm:mb-3 font-serif`).
    - Descrição: (`text-base sm:text-lg text-white mb-6 sm:mb-8 max-w-2xl`).
    - Botões de Ação: `flex flex-col sm:flex-row gap-3 sm:gap-4` para layout responsivo.
        - Botão Primário: `bg-gold hover:bg-opacity-80 text-black py-4 sm:py-6 px-6 sm:px-8 rounded`.
        - Botão Secundário: `border border-gold text-gold hover:bg-gold/10 py-4 sm:py-6 px-6 sm:px-8 rounded`.

#### About Section
- **Cor de fundo:** `bg-light-gray`.
- **Layout:** `flex flex-col md:flex-row items-center gap-8 sm:gap-12` (imagem à esquerda, texto à direita em telas maiores).
- **Imagem:** `rounded-lg shadow-lg w-full h-auto`.
- **Título:** `text-2xl sm:text-3xl font-serif font-bold text-black mb-4 sm:mb-6 border-l-4 border-gold pl-4` (borda dourada à esquerda).
- **Texto:** `text-gray-700`.
- **Botão:** `inline-block bg-transparent border border-gold text-black hover:bg-gold hover:text-black py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors`.

#### Services Overview
- **Título Centralizado:** `text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black`.
- **Linha Divisória:** `w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12` (linha dourada centralizada).
- **Cards de Serviço:** `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8`.
    - **Estilo do Card:** `bg-white rounded-lg shadow-lg p-5 sm:p-6 border-t-4 border-gold hover:shadow-xl transition-shadow flex flex-col h-full` (borda superior dourada, sombra ao passar o mouse).
    - **Título do Card:** `text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-black`.
    - **Texto do Card:** `text-gray-700`.
    - **Link "Saiba mais":** `text-gold hover:text-black font-medium inline-flex items-center` com ícone de seta SVG.

#### For Professionals Section
- **Cor de fundo:** `bg-black`.
- **Container Interno:** `bg-gradient-to-r from-black to-gray-900 rounded-lg p-6 sm:p-8 shadow-lg` (gradiente de preto para cinza escuro).
- **Layout:** `flex flex-col md:flex-row items-center` (texto à esquerda, vantagens à direita em telas maiores).
- **Título:** `text-2xl sm:text-3xl font-serif font-bold text-gold`.
- **Texto:** `text-white`.
- **Botão:** `inline-block bg-gold hover:bg-opacity-80 text-black px-4 py-2 rounded`.
- **Vantagens para Parceiros (Card):** `bg-white p-5 sm:p-6 rounded-lg shadow`.
    - **Título:** `text-lg sm:text-xl font-semibold text-black`.
    - **Lista:** `space-y-2 text-gray-800` com ícones de checkmark dourados (`text-gold mr-2 mt-0.5`).

#### Testimonials Section
- **Cor de fundo:** `bg-light-gray`.
- **Título Centralizado:** Similar à seção de serviços.
- **Cards de Depoimento:** `grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8`.
    - **Estilo do Card:** `bg-white p-5 sm:p-6 rounded-lg shadow-lg`.
    - **Estrelas:** `text-gold flex text-lg sm:text-xl`.
    - **Texto do Depoimento:** `text-gray-700 italic mb-4 sm:mb-6 text-sm sm:text-base`.
    - **Nome:** `font-semibold text-black`.

#### CTA Section
- **Cor de fundo:** `bg-black`.
- **Conteúdo Centralizado:** `text-center`.
- **Título:** `text-2xl sm:text-3xl font-serif font-bold text-gold`.
- **Texto:** `text-lg sm:text-xl text-white`.
- **Botão:** `inline-block bg-gold hover:bg-opacity-80 text-black py-4 sm:py-6 px-8 sm:px-10 text-base sm:text-lg rounded w-full sm:w-auto max-w-xs mx-auto`.





## Observação Importante

Não foi possível construir e visualizar o site no navegador devido a um erro de módulo não encontrado (`@/hooks/useReferrals`). A descrição do UI foi elaborada com base na análise dos arquivos de código-fonte (`.tsx` e `.css`).




## Elementos Gerais do UI e Estilos

O site utiliza uma abordagem de design moderna e limpa, com foco em tipografia clara e uso estratégico de cores para destacar elementos importantes. A maioria dos estilos é aplicada via classes do Tailwind CSS, o que permite um design responsivo e consistente.

### Tipografia
- **Títulos (font-serif):** Utilizam a fonte Playfair Display, que confere um toque elegante e profissional. Geralmente em tamanhos maiores e em negrito (`font-bold`).
- **Textos de Corpo (font-sans):** Utilizam a fonte Inter, uma fonte sans-serif moderna e legível, ideal para o corpo do texto.
- **Cores do Texto:** Predominantemente `text-black` (quase preto) para o modo claro e `text-white` (branco acinzentado) para o modo escuro, com `text-gray-700` para textos secundários e `text-gold` para destaques.

### Botões
- **Botões Primários (ex: Agendar Consulta):**
    - Fundo: `--gold` (`bg-gold`)
    - Texto: `--black` (`text-black`)
    - Hover: `bg-opacity-80` (reduz a opacidade do fundo)
    - Padding: `py-4 sm:py-6 px-6 sm:px-8` (responsivo)
    - Borda: `rounded` (bordas arredondadas)
- **Botões Secundários (ex: Para Clínicas, Conheça mais):**
    - Fundo: Transparente (`bg-transparent`)
    - Borda: `--gold` (`border border-gold`)
    - Texto: `--gold` (`text-gold`)
    - Hover: `bg-gold/10` (fundo com 10% de opacidade da cor gold) ou `hover:bg-gold hover:text-black` (fundo gold, texto preto)
    - Padding e Borda: Variam conforme o uso, mas seguem o padrão `rounded`.

### Cards
- **Fundo:** Geralmente `bg-white` no modo claro.
- **Sombra:** `shadow-lg` ou `shadow-xl` no hover.
- **Borda Superior:** `border-t-4 border-gold` para destacar.
- **Padding:** `p-5 sm:p-6` (responsivo).
- **Transições:** `transition-shadow` para efeitos de hover suaves.

### Imagens
- **Hero Section:** Imagens de fundo com `object-cover` e `fill` para cobrir toda a área, com um overlay escuro (`bg-black/70`).
- **Imagens de Perfil/Conteúdo:** `rounded-lg shadow-lg` para bordas arredondadas e sombra.

### Ícones
- **Ícones de Redes Sociais:** SVGs com `w-6 h-6` e `fill="currentColor"`, permitindo que a cor seja controlada pelo `text-gray-300 hover:text-gold`.
- **Ícones de Seta:** SVGs pequenos (`h-4 w-4`) para indicar links "Saiba mais".
- **Checkmarks:** Utilizados em listas de vantagens, com `text-gold` para destaque.

### Responsividade
- O site utiliza classes responsivas do Tailwind CSS (ex: `sm:`, `md:`, `lg:`) para adaptar o layout e o tamanho dos elementos a diferentes tamanhos de tela.
- O menu de navegação se transforma em um menu hambúrguer em telas menores.




