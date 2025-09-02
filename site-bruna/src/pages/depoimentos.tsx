import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  MessageCircle, 
  Star, 
  Quote,
  Play,
  Heart,
  Award,
  Users
} from 'lucide-react';

export default function Depoimentos() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta com a Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const testimonials = [
    {
      id: 1,
      name: 'Mariana Silva',
      age: 35,
      treatment: 'Tratamento de Canal',
      rating: 5,
      text: 'Sempre tive medo de fazer tratamento de canal, mas a Dra. Bruna me deixou totalmente à vontade e o procedimento foi muito mais tranquilo do que imaginei. Profissional excepcional!',
      location: 'São Paulo, SP',
      duration: '6 meses atrás'
    },
    {
      id: 2,
      name: 'Dr. Ricardo Mendes',
      age: 42,
      treatment: 'Encaminhamento de Pacientes',
      rating: 5,
      text: 'Como dentista, sempre encaminho meus casos de endodontia para a Dra. Bruna. Sua competência técnica é impressionante e meus pacientes sempre voltam extremamente satisfeitos.',
      location: 'São Paulo, SP',
      duration: '3 meses atrás'
    },
    {
      id: 3,
      name: 'Paulo Oliveira',
      age: 28,
      treatment: 'Tratamento de Canal de Urgência',
      rating: 5,
      text: 'Estava com muita dor e consegui um atendimento rápido e eficiente. A Dra. Bruna é extremamente cuidadosa e dedicada. Resolveu meu problema sem nenhuma dor durante o procedimento.',
      location: 'São Paulo, SP',
      duration: '4 meses atrás'
    },
    {
      id: 4,
      name: 'Renata S.',
      age: 38,
      treatment: 'Tratamento de Canal',
      rating: 5,
      text: 'Sempre tive pânico de fazer tratamento de canal, mas a Dra. Bruna foi incrível! Explicou tudo com paciência, o procedimento foi muito mais tranquilo do que imaginei e não senti dor alguma.',
      location: 'São Paulo, SP',
      duration: '2 meses atrás'
    },
    {
      id: 5,
      name: 'Carlos M.',
      age: 45,
      treatment: 'Retratamento Endodôntico',
      rating: 5,
      text: 'Fui encaminhado pelo meu dentista para um retratamento de canal complexo. A Dra. Bruna usou um microscópio durante todo o procedimento e conseguiu resolver um problema que achei que me faria perder o dente.',
      location: 'São Paulo, SP',
      duration: '8 meses atrás'
    },
    {
      id: 6,
      name: 'Fernanda L.',
      age: 32,
      treatment: 'Tratamento de Canal de Urgência',
      rating: 5,
      text: 'Estava com muita dor e consegui um atendimento de urgência com a Dra. Bruna. Já no mesmo dia ela iniciou meu tratamento de canal e a dor passou completamente. Ambiente confortável e equipe muito atenciosa.',
      location: 'São Paulo, SP',
      duration: '5 meses atrás'
    }
  ];

  const videoTestimonials = [
    {
      id: 1,
      name: 'Marina Alves',
      treatment: 'Tratamento de Canal',
      thumbnail: '/images/depoimentos/video-1-thumb.jpg',
      duration: '2:30'
    },
    {
      id: 2,
      name: 'Beatriz Lima',
      treatment: 'Endodontia Microscópica',
      thumbnail: '/images/depoimentos/video-2-thumb.jpg',
      duration: '1:45'
    }
  ];

  const stats = [
    { label: 'Pacientes Atendidos', value: '500+', icon: <Users className="w-6 h-6" /> },
    { label: 'Avaliação Média', value: '4.9/5', icon: <Star className="w-6 h-6" /> },
    { label: 'Anos de Experiência', value: '10+', icon: <Award className="w-6 h-6" /> },
    { label: 'Pacientes Satisfeitos', value: '98%', icon: <Heart className="w-6 h-6" /> }
  ];

  return (
    <Layout
      title="Depoimentos de Pacientes"
      description="Veja o que nossos pacientes dizem sobre os tratamentos endodônticos da Dra. Bruna Torelli Soares. Depoimentos reais de quem confiou em nosso trabalho."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-center mb-6 text-black">
              Depoimentos de{' '}
              <span className="text-gold">Nossos Pacientes</span>
            </h1>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              A satisfação e confiança dos nossos pacientes é nossa maior recompensa. 
              Veja o que eles dizem sobre nossa abordagem e resultados em tratamentos endodônticos.
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

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
                  {stat.icon}
                </div>
                <div className="font-serif font-bold text-3xl text-black mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-700 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Testimonials */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Depoimentos em Vídeo
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Veja nossos pacientes contando suas experiências em primeira pessoa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {videoTestimonials.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
                <div className="relative">
                  <div className="aspect-video bg-gray-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-gold ml-1" />
                      </div>
                      <div className="text-sm text-gray-600">
                        {video.duration}
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-serif font-semibold text-lg mb-2 text-black">
                    {video.name}
                  </h3>
                  <p className="text-gray-700 text-sm mb-4">
                    Tratamento: {video.treatment}
                  </p>
                  <Button variant="outline" size="sm" className="w-full border-gold text-gold hover:bg-gold hover:text-black">
                    Assistir Depoimento
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Written Testimonials */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Depoimentos Escritos
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Leia as experiências detalhadas dos nossos pacientes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-gold fill-current" />
                    ))}
                  </div>

                  <div className="mb-4">
                    <Quote className="w-8 h-8 text-gold/30 mb-3" />
                    <p className="text-gray-700 italic">
                      "{testimonial.text}"
                    </p>
                  </div>

                  <div className="border-t pt-4">
                    <div className="font-semibold text-black">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.age} anos • {testimonial.location}
                    </div>
                    <div className="text-sm text-gold font-medium">
                      {testimonial.treatment}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {testimonial.duration}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6">
            Quer Fazer Parte Desta História?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Agende sua consulta e descubra como podemos ajudar você a resolver 
            seus problemas dentários, assim como nossos outros pacientes.
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

