import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  MessageCircle, 
  Clock, 
  Shield, 
  Star, 
  CheckCircle,
  AlertCircle,
  Heart,
  Award
} from 'lucide-react';

export default function TratamentoCanal() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta para tratamento de canal com a Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const symptoms = [
    'Dor intensa ao mastigar ou aplicar pressão',
    'Sensibilidade prolongada ao calor ou frio',
    'Escurecimento ou descoloração do dente',
    'Inchaço e sensibilidade nas gengivas próximas',
    'Presença de fístula (pequena elevação tipo "espinha" na gengiva)',
    'Cárie profunda ou grande restauração que atingiu a polpa'
  ];

  const procedureSteps = [
    {
      step: '1',
      title: 'Exame e radiografia',
      description: 'Avaliamos o dente e realizamos radiografias para determinar a extensão do dano e planejar o tratamento adequado.'
    },
    {
      step: '2',
      title: 'Anestesia',
      description: 'Aplicamos anestesia local para garantir que o procedimento seja indolor e confortável.'
    },
    {
      step: '3',
      title: 'Isolamento do dente',
      description: 'Utilizamos um isolamento com lençol de borracha para manter o dente limpo e livre de saliva durante o procedimento.'
    },
    {
      step: '4',
      title: 'Acesso à câmara pulpar',
      description: 'Realizamos uma pequena abertura na coroa do dente para acessar a câmara pulpar.'
    },
    {
      step: '5',
      title: 'Remoção da polpa',
      description: 'Removemos cuidadosamente a polpa infectada ou danificada.'
    },
    {
      step: '6',
      title: 'Limpeza e modelagem',
      description: 'Com instrumentos especiais, limpamos, modelamos e desinfetamos os canais radiculares.'
    },
    {
      step: '7',
      title: 'Preenchimento',
      description: 'Preenchemos os canais com material biocompatível (guta-percha) para selar o espaço e prevenir futuras infecções.'
    },
    {
      step: '8',
      title: 'Restauração',
      description: 'Realizamos uma restauração provisória ou definitiva para proteger o dente e devolver sua função.'
    }
  ];

  const advantages = [
    'Especialista em Endodontia com formação avançada',
    'Uso de microscópio operatório para maior precisão',
    'Técnicas modernas que proporcionam mais conforto',
    'Atendimento humanizado e personalizado',
    'Consultório equipado com tecnologia de ponta'
  ];

  const testimonials = [
    {
      name: 'Renata S.',
      text: 'Sempre tive pânico de fazer tratamento de canal, mas a Dra. Bruna foi incrível! Explicou tudo com paciência, o procedimento foi muito mais tranquilo do que imaginei e não senti dor alguma.',
      rating: 5
    },
    {
      name: 'Carlos M.',
      text: 'Fui encaminhado pelo meu dentista para um retratamento de canal complexo. A Dra. Bruna usou um microscópio durante todo o procedimento e conseguiu resolver um problema que achei que me faria perder o dente.',
      rating: 5
    },
    {
      name: 'Fernanda L.',
      text: 'Estava com muita dor e consegui um atendimento de urgência com a Dra. Bruna. Já no mesmo dia ela iniciou meu tratamento de canal e a dor passou completamente. Ambiente confortável e equipe muito atenciosa.',
      rating: 5
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
      title="Tratamento de Canal - Dra. Bruna Torelli Soares"
      description="Tratamento de canal especializado com microscópio operatório. Preserve seu dente natural com a Dra. Bruna Torelli Soares, especialista em endodontia."
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
                Tratamento de Canal
              </h1>
              
              {/* Subtítulo */}
              <p className="text-lg sm:text-xl text-white mb-2 sm:mb-3 font-serif">
                Especialista em Endodontia • Microscópio Operatório
              </p>
              
              {/* Descrição */}
              <p className="text-base sm:text-lg text-white mb-6 sm:mb-8 max-w-2xl">
                Procedimento especializado para preservar seu dente e aliviar a dor causada 
                por infecções ou danos à polpa dental. Com microscópio operatório e técnicas modernas.
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
                  onClick={() => document.getElementById('procedimento')?.scrollIntoView({ behavior: 'smooth' })}
                  className="border border-gold text-gold hover:bg-gold/10 py-4 sm:py-6 px-6 sm:px-8 rounded flex items-center space-x-2"
                >
                  <span>Como Funciona</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Root Canal */}
      <section className="bg-light-gray py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12">
            <div className="w-full md:w-1/2">
              <img 
                src="/images/tratamento-canal.jpg" 
                alt="Tratamento de Canal" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div className="w-full md:w-1/2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-black mb-4 sm:mb-6 border-l-4 border-gold pl-4">
                O que é Tratamento de Canal?
              </h2>
              <p className="text-gray-700 mb-6">
                O tratamento de canal, também conhecido como tratamento endodôntico, é um procedimento 
                realizado para salvar um dente severamente danificado ou infectado. Durante o procedimento, 
                a polpa dentária (tecido vivo dentro do dente) é removida, a área interna é limpa, 
                desinfetada, modelada e finalmente selada.
              </p>
              <p className="text-gray-700 mb-6">
                Na clínica da Dra. Bruna Torelli Soares, utilizamos tecnologia de ponta e técnicas modernas 
                para garantir que o procedimento seja realizado com o máximo de precisão e conforto para o paciente.
              </p>
              <div className="bg-gold/10 rounded-lg p-6">
                <div className="text-center">
                  <Heart className="w-12 h-12 text-gold mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-black mb-2">
                    Preserve seu Dente Natural
                  </h3>
                  <p className="text-gray-700 text-sm">
                    O tratamento de canal permite salvar dentes que de outra forma precisariam ser extraídos, 
                    mantendo sua função mastigatória e estética natural.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When is it Necessary */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Quando é Necessário o Tratamento de Canal?
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              O tratamento de canal pode ser necessário nos seguintes casos:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {symptoms.map((symptom, index) => (
              <div key={index} className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-black">{symptom}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Procedure Steps */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Como é Realizado o Procedimento?
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              O tratamento de canal geralmente envolve as seguintes etapas:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {procedureSteps.map((step, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mx-auto mb-4 text-black font-bold text-lg">
                    {step.step}
                  </div>
                  <h3 className="font-serif font-semibold text-lg mb-3 text-black">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Post Treatment */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Pós-Tratamento
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Após o tratamento de canal, é normal sentir um leve desconforto por alguns dias, 
              que pode ser controlado com medicação analgésica conforme orientação profissional. 
              É fundamental seguir todas as instruções de cuidados pós-operatórios fornecidas pela Dra. Bruna.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Um dente tratado e restaurado adequadamente pode durar toda a vida com os cuidados apropriados. 
              Continue praticando boa higiene oral, escovando duas vezes ao dia, usando fio dental e 
              realizando consultas regulares.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Dr. Bruna */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Por que Escolher a Dra. Bruna para seu Tratamento de Canal?
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-black">{advantage}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              O que Nossos Pacientes Dizem
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4 italic">
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

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
              Perguntas Frequentes
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6">
                  <h3 className="font-serif font-semibold text-lg mb-3 text-black">
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
      <section className="py-16 sm:py-20 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6">
            Agende seu Tratamento
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Não deixe que a dor dental afete sua qualidade de vida. Entre em contato hoje mesmo 
            para agendar sua consulta com a Dra. Bruna Torelli Soares.
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
