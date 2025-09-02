import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { MessageCircle, FileText, Scale, AlertTriangle, CheckCircle } from 'lucide-react';

export default function TermosUso() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Tenho dúvidas sobre os termos de uso da Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <Layout
      title="Termos de Uso"
      description="Conheça os termos e condições de uso dos serviços da Dra. Bruna. Transparência e clareza em nossos serviços."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-6">
              Termos de{' '}
              <span className="text-primary">Uso</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Estes termos estabelecem as condições de uso dos nossos serviços. 
              Leia atentamente antes de utilizar nossos serviços.
            </p>
            <p className="text-sm text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4 flex items-center space-x-2">
                <Scale className="w-6 h-6 text-primary" />
                <span>1. Aceitação dos Termos</span>
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Ao acessar e utilizar os serviços da Dra. Bruna, você concorda em cumprir 
                  e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer 
                  parte destes termos, não deve utilizar nossos serviços.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4 flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-primary" />
                <span>2. Descrição dos Serviços</span>
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  A Dra. Bruna oferece os seguintes serviços:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Consultas médicas especializadas em dermatologia e estética</li>
                  <li>Tratamentos estéticos não invasivos e minimamente invasivos</li>
                  <li>Orientações sobre cuidados com a pele</li>
                  <li>Procedimentos de rejuvenescimento facial</li>
                  <li>Acompanhamento pós-tratamento</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-6 h-6 text-primary" />
                <span>3. Limitações e Responsabilidades</span>
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  É importante entender que:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Os resultados dos tratamentos podem variar de pessoa para pessoa</li>
                  <li>Não garantimos resultados específicos</li>
                  <li>É necessário seguir todas as orientações pós-tratamento</li>
                  <li>Alguns tratamentos podem ter contraindicações</li>
                  <li>É obrigatória a consulta prévia para avaliação individual</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                4. Agendamento e Cancelamentos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Para agendamentos e cancelamentos:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Agendamentos devem ser feitos com antecedência mínima de 24 horas</li>
                  <li>Cancelamentos devem ser comunicados com pelo menos 24 horas de antecedência</li>
                  <li>Faltas sem aviso prévio podem resultar em cobrança de taxa</li>
                  <li>Reagendamentos são permitidos conforme disponibilidade</li>
                  <li>Horários são respeitados rigorosamente</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                5. Pagamentos e Reembolsos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Sobre pagamentos:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Pagamentos podem ser feitos à vista ou parcelados</li>
                  <li>Aceitamos cartões de crédito, débito e PIX</li>
                  <li>Preços podem ser alterados sem aviso prévio</li>
                  <li>Reembolsos são avaliados caso a caso</li>
                  <li>Taxas de cancelamento podem ser aplicadas</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                6. Confidencialidade Médica
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Respeitamos rigorosamente o sigilo médico:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Todas as informações médicas são confidenciais</li>
                  <li>Dados são compartilhados apenas com seu consentimento</li>
                  <li>Prontuários são mantidos em segurança</li>
                  <li>Fotos são utilizadas apenas com autorização expressa</li>
                  <li>Equipe é treinada em confidencialidade</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                7. Contraindicações e Riscos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Alguns tratamentos podem ter contraindicações:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Gravidez e amamentação</li>
                  <li>Doenças autoimunes</li>
                  <li>Uso de medicamentos específicos</li>
                  <li>Histórico de alergias</li>
                  <li>Condições de pele específicas</li>
                </ul>
                <p>
                  É fundamental informar todas as condições de saúde durante a consulta.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                8. Propriedade Intelectual
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Todo o conteúdo do site e materiais são protegidos por direitos autorais:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Textos, imagens e vídeos são de nossa propriedade</li>
                  <li>Não é permitida reprodução sem autorização</li>
                  <li>Marca e logotipo são registrados</li>
                  <li>Materiais educativos são para uso pessoal</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                9. Modificações dos Termos
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                  As alterações entrarão em vigor imediatamente após a publicação no site. 
                  É sua responsabilidade revisar periodicamente estes termos.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                10. Lei Aplicável
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Estes termos são regidos pelas leis brasileiras. Qualquer disputa será 
                  resolvida nos tribunais competentes de São Paulo, SP.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                11. Contato
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Para dúvidas sobre estes termos, entre em contato:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>E-mail: contato@drabrura.com.br</li>
                  <li>Telefone: (11) 99999-9999</li>
                  <li>Endereço: Rua das Flores, 123 - São Paulo, SP</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-6">
            Dúvidas sobre os Termos?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Estamos aqui para esclarecer qualquer dúvida sobre nossos termos e condições.
          </p>
          
          <Button
            size="lg"
            variant="secondary"
            onClick={handleWhatsApp}
            className="flex items-center space-x-2 mx-auto"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Falar no WhatsApp</span>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

