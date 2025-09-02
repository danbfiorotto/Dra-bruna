# ADR-0010: Relatórios HTML→PDF + CSV

## Status
Accepted

## Context
O sistema precisa gerar relatórios médicos e financeiros em formatos profissionais, com capacidade de exportação e impressão.

## Decision
Implementar geração de relatórios híbrida:
- **Template Engine**: HTML/CSS para layout e estilização
- **PDF Generation**: Puppeteer para conversão HTML→PDF
- **CSV Export**: Dados estruturados para análise
- **Print Support**: CSS print media queries

## Rationale
- **HTML/CSS**: Flexibilidade total de layout e estilização
- **Puppeteer**: Conversão fiel de HTML para PDF
- **CSV**: Compatibilidade com Excel e ferramentas de análise
- **Print**: Suporte nativo a impressão

## Consequences
### Positive
- Relatórios profissionais e customizáveis
- Múltiplos formatos de exportação
- Layout responsivo e acessível
- Fácil manutenção de templates

### Negative
- Dependência de Puppeteer (Chrome headless)
- Overhead de geração de PDF
- Necessidade de templates HTML complexos

## Implementation
- **Templates**: HTML/CSS com variáveis
- **PDF Engine**: Puppeteer com configurações otimizadas
- **CSV Export**: Streaming para grandes datasets
- **Caching**: Templates compilados em cache
- **Print Styles**: CSS otimizado para impressão
