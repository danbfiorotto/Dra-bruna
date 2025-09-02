import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  MessageCircle, 
  Eye, 
  Sparkles,
  Heart,
  Award,
  Zap
} from 'lucide-react';

export default function Casos() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta com a Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const cases = [
    {
      id: 1,
      title: 'Tratamento de Rugas de Expressão',
      treatment: 'Botox',
      description: 'Suavização de linhas de expressão na testa e ao redor dos olhos.',
      beforeImage: '/images/casos/botox-antes.jpg',
      afterImage: '/images/casos/botox-depois.jpg',
      duration: '3 meses',
      patientAge: '35 anos'
    },
    {
      id: 2,
      title: 'Preenchimento Labial',
      treatment: 'Ácido Hialurônico',
      description: 'Restauração de volume e definição dos lábios.',
      beforeImage: '/images/casos/labios-antes.jpg',
      afterImage: '/images/casos/labios-depois.jpg',
      duration: '6 meses',
      patientAge: '28 anos'
    },
    {
      id: 3,
      title: 'Rejuvenescimento Facial',
      treatment: 'Laser + Preenchimento',
      description: 'Tratamento combinado para rejuvenescimento facial completo.',
      beforeImage: '/images/casos/rejuvenescimento-antes.jpg',
      afterImage: '/images/casos/rejuvenescimento-depois.jpg',
      duration: '12 meses',
      patientAge: '42 anos'
    },
    {
      id: 4,
      title: 'Correção de Manchas',
      treatment: 'Laser',
      description: 'Remoção de manchas solares e melasma.',
      beforeImage: '/images/casos/manchas-antes.jpg',
      afterImage: '/images/casos/manchas-depois.jpg',
      duration: '8 meses',
      patientAge: '38 anos'
    },
    {
      id: 5,
      title: 'Preenchimento de Sulcos',
      treatment: 'Ácido Hialurônico',
      description: 'Preenchimento de sulcos nasogenianos e marionetes.',
      beforeImage: '/images/casos/sulcos-antes.jpg',
      afterImage: '/images/casos/sulcos-depois.jpg',
      duration: '10 meses',
      patientAge: '45 anos'
    },
    {
      id: 6,
      title: 'Limpeza de Pele',
      treatment: 'Limpeza Profunda',
      description: 'Tratamento para acne e melhora da textura da pele.',
      beforeImage: '/images/casos/limpeza-antes.jpg',
      afterImage: '/images/casos/limpeza-depois.jpg',
      duration: 'Imediato',
      patientAge: '22 anos'
    }
  ];

  const treatmentIcons = {
    'Botox': <Sparkles className="w-5 h-5" />,
    'Ácido Hialurônico': <Heart className="w-5 h-5" />,
    'Laser': <Zap className="w-5 h-5" />,
    'Laser + Preenchimento': <Award className="w-5 h-5" />,
    'Limpeza Profunda': <Eye className="w-5 h-5" />
  };

  return (
    <Layout
      title="Casos Antes e Depois"
      description="Veja os resultados reais dos tratamentos estéticos da Dra. Bruna. Casos de Botox, preenchimento, laser e muito mais."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-center mb-6 text-black">
              Casos{' '}
              <span className="text-gold">Antes e Depois</span>
            </h1>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Veja os resultados reais dos nossos tratamentos endodônticos. Cada caso é único e 
              personalizado para atender às necessidades específicas de cada paciente.
            </p>
            <Button
              size="lg"
              onClick={handleWhatsApp}
              className="flex items-center space-x-2 mx-auto bg-gold text-black hover:bg-gold/90"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Agendar Consulta</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Cases Grid */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((caseItem) => (
              <Card key={caseItem.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
                <div className="relative">
                  {/* Before/After Images */}
                  <div className="grid grid-cols-2 h-64">
                    <div className="relative bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-red-600 font-bold text-sm">ANTES</span>
                        </div>
                        <div className="w-24 h-24 bg-gray-200 rounded-lg mx-auto"></div>
                      </div>
                    </div>
                    <div className="relative bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-green-600 font-bold text-sm">DEPOIS</span>
                        </div>
                        <div className="w-24 h-24 bg-gold/20 rounded-lg mx-auto"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    {treatmentIcons[caseItem.treatment as keyof typeof treatmentIcons]}
                    <span className="text-sm font-medium text-gold">
                      {caseItem.treatment}
                    </span>
                  </div>

                  <h3 className="font-serif font-semibold text-lg mb-2 text-black">
                    {caseItem.title}
                  </h3>
                  
                  <p className="text-gray-700 text-sm mb-4">
                    {caseItem.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Duração</div>
                      <div className="font-medium text-black">{caseItem.duration}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Idade</div>
                      <div className="font-medium text-black">{caseItem.patientAge}</div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4 border-gold text-gold hover:bg-gold hover:text-black"
                    onClick={handleWhatsApp}
                  >
                    Quero Resultados Similares
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-50 rounded-lg p-8 shadow-sm">
              <h3 className="font-serif font-semibold text-xl mb-4 text-black">
                Importante Saber
              </h3>
              <div className="text-gray-700 space-y-3 text-sm">
                <p>
                  <strong>Resultados individuais podem variar:</strong> Cada pessoa responde 
                  de forma diferente aos tratamentos endodônticos. Os resultados mostrados 
                  são de casos reais, mas não garantem resultados idênticos.
                </p>
                <p>
                  <strong>Consulta obrigatória:</strong> Todos os tratamentos requerem 
                  uma consulta prévia para avaliação individual e planejamento personalizado.
                </p>
                <p>
                  <strong>Fotos autorizadas:</strong> Todas as imagens foram autorizadas 
                  pelos pacientes e respeitam nossa política de privacidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6">
            Quer Resultados Similares?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Agende sua consulta de avaliação e descubra qual tratamento 
            é ideal para você alcançar seus objetivos.
          </p>
          
          <Button
            size="lg"
            variant="secondary"
            onClick={handleWhatsApp}
            className="flex items-center space-x-2 mx-auto bg-gold text-black hover:bg-gold/90"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Agendar Consulta</span>
          </Button>
        </div>
      </section>
    </Layout>
  );
}

