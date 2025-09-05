import Layout from '../components/Layout';
import ContactForm from '../components/ContactForm';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock
} from 'lucide-react';

export default function Contato() {

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta com a Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'Telefone',
      content: '(11) 99999-9999',
      action: () => window.open('tel:+5511999999999'),
      description: 'Segunda a Sexta, 9h às 18h'
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'WhatsApp',
      content: 'Clique para conversar',
      action: handleWhatsApp,
      description: 'Resposta rápida via WhatsApp'
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'E-mail',
      content: 'contato@brunatsoares.com.br',
      action: () => window.open('mailto:contato@brunatsoares.com.br'),
      description: 'Respondemos em até 24h'
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: 'Endereço',
      content: 'Av. Paulista, 1000, Conjunto 101',
      action: () => window.open('https://maps.google.com/?q=Av.+Paulista,+1000,+São+Paulo,+SP'),
      description: 'São Paulo - SP, 01310-100'
    }
  ];



  return (
    <Layout
      title="Contato - Agende sua Consulta"
      description="Entre em contato com a Dra. Bruna Torelli Soares para agendar sua consulta de endodontia. WhatsApp, telefone, e-mail ou visite nossa clínica em São Paulo."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-center mb-6 text-black">
              Entre em{' '}
              <span className="text-gold">Contato</span>
            </h1>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Estamos aqui para ajudar você a resolver seus problemas dentários com tratamentos 
              endodônticos especializados. Entre em contato conosco e agende sua consulta.
            </p>
            <Button
              size="lg"
              onClick={handleWhatsApp}
              className="flex items-center space-x-2 mx-auto bg-gold text-black hover:bg-gold/90"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Falar no WhatsApp</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 cursor-pointer bg-white" onClick={info.action}>
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4 text-gold">
                    {info.icon}
                  </div>
                  <h3 className="font-serif font-semibold text-lg mb-2 text-black">
                    {info.title}
                  </h3>
                  <p className="text-black font-medium mb-2">
                    {info.content}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {info.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form and Map */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <ContactForm />
            </div>

            {/* Map and Hours */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
                Nossa Localização
              </h2>
              <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
              
              {/* Map Placeholder */}
              <div className="bg-gray-100 rounded-lg h-64 mb-6 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gold mx-auto mb-2" />
                  <p className="text-gray-700">Mapa interativo</p>
                  <p className="text-sm text-gray-600">Av. Paulista, 1000, Conjunto 101 - São Paulo, SP</p>
                </div>
              </div>

              {/* Hours */}
              <Card className="bg-white">
                <CardContent className="p-6">
                  <h3 className="font-serif font-semibold text-xl mb-4 flex items-center space-x-2 text-black">
                    <Clock className="w-5 h-5 text-gold" />
                    <span>Horário de Funcionamento</span>
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-black">Segunda a Sexta</span>
                      <span className="font-medium text-gray-700">08:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Sábado</span>
                      <span className="font-medium text-gray-700">08:00 - 12:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Domingo</span>
                      <span className="text-gray-600">Fechado</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-sm text-gray-700 mb-4">
                      Para agendamentos fora do horário comercial, entre em contato via WhatsApp.
                    </p>
                    <Button
                      onClick={handleWhatsApp}
                      className="w-full flex items-center justify-center space-x-2 bg-gold text-black hover:bg-gold/90"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
