import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  GraduationCap, 
  Award, 
  Heart, 
  Users, 
  MessageCircle,
  CheckCircle,
  Star
} from 'lucide-react';

export default function Sobre() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta com a Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const qualifications = [
    {
      title: 'Formação Odontológica',
      description: 'Graduação em Odontologia com especialização em Endodontia',
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      title: 'Especialização',
      description: 'Especialização em Endodontia pela Faculdade São Leopoldo Mandic',
      icon: <Award className="w-6 h-6" />
    },
    {
      title: 'Experiência',
      description: 'Mais de 10 anos de experiência em tratamentos endodônticos',
      icon: <Users className="w-6 h-6" />
    }
  ];

  const values = [
    'Humanização: cada paciente é único e merece um atendimento personalizado',
    'Excelência: atualização constante em cursos e congressos',
    'Segurança: protocolos rigorosos de higiene e biossegurança',
    'Empatia: entender as dores e ansiedades de cada pessoa',
    'Tecnologia: uso de microscópio operatório e técnicas modernas',
    'Compromisso: alívio da dor e qualidade de vida'
  ];

  const testimonials = [
    {
      name: 'Mariana Silva',
      text: 'Sempre tive medo de fazer tratamento de canal, mas a Dra. Bruna me deixou totalmente à vontade e o procedimento foi muito mais tranquilo do que imaginei. Profissional excepcional!',
      rating: 5
    },
    {
      name: 'Dr. Ricardo Mendes',
      text: 'Como dentista, sempre encaminho meus casos de endodontia para a Dra. Bruna. Sua competência técnica é impressionante e meus pacientes sempre voltam extremamente satisfeitos.',
      rating: 5
    }
  ];

  return (
    <Layout
      title="Sobre a Dra. Bruna Torelli Soares"
      description="Conheça a trajetória, formação e abordagem humanizada da Dra. Bruna Torelli Soares, especialista em endodontia."
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
                Sobre a Dra. Bruna Torelli Soares
              </h1>
              
              {/* Subtítulo */}
              <p className="text-lg sm:text-xl text-white mb-2 sm:mb-3 font-serif">
                Especialista em Endodontia • Formação São Leopoldo Mandic
              </p>
              
              {/* Descrição */}
              <p className="text-base sm:text-lg text-white mb-6 sm:mb-8 max-w-2xl">
                Conheça a trajetória, as conquistas e a missão da especialista que dedica a vida 
                a aliviar a dor e proporcionar qualidade de vida aos seus pacientes através de 
                tratamentos endodônticos de excelência.
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
                  onClick={() => document.getElementById('formacao')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border border-gold text-gold hover:bg-gold/10 py-4 sm:py-6 px-6 sm:px-8 rounded flex items-center space-x-2"
                >
                  <span>Ver Formação</span>
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
                Formação e Trajetória
              </h2>
              <p className="text-gray-700 mb-6">
                A Dra. Bruna Torelli Soares é graduada em Odontologia e encontrou, desde cedo, 
                sua paixão na área de Endodontia, especializando-se no tratamento de canal e em 
                procedimentos avançados de conservação dental. Com o compromisso de se manter na 
                vanguarda das técnicas e tecnologias, concluiu sua Especialização em Endodontia 
                na renomada Faculdade São Leopoldo Mandic.
              </p>
              <p className="text-gray-700 mb-6">
                Ao longo de sua formação, a Dra. Bruna participou de diversos congressos e simpósios, 
                tanto no Brasil quanto no exterior, buscando sempre o aprimoramento das técnicas mais 
                modernas e eficazes. Seu objetivo é oferecer aos pacientes um atendimento humanizado, 
                seguro e livre de dor, garantindo resultados previsíveis e duradouros.
              </p>
              <Button 
                variant="outline"
                onClick={() => document.getElementById('valores')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-block bg-transparent border border-gold text-black hover:bg-gold hover:text-black py-2 sm:py-3 px-4 sm:px-6 rounded transition-colors"
              >
                Conheça os Valores
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Missão e Valores Section */}
      <section id="valores" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Missão e Valores
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              A missão da Dra. Bruna é oferecer aos pacientes uma experiência acolhedora 
              e humanizada, unindo tecnologia de ponta, conhecimento científico e empatia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-white rounded-lg shadow-lg p-5 sm:p-6 border-t-4 border-gold hover:shadow-xl transition-shadow flex flex-col h-full">
                <CardContent className="p-0">
                  <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-black text-center">
                    {value.split(':')[0]}
                  </h3>
                  <p className="text-gray-700 mb-6 text-center">
                    {value.split(':')[1]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-gold/10 rounded-lg p-8 max-w-4xl mx-auto">
              <Heart className="w-16 h-16 text-gold mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-black mb-4">
                "Cuidar da dor é devolver a qualidade de vida"
              </h3>
              <p className="text-gray-700 text-lg">
                Esse é o lema que inspira a Dra. Bruna Torelli Soares em cada atendimento. 
                Seu objetivo é garantir que cada paciente saia do consultório livre de dores 
                e inseguranças, retomando suas atividades diárias com tranquilidade e confiança.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos Section */}
      <section className="py-16 sm:py-20 bg-light-gray">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Depoimentos
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              A satisfação e confiança dos nossos pacientes é nossa maior recompensa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white p-5 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-0">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4 sm:mb-6 text-sm sm:text-base">
                    "{testimonial.text}"
                  </p>
                  <div className="font-semibold text-black">
                    - {testimonial.name}
                  </div>
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

