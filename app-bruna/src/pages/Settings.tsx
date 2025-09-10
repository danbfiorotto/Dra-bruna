import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, FileText, Stethoscope, Users } from 'lucide-react';
import { AnamnesisQuestionsManager } from '../components/AnamnesisQuestionsManager';
import { ProceduresManager } from '../components/ProceduresManager';

export function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        </div>
        <p className="text-gray-600">
          Configure perguntas da anamnese, procedimentos e outras configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="anamnesis" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="anamnesis" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Anamnese</span>
          </TabsTrigger>
          <TabsTrigger value="procedures" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Procedimentos</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Usuários</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="anamnesis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Perguntas da Anamnese</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Gerencie as perguntas estruturadas da anamnese que aparecem no formulário de prontuário
              </p>
            </CardHeader>
            <CardContent>
              <AnamnesisQuestionsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedures" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Procedimentos Médicos</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Gerencie os procedimentos médicos disponíveis para execução e orçamento
              </p>
            </CardHeader>
            <CardContent>
              <ProceduresManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Usuários do Sistema</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Gerencie usuários e permissões do sistema
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Gerenciamento de usuários em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}