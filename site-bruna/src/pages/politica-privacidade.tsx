import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { MessageCircle, Shield, Eye, Lock, UserCheck } from 'lucide-react';

export default function PoliticaPrivacidade() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Tenho dúvidas sobre a política de privacidade da Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <Layout
      title="Política de Privacidade"
      description="Conheça nossa política de privacidade e como protegemos seus dados pessoais. Transparência e segurança em primeiro lugar."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-4xl lg:text-5xl text-foreground mb-6">
              Política de{' '}
              <span className="text-primary">Privacidade</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Sua privacidade é fundamental para nós. Esta política explica como coletamos, 
              usamos e protegemos suas informações pessoais.
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
                <Eye className="w-6 h-6 text-primary" />
                <span>1. Informações que Coletamos</span>
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Coletamos informações que você nos fornece diretamente, incluindo:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Nome completo e dados de contato (e-mail, telefone)</li>
                  <li>Informações médicas e de saúde relevantes para o tratamento</li>
                  <li>Histórico de consultas e tratamentos realizados</li>
                  <li>Fotos antes e depois dos tratamentos (com sua autorização)</li>
                  <li>Informações de pagamento (processadas de forma segura)</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4 flex items-center space-x-2">
                <Lock className="w-6 h-6 text-primary" />
                <span>2. Como Usamos suas Informações</span>
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>Utilizamos suas informações para:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Agendar e realizar consultas médicas</li>
                  <li>Fornecer tratamentos estéticos personalizados</li>
                  <li>Manter prontuário médico atualizado</li>
                  <li>Enviar lembretes de consultas e cuidados pós-tratamento</li>
                  <li>Processar pagamentos e emitir recibos</li>
                  <li>Melhorar nossos serviços e atendimento</li>
                  <li>Cumprir obrigações legais e regulamentares</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4 flex items-center space-x-2">
                <Shield className="w-6 h-6 text-primary" />
                <span>3. Proteção dos Dados</span>
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Criptografia de dados sensíveis</li>
                  <li>Acesso restrito apenas a profissionais autorizados</li>
                  <li>Backup seguro e regular dos dados</li>
                  <li>Treinamento da equipe em proteção de dados</li>
                  <li>Auditoria regular dos sistemas de segurança</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4 flex items-center space-x-2">
                <UserCheck className="w-6 h-6 text-primary" />
                <span>4. Seus Direitos</span>
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>De acordo com a LGPD, você tem direito a:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Confirmar a existência de tratamento de seus dados</li>
                  <li>Acessar seus dados pessoais</li>
                  <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li>Solicitar anonimização, bloqueio ou eliminação de dados</li>
                  <li>Solicitar portabilidade dos dados</li>
                  <li>Revogar o consentimento a qualquer momento</li>
                  <li>Ser informado sobre o compartilhamento de dados</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                5. Compartilhamento de Informações
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                  exceto nas seguintes situações:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Com seu consentimento explícito</li>
                  <li>Para cumprir obrigações legais</li>
                  <li>Com prestadores de serviços que nos auxiliam (sempre com contratos de confidencialidade)</li>
                  <li>Em caso de emergência médica</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                6. Retenção de Dados
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Mantemos suas informações pelo tempo necessário para cumprir as finalidades 
                  descritas nesta política, respeitando os prazos legais:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prontuários médicos: 20 anos (conforme CFM)</li>
                  <li>Dados de contato: até solicitação de exclusão</li>
                  <li>Informações de pagamento: conforme legislação fiscal</li>
                  <li>Fotos de tratamento: até solicitação de exclusão</li>
                </ul>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                7. Cookies e Tecnologias Similares
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Nosso site pode usar cookies para melhorar sua experiência de navegação. 
                  Você pode configurar seu navegador para recusar cookies, mas isso pode 
                  afetar algumas funcionalidades do site.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                8. Alterações nesta Política
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Podemos atualizar esta política periodicamente. Notificaremos sobre 
                  mudanças significativas através do nosso site ou por e-mail.
                </p>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="font-heading font-bold text-2xl text-foreground mb-4">
                9. Contato
              </h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                  entre em contato conosco:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>E-mail: privacidade@drabrura.com.br</li>
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
            Dúvidas sobre Privacidade?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Estamos aqui para esclarecer qualquer dúvida sobre como protegemos seus dados.
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

