'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Capturar UTM parameters se existirem
      const urlParams = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      urlParams.forEach((value, key) => {
        if (key.startsWith('utm_')) {
          utm[key] = value;
        }
      });

      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          utm: Object.keys(utm).length > 0 ? utm : undefined
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('error');
        setErrorMessage(result.message || 'Erro ao enviar contato');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Erro de conexão. Tente novamente.');
      console.error('Erro no formulário:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Send className="h-5 w-5" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
            <CheckCircle className="h-4 w-4" />
            Obrigado! Recebemos seu contato e retornaremos em breve.
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4" />
            {errorMessage || 'Ops! Algo deu errado. Tente novamente.'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Entre em Contato
        </CardTitle>
        <CardDescription className="text-center">
          Preencha o formulário abaixo e entraremos em contato em breve
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {getStatusMessage()}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={formData.name}
                onChange={handleInputChange}
                disabled={status === 'loading'}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                maxLength={200}
                value={formData.email}
                onChange={handleInputChange}
                disabled={status === 'loading'}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              name="message"
              maxLength={2000}
              value={formData.message}
              onChange={handleInputChange}
              disabled={status === 'loading'}
              placeholder="Conte-nos como podemos ajudar..."
              rows={5}
            />
            <p className="text-xs text-gray-500">
              {formData.message.length}/2000 caracteres
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={status === 'loading'}
          >
            {getStatusIcon()}
            <span className="ml-2">
              {status === 'loading' ? 'Enviando...' : 'Enviar Mensagem'}
            </span>
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Ao enviar este formulário, você concorda com nossa{' '}
            <a href="/politica-privacidade" className="text-blue-600 hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
