import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Star, 
  Users, 
  Award, 
  MessageCircle, 
  Phone, 
  ArrowRight,
  CheckCircle,
  Heart,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta com a Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const treatments = [
    {
      title: 'Tratamento de Canal',
      description: 'Procedimento especializado para remover a polpa infectada ou danificada, limpar e desinfetar o interior do dente, preservando sua estrutura natural.',
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: 'Endodontia Microscópica',
      description: 'Utilização de microscópio operatório para visualização detalhada das estruturas internas do dente, garantindo tratamentos mais precisos e eficientes.',
      icon: <Heart className="w-6 h-6" />
    },
    {
      title: 'Retratamento Endodôntico',
      description: 'Intervenção para casos onde o tratamento anterior não foi bem-sucedido ou quando surge uma nova infecção, devolvendo a saúde ao dente comprometido.',
      icon: <Award className="w-6 h-6" />
    }
  ];

  const benefits = [
    'Microscópio operatório',
    'Técnicas modernas',
    'Ambiente acolhedor',
    'Atendimento humanizado',
    'Especialista em endodontia',
    'Alívio da dor garantido'
  ];

  return (
    <Layout
      title="Dra. Bruna Torelli Soares - Especialista em Endodontia"
      description="Dra. Bruna Torelli Soares é especialista em endodontia, oferecendo tratamentos de canal com tecnologia de ponta e abordagem humanizada. Agende sua consulta."
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
                Dra. Bruna Torelli Soares
              </h1>
              
              {/* Subtítulo */}
              <p className="text-lg sm:text-xl text-white mb-2 sm:mb-3 font-serif">
                Cirurgiã Dentista • Especialista em Endodontia
              </p>
              
              {/* Descrição */}
              <p className="text-base sm:text-lg text-white mb-6 sm:mb-8 max-w-2xl">
                Tratamentos de canal com excelência, tecnologia de ponta e compromisso 
                com o seu bem-estar. Especialista em endodontia com microscópio operatório 
                para resultados precisos e confortáveis.
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
                  <span>Conhecer Tratamentos</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-light-gray py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12">
            <div className="w-full md:w-1/2">
              <img 
                src="/images/dra-bruna.jpg" 
                alt="Dra. Bruna Torelli Soares" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black mb-4 sm:mb-6 border-l-4 border-gold pl-4">
                Sobre a Dra. Bruna
              </h2>
              <p className="text-gray-700 mb-6">
                Com uma sólida formação acadêmica e ampla experiência clínica, 
                a Dra. Bruna Torelli Soares é especialista em endodontia, dedicando-se 
                ao diagnóstico e tratamento de problemas relacionados à polpa dental 
                e à região periapical. Seu trabalho é reconhecido pela precisão, uso 
                de tecnologias avançadas e pelo compromisso em proporcionar um 
                atendimento humanizado e de excelência aos seus pacientes.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/sobre'}
                className="inline-block bg-transparent border border-gold text-black hover:bg-gold hover:text-black py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors"
              >
                Conheça Mais
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
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
                  <div className="mt-auto text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-gold hover:text-black font-medium inline-flex items-center"
                    >
                      Saiba mais
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              size="lg"
              onClick={() => window.location.href = '/tratamentos'}
              className="flex items-center space-x-2 mx-auto bg-gold hover:bg-opacity-80 text-black"
            >
              <span>Ver Todos os Tratamentos</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
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