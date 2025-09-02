import Head from 'next/head';
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
}

export default function Layout({
  children,
  title = 'Dra. Bruna - Especialista em Endodontia',
  description = 'Dra. Bruna Torelli Soares é especialista em endodontia com vasta experiência em tratamentos de canal e endodontia microscópica. Agende sua consulta.',
  keywords = 'endodontia, tratamento de canal, endodontia microscópica, retratamento endodôntico, cirurgia apical, Dra. Bruna',
  canonical,
  ogImage = '/og-image.jpg'
}: LayoutProps) {
  const fullTitle = title.includes('Dra. Bruna') ? title : `${title} | Dra. Bruna`;
  
  return (
    <>
      <Head>
        <title>{fullTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Canonical URL */}
        {canonical && <link rel="canonical" href={canonical} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pt_BR" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* Schema.org LocalBusiness */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "MedicalBusiness",
              "name": "Dra. Bruna Torelli Soares",
              "description": "Especialista em endodontia com vasta experiência em tratamentos de canal e endodontia microscópica",
              "url": "https://brunatsoares.com.br",
              "telephone": "+55-11-99999-9999",
              "email": "contato@brunatsoares.com.br",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Av. Paulista, 1000, Conjunto 101",
                "addressLocality": "São Paulo",
                "addressRegion": "SP",
                "postalCode": "01310-100",
                "addressCountry": "BR"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "-23.5613",
                "longitude": "-46.6565"
              },
              "openingHours": "Mo-Fr 08:00-18:00, Sa 08:00-12:00",
              "priceRange": "$$",
              "medicalSpecialty": "Endodontics",
              "image": "https://brunatsoares.com.br/og-image.jpg"
            })
          }}
        />
      </Head>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}

