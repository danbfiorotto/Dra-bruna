import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Sparkles, 
  Heart, 
  Award, 
  Zap, 
  MessageCircle,
  Clock,
  Shield,
  Star,
  CheckCircle
} from 'lucide-react';

export default function Tratamentos() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de saber mais sobre os tratamentos da Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const treatments = [
    {
      title: 'Tratamento de Canal',
      description: 'Procedimento especializado para remover a polpa infectada ou danificada, limpar e desinfetar o interior do dente, preservando sua estrutura natural.',
      icon: <Sparkles className="w-6 h-6" />,
      duration: '60-90 min',
      results: 'Permanente',
      benefits: [
        'Preserva o dente natural',
        'Alivia a dor imediatamente',
        'Previne infecções futuras',
        'Técnicas modernas e confortáveis'
      ],
      price: 'Consulte valores'
    },
    {
      title: 'Endodontia Microscópica',
      description: 'Utilização de microscópio operatório para visualização detalhada das estruturas internas do dente, garantindo tratamentos mais precisos e eficientes.',
      icon: <Heart className="w-6 h-6" />,
      duration: '90-120 min',
      results: 'Permanente',
      benefits: [
        'Maior precisão no tratamento',
        'Visualização detalhada',
        'Melhor taxa de sucesso',
        'Tecnologia de ponta'
      ],
      price: 'Consulte valores'
    },
    {
      title: 'Retratamento Endodôntico',
      description: 'Intervenção para casos onde o tratamento anterior não foi bem-sucedido ou quando surge uma nova infecção, devolvendo a saúde ao dente comprometido.',
      icon: <Zap className="w-6 h-6" />,
      duration: '90-150 min',
      results: 'Permanente',
      benefits: [
        'Salva dentes comprometidos',
        'Remove infecções persistentes',
        'Técnicas avançadas',
        'Alta taxa de sucesso'
      ],
      price: 'Consulte valores'
    },
    {
      title: 'Cirurgia Apical',
      description: 'Procedimento cirúrgico para remoção de infecções persistentes na raiz do dente quando o tratamento convencional não é suficiente.',
      icon: <Award className="w-6 h-6" />,
      duration: '60-90 min',
      results: 'Permanente',
      benefits: [
        'Remove infecções na raiz',
        'Preserva o dente',
        'Técnica cirúrgica precisa',
        'Recuperação rápida'
      ],
      price: 'Consulte valores'
    }
  ];

  const faqs = [
    {
      question: 'O tratamento de canal dói?',
      answer: 'Com técnicas modernas e anestesia adequada, o tratamento de canal não é mais doloroso do que uma restauração comum. Nossa prioridade é garantir seu conforto durante todo o procedimento.'
    },
    {
      question: 'Quanto tempo dura um tratamento de canal?',
      answer: 'A maioria dos tratamentos de canal pode ser concluída em uma ou duas consultas, dependendo da complexidade do caso. Cada consulta geralmente dura entre 60 e 90 minutos.'
    },
    {
      question: 'Qual é a alternativa ao tratamento de canal?',
      answer: 'A principal alternativa é a extração do dente. No entanto, remover um dente sem substituí-lo pode levar a problemas, como deslocamento dos dentes adjacentes e dificuldade na mastigação. Sempre recomendamos salvar o dente natural quando possível.'
    },
    {
      question: 'Quanto custa um tratamento de canal?',
      answer: 'O custo varia dependendo da complexidade do caso e do dente afetado. Fornecemos um plano de tratamento detalhado com estimativa de custos antes de iniciar qualquer procedimento. Trabalhamos com os principais convênios e oferecemos opções de pagamento.'
    }
  ];

  return (
    <Layout
      title="Tratamentos Endodônticos"
      description="Conheça nossos tratamentos endodônticos especializados: tratamento de canal, endodontia microscópica, retratamento e cirurgia apical. Resultados seguros e duradouros."
    >
      {/* Hero Section */}
      <section className="h-[500px] sm:h-[600px] bg-black/70 bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: 'url(/images/dentist-hero.jpg)'}}>
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-center h-full">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-center items-center text-center">
              {/* Logo da Dra. Bruna */}
              <div className="w-32 h-32 sm:w-auto sm:h-auto mb-6">
                <div className="w-32 h-32 bg-gold rounded-full flex items-center justify-center mx-auto">
                  <span className="text-black font-bold text-4xl">DB</span>
                </div>
              </div>
              
              {/* Título principal */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gold mb-2 sm:mb-3">
                Tratamentos Endodônticos
              </h1>
              
              {/* Subtítulo */}
              <p className="text-lg sm:text-xl text-white mb-2 sm:mb-3 font-serif">
                Especialista em Endodontia • Microscópio Operatório
              </p>
              
              {/* Descrição */}
              <p className="text-base sm:text-lg text-white mb-6 sm:mb-8 max-w-2xl">
                Oferecemos uma gama completa de tratamentos endodônticos com tecnologia de ponta, 
                incluindo microscópio operatório, sempre priorizando a preservação do dente natural, 
                segurança e seu bem-estar.
              </p>
              
              {/* Botões de Ação */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  size="lg"
                  onClick={handleWhatsApp}
                  className="bg-gold hover:bg-opacity-80 text-black py-4 sm:py-6 px-6 sm:px-8 rounded flex items-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Agendar Consulta</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => document.getElementById('tratamentos')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border border-gold text-gold hover:bg-gold/10 py-4 sm:py-6 px-6 sm:px-8 rounded flex items-center space-x-2"
                >
                  <span>Ver Tratamentos</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Treatments Grid */}
      <section id="tratamentos" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Tratamentos Especializados
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Oferecemos uma gama completa de tratamentos endodônticos com tecnologia 
              de ponta, incluindo microscópio operatório para resultados precisos e duradouros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {treatments.map((treatment, index) => (
              <Card key={index} className="bg-white rounded-lg shadow-lg p-5 sm:p-6 border-t-4 border-gold hover:shadow-xl transition-shadow flex flex-col h-full">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                    {treatment.icon}
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-black text-center">
                    {treatment.title}
                  </h3>
                  <p className="text-gray-700 mb-6 text-center">
                    {treatment.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gold" />
                      <div>
                        <div className="text-sm text-gray-600">Duração</div>
                        <div className="font-medium text-black">{treatment.duration}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-gold" />
                      <div>
                        <div className="text-sm text-gray-600">Resultados</div>
                        <div className="font-medium text-black">{treatment.results}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-black">Benefícios:</h4>
                    <div className="space-y-2">
                      {treatment.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-gold flex-shrink-0" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-auto text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleWhatsApp}
                      className="text-gold hover:text-black font-medium inline-flex items-center"
                    >
                      Saiba mais
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 bg-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Por que Escolher a Dra. Bruna?
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Nossa abordagem combina experiência, tecnologia de ponta e cuidado humanizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-black">Tecnologia</h3>
              <p className="text-gray-700">
                Utilizamos microscópio operatório e equipamentos de última geração, 
                com protocolos rigorosos de segurança e biossegurança.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-black">Especialização</h3>
              <p className="text-gray-700">
                Especialista em Endodontia pela Faculdade São Leopoldo Mandic 
                com mais de 10 anos de experiência em tratamentos endodônticos.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-4 text-black">Atendimento Humanizado</h3>
              <p className="text-gray-700">
                Cada tratamento é personalizado para suas necessidades específicas, 
                com foco no alívio da dor e preservação do dente natural.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Perguntas Frequentes
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Tire suas dúvidas sobre nossos tratamentos endodônticos.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 text-black">
                    {faq.question}
                  </h3>
                  <p className="text-gray-700">
                    {faq.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gold mb-6">
            Agende sua Consulta
          </h2>
          <p className="text-lg sm:text-xl text-white mb-8 max-w-2xl mx-auto">
            Não deixe que problemas dentários afetem sua qualidade de vida. 
            Entre em contato hoje mesmo e agende uma avaliação com a Dra. Bruna Torelli Soares.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleWhatsApp}
              className="inline-block bg-gold hover:bg-opacity-80 text-black py-4 sm:py-6 px-8 sm:px-10 text-base sm:text-lg rounded w-full sm:w-auto max-w-xs mx-auto flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Agendar Consulta</span>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

