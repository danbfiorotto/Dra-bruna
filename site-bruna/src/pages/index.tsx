import Head from 'next/head';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  return (
    <>
      <Head>
        <title>Dra. Bruna - Clínica Especializada</title>
        <meta name="description" content="Dra. Bruna - Clínica especializada em tratamentos estéticos e dermatológicos. Agende sua consulta." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-h1 font-heading text-balance mb-6">
                Bem-vinda à Clínica Dra. Bruna
              </h1>
              <p className="text-body text-muted-foreground mb-8 max-w-2xl mx-auto">
                Cuidados especializados em dermatologia e estética com abordagem humanizada. 
                Sua saúde e bem-estar são nossa prioridade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Agendar Consulta
                </Button>
                <Button variant="outline" size="lg">
                  Conhecer Tratamentos
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-padding">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-h2 font-heading mb-4">Por que escolher a Dra. Bruna?</h2>
              <p className="text-body text-muted-foreground max-w-2xl mx-auto">
                Profissionalismo, tecnologia de ponta e cuidado humanizado em cada atendimento.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Formação Especializada</CardTitle>
                  <CardDescription>
                    Especialização em dermatologia com foco em tratamentos estéticos e clínicos.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tecnologia Avançada</CardTitle>
                  <CardDescription>
                    Equipamentos modernos e técnicas atualizadas para melhores resultados.
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Abordagem Humanizada</CardTitle>
                  <CardDescription>
                    Cuidado personalizado e acolhedor em cada etapa do tratamento.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
