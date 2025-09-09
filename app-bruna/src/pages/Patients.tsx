import { useState, useEffect } from 'react';
import { PatientsService } from '../services/supabase/patients';
import { Patient } from '../types/patient';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';

interface CreatePatientRequest {
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  notes?: string;
}

export function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<CreatePatientRequest>({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    address: '',
    notes: ''
  });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const result = await PatientsService.getPatients();
      setPatients(result);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchPatients = async (query: string) => {
    if (!query.trim()) {
      loadPatients();
      return;
    }

    try {
      setLoading(true);
      const result = await PatientsService.searchPatients(query);
      setPatients(result);
    } catch (error) {
      console.error('Erro ao pesquisar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    searchPatients(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPatient) {
        await PatientsService.updatePatient(editingPatient.id, formData);
      } else {
        const patientData = {
          ...formData,
          user_id: user?.id || ''
        };
        await PatientsService.createPatient(patientData);
      }
      
      setShowForm(false);
      setEditingPatient(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        birth_date: '',
        address: '',
        notes: ''
      });
      loadPatients();
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      name: patient.name,
      email: patient.email || '',
      phone: patient.phone || '',
      birth_date: patient.birth_date || '',
      address: patient.address || '',
      notes: patient.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        await PatientsService.deletePatient(id);
        loadPatients();
      } catch (error) {
        console.error('Erro ao excluir paciente:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPatient(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      birth_date: '',
      address: '',
      notes: ''
    });
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="mt-2 text-gray-600">
              Gerencie o cadastro de pacientes da clínica
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setShowForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
            </CardTitle>
            <CardDescription>
              {editingPatient ? 'Atualize as informações do paciente' : 'Preencha as informações do novo paciente'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingPatient ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
          <CardDescription>
            {patients.length} paciente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pacientes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando pacientes...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{patient.name}</h3>
                    <div className="mt-1 text-sm text-gray-500">
                      {patient.email && <span>{patient.email}</span>}
                      {patient.phone && (
                        <span className={patient.email ? 'ml-2' : ''}>
                          {patient.phone}
                        </span>
                      )}
                    </div>
                    {patient.birth_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        Nascimento: {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {patient.address && (
                      <p className="text-xs text-gray-400 mt-1">
                        {patient.address}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(patient.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {patients.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchTerm ? 'Nenhum paciente encontrado com o termo pesquisado.' : 'Nenhum paciente cadastrado.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
