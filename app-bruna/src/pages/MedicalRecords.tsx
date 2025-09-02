import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Search } from 'lucide-react';

export function MedicalRecords() {
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prontuários</h1>
            <p className="mt-2 text-gray-600">
              Gerencie os prontuários médicos dos pacientes
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Prontuário
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prontuários Médicos</CardTitle>
          <CardDescription>
            Histórico clínico e evolução dos pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar prontuários..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum prontuário encontrado.</p>
            <p className="text-sm text-gray-400 mt-1">
              Os prontuários aparecerão aqui conforme forem criados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
