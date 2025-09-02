import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, MessageCircle, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const handleWhatsApp = () => {
    const message = encodeURIComponent('Olá! Gostaria de agendar uma consulta com a Dra. Bruna.');
    window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');
  };

  return (
    <footer className="bg-black text-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">DB</span>
              </div>
              <span className="text-gold text-xl font-serif font-semibold">
                Dra. Bruna Torelli Soares
              </span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Especialista em endodontia com vasta experiência em tratamentos de canal 
              e endodontia microscópica para sua saúde bucal.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/brunatsoares"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-gold transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/brunatsoares"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-gold transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-gold">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Sobre a Dra. Bruna
                </Link>
              </li>
              <li>
                <Link href="/tratamentos" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Tratamentos
                </Link>
              </li>
              <li>
                <Link href="/casos" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Casos Antes/Depois
                </Link>
              </li>
              <li>
                <Link href="/depoimentos" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Depoimentos
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-gold transition-colors text-sm">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-gold">Contato</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href="tel:+5511999999999"
                  className="text-gray-300 hover:text-gold transition-colors text-sm"
                >
                  (11) 99999-9999
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a
                  href="mailto:contato@brunatsoares.com.br"
                  className="text-gray-300 hover:text-gold transition-colors text-sm"
                >
                  contato@brunatsoares.com.br
                </a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm">
                  Av. Paulista, 1000, Conjunto 101<br />
                  São Paulo - SP, 01310-100
                </span>
              </li>
            </ul>
          </div>

          {/* Horário de Funcionamento */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4 text-gold">Horário de Atendimento</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <div>Segunda a Sexta</div>
                  <div>08:00 às 18:00</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                <div className="text-gray-300 text-sm">
                  <div>Sábado</div>
                  <div>08:00 às 12:00</div>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleWhatsApp}
              className="mt-4 w-full bg-gold hover:bg-gold/90 text-black px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Fale no WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Dra. Bruna. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6">
              <Link href="/politica-privacidade" className="text-gray-400 hover:text-gold transition-colors text-sm">
                Política de Privacidade
              </Link>
              <Link href="/termos-uso" className="text-gray-400 hover:text-gold transition-colors text-sm">
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

