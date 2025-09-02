import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  MessageCircle, 
  Calendar, 
  Clock, 
  User,
  ArrowRight,
  Tag,
  Search
} from 'lucide-react';

export default function Blog() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta com a Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  const articles = [
    {
      id: 1,
      title: 'Tudo sobre Botox: Mitos e Verdades',
      excerpt: 'Descubra os principais mitos e verdades sobre o tratamento com Botox, como funciona e quando é indicado.',
      content: 'O Botox é um dos tratamentos estéticos mais procurados, mas ainda gera muitas dúvidas. Neste artigo, esclarecemos os principais mitos e verdades sobre este procedimento...',
      author: 'Dra. Bruna',
      date: '2024-01-15',
      readTime: '5 min',
      category: 'Tratamentos',
      image: '/images/blog/botox-mitos.jpg',
      featured: true
    },
    {
      id: 2,
      title: 'Cuidados com a Pele no Verão',
      excerpt: 'Dicas essenciais para proteger sua pele durante o verão e manter a saúde cutânea.',
      content: 'O verão é uma época que exige cuidados especiais com a pele. Os raios solares mais intensos podem causar danos significativos se não tomarmos as precauções adequadas...',
      author: 'Dra. Bruna',
      date: '2024-01-10',
      readTime: '4 min',
      category: 'Cuidados',
      image: '/images/blog/pele-verao.jpg',
      featured: false
    },
    {
      id: 3,
      title: 'Preenchimento Facial: Guia Completo',
      excerpt: 'Tudo que você precisa saber sobre preenchimento facial com ácido hialurônico.',
      content: 'O preenchimento facial é uma das técnicas mais versáteis da estética moderna. Com ácido hialurônico, é possível restaurar volume, definir contornos e suavizar sulcos...',
      author: 'Dra. Bruna',
      date: '2024-01-05',
      readTime: '6 min',
      category: 'Tratamentos',
      image: '/images/blog/preenchimento.jpg',
      featured: false
    },
    {
      id: 4,
      title: 'Rotina de Skincare: Passo a Passo',
      excerpt: 'Como montar uma rotina de cuidados com a pele eficaz e personalizada.',
      content: 'Uma rotina de skincare bem estruturada é fundamental para manter a saúde e beleza da pele. Neste guia, mostramos como montar uma rotina personalizada...',
      author: 'Dra. Bruna',
      date: '2023-12-28',
      readTime: '7 min',
      category: 'Cuidados',
      image: '/images/blog/skincare.jpg',
      featured: false
    },
    {
      id: 5,
      title: 'Laser Facial: Tipos e Indicações',
      excerpt: 'Conheça os diferentes tipos de laser facial e suas principais indicações.',
      content: 'Os tratamentos a laser revolucionaram a estética facial. Existem diversos tipos de laser, cada um com indicações específicas para diferentes problemas...',
      author: 'Dra. Bruna',
      date: '2023-12-20',
      readTime: '5 min',
      category: 'Tratamentos',
      image: '/images/blog/laser.jpg',
      featured: false
    },
    {
      id: 6,
      title: 'Alimentação e Beleza da Pele',
      excerpt: 'Como a alimentação influencia na saúde e beleza da sua pele.',
      content: 'Você sabia que a alimentação tem um impacto direto na saúde da sua pele? Certos nutrientes são essenciais para manter a pele saudável e radiante...',
      author: 'Dra. Bruna',
      date: '2023-12-15',
      readTime: '4 min',
      category: 'Saúde',
      image: '/images/blog/alimentacao.jpg',
      featured: false
    }
  ];

  const categories = ['Todos', 'Tratamentos', 'Cuidados', 'Saúde'];
  const featuredArticle = articles.find(article => article.featured);

  return (
    <Layout
      title="Blog - Artigos sobre Estética e Beleza"
      description="Acompanhe artigos e dicas sobre tratamentos estéticos, cuidados com a pele e saúde. Conteúdo educativo da Dra. Bruna."
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-center mb-6 text-black">
              Blog e{' '}
              <span className="text-gold">Artigos</span>
            </h1>
            <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Acompanhe artigos educativos sobre tratamentos endodônticos, cuidados com a saúde bucal 
              e dicas de saúde. Conteúdo atualizado e baseado em evidências científicas.
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

      {/* Featured Article */}
      {featuredArticle && (
        <section className="py-16 sm:py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-center mb-3 sm:mb-4 text-black">
                Artigo em Destaque
              </h2>
              <div className="w-16 sm:w-20 h-1 bg-gold mx-auto mb-8 sm:mb-12"></div>
            </div>
            
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="bg-gray-100 h-64 lg:h-auto flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gold/20 rounded-lg mx-auto mb-4"></div>
                    <div className="text-sm text-gray-600">Imagem do artigo</div>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <div className="flex items-center space-x-2 mb-4">
                    <Tag className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium text-gold">
                      {featuredArticle.category}
                    </span>
                  </div>
                  
                  <h3 className="font-serif font-bold text-2xl mb-4 text-black">
                    {featuredArticle.title}
                  </h3>
                  
                  <p className="text-gray-700 mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{featuredArticle.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(featuredArticle.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{featuredArticle.readTime}</span>
                    </div>
                  </div>
                  
                  <Button className="flex items-center space-x-2 bg-gold text-black hover:bg-gold/90">
                    <span>Ler Artigo Completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Categories Filter */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === 'Todos' ? 'default' : 'outline'}
                size="sm"
                className={`flex items-center space-x-2 ${
                  category === 'Todos' 
                    ? 'bg-gold text-black hover:bg-gold/90' 
                    : 'border-gold text-gold hover:bg-gold hover:text-black'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>{category}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.filter(article => !article.featured).map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
                <div className="bg-gray-100 h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gold/20 rounded-lg mx-auto mb-2"></div>
                    <div className="text-xs text-gray-600">Imagem do artigo</div>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Tag className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium text-gold">
                      {article.category}
                    </span>
                  </div>
                  
                  <h3 className="font-serif font-semibold text-lg mb-3 line-clamp-2 text-black">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(article.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full border-gold text-gold hover:bg-gold hover:text-black">
                    Ler Mais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 sm:py-20 bg-black text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-6">
            Receba Nossos Artigos
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Cadastre-se para receber nossos artigos e dicas sobre endodontia e cuidados com a saúde bucal.
          </p>
          
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Seu melhor e-mail"
              className="flex-1 px-4 py-3 rounded-lg text-black border-0 focus:ring-2 focus:ring-gold/20"
            />
            <Button
              size="lg"
              variant="secondary"
              className="px-8 bg-gold text-black hover:bg-gold/90"
            >
              Cadastrar
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}

