import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Database, Key, Bell, Monitor } from 'lucide-react';

export function Settings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-2 text-gray-600">
          Configure o sistema e gerencie as preferências
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Segurança
            </CardTitle>
            <CardDescription>
              Configurações de segurança e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alterar senha
              </label>
              <Button variant="outline" className="w-full">
                Alterar Senha
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup automático
              </label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-600">Ativar backup diário</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Criptografia
              </label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-600">Criptografar dados sensíveis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Banco de Dados
            </CardTitle>
            <CardDescription>
              Gerenciamento do banco de dados local
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Backup manual
              </label>
              <Button variant="outline" className="w-full">
                <Database className="h-4 w-4 mr-2" />
                Criar Backup
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurar backup
              </label>
              <Button variant="outline" className="w-full">
                Restaurar Backup
              </Button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limpar cache
              </label>
              <Button variant="outline" className="w-full">
                Limpar Cache
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configurações de notificações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lembretes de consulta
              </label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-600">Ativar lembretes</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notificações de backup
              </label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm text-gray-600">Notificar sobre backups</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Som de notificação
              </label>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-600">Reproduzir som</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Interface
            </CardTitle>
            <CardDescription>
              Personalização da interface do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="light">Claro</option>
                <option value="dark">Escuro</option>
                <option value="auto">Automático</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fonte
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="inter">Inter</option>
                <option value="poppins">Poppins</option>
                <option value="system">Sistema</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
