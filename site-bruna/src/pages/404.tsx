import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Home, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function Custom404() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Estou com dificuldade para navegar no site da Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <Layout
      title="Página não encontrada - 404"
      description="A página que você está procurando não foi encontrada. Retorne à página inicial ou entre em contato conosco."
    >
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            {/* 404 Illustration */}
            <div className="mb-8">
              <div className="text-8xl font-bold text-primary mb-4">404</div>
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="font-heading font-bold text-3xl lg:text-4xl text-foreground mb-6">
              Página não encontrada
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              A página que você está procurando não existe ou foi movida. 
              Não se preocupe, vamos te ajudar a encontrar o que precisa.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/">
                <Button size="lg" className="flex items-center space-x-2">
                  <Home className="w-5 h-5" />
                  <span>Página Inicial</span>
                </Button>
              </Link>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleWhatsApp}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Falar no WhatsApp</span>
              </Button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="font-heading font-semibold text-xl mb-4">
                Páginas Populares
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link 
                  href="/tratamentos" 
                  className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Tratamentos</span>
                </Link>
                <Link 
                  href="/sobre" 
                  className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Sobre a Dra. Bruna</span>
                </Link>
                <Link 
                  href="/contato" 
                  className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Contato</span>
                </Link>
                <Link 
                  href="/casos" 
                  className="text-primary hover:text-primary/80 transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Casos Antes/Depois</span>
                </Link>
              </div>
            </div>

            {/* Help Text */}
            <div className="mt-8 text-sm text-muted-foreground">
              <p>
                Se você acredita que isso é um erro, entre em contato conosco pelo WhatsApp 
                ou e-mail: contato@drabrura.com.br
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

