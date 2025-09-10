import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Calendar, User, Loader2, Edit, Trash2, Eye } from 'lucide-react';
import { useMedicalRecords } from '../hooks/useMedicalRecords';
import { usePatients } from '../hooks/usePatients';
import { useAppointments } from '../hooks/useAppointments';
import { MedicalRecordForm } from '../components/MedicalRecordForm';
import { UnifiedAnamnesisView } from '../components/UnifiedAnamnesisView';
import { MedicalRecord } from '../types/medicalRecord';

export function MedicalRecords() {
  const {
    medicalRecords,
    isLoading,
    error,
    loadMedicalRecords,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
  } = useMedicalRecords();

  const { patients } = usePatients();
  const { appointments } = useAppointments();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    loadMedicalRecords();
  }, [loadMedicalRecords]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      // Busca local nos prontuários carregados
      const results = medicalRecords.filter(record => 
        record.anamnesis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.treatment_plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Paciente não encontrado';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleSave = async (data: Partial<MedicalRecord>) => {
    try {
      setIsSaving(true);
      let savedRecord;
      if (editingRecord) {
        savedRecord = await updateMedicalRecord(editingRecord.id, data);
      } else {
        savedRecord = await createMedicalRecord(data as Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>);
      }
      setLastSaved(new Date());
      loadMedicalRecords();
      return savedRecord; // Retornar o objeto salvo
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setViewingRecord(null);
    setShowForm(true);
  };

  const handleView = (record: MedicalRecord) => {
    setViewingRecord(record);
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este prontuário?')) {
      try {
        await deleteMedicalRecord(id);
        loadMedicalRecords();
      } catch (error) {
        console.error('Erro ao excluir prontuário:', error);
      }
    }
  };

  const handleNewRecord = () => {
    setEditingRecord(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRecord(null);
    setViewingRecord(null);
    setLastSaved(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar prontuários: {error}</p>
      </div>
    );
  }

  const displayRecords = searchResults.length > 0 ? searchResults : medicalRecords;

  if (showForm) {
    return (
      <MedicalRecordForm
        medicalRecord={editingRecord || undefined}
        patients={patients}
        appointments={appointments}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={isSaving}
      />
    );
  }

  if (viewingRecord) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Visualizar Prontuário</h1>
              <p className="mt-2 text-gray-600">
                {getPatientName(viewingRecord.patient_id)} - {formatDate(viewingRecord.created_at)}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => handleEdit(viewingRecord)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button 
                variant="outline"
                onClick={handleCancel}
              >
                Voltar
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Informações do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome</label>
                  <p className="text-sm text-gray-900">{getPatientName(viewingRecord.patient_id)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Data do Prontuário</label>
                  <p className="text-sm text-gray-900">{formatDate(viewingRecord.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Versão</label>
                  <p className="text-sm text-gray-900">{viewingRecord.version}</p>
                </div>
                {viewingRecord.rg && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">RG</label>
                    <p className="text-sm text-gray-900">{viewingRecord.rg}</p>
                  </div>
                )}
                {viewingRecord.cpf && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">CPF</label>
                    <p className="text-sm text-gray-900">{viewingRecord.cpf}</p>
                  </div>
                )}
                {viewingRecord.indication && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Indicação</label>
                    <p className="text-sm text-gray-900">{viewingRecord.indication}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Anamnese Unificada */}
          <UnifiedAnamnesisView 
            medicalRecordId={viewingRecord.id} 
            freeAnamnesis={viewingRecord.anamnesis}
          />

          {/* Diagnóstico/Tratamento */}
          {(viewingRecord.diagnosis || viewingRecord.treatment_plan) && (
            <Card>
              <CardHeader>
                <CardTitle>Diagnóstico/Tratamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {viewingRecord.diagnosis && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Diagnóstico</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingRecord.diagnosis}</p>
                  </div>
                )}
                {viewingRecord.treatment_plan && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Plano de Tratamento</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingRecord.treatment_plan}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {viewingRecord.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{viewingRecord.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prontuários Médicos</h1>
            <p className="mt-2 text-gray-600">
              Gestão de prontuários e histórico médico dos pacientes
            </p>
          </div>
          <Button 
            onClick={handleNewRecord}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Prontuário
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por anamnese, diagnóstico, plano de tratamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {displayRecords.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum prontuário encontrado para a busca' : 'Nenhum prontuário cadastrado'}
              </p>
            </CardContent>
          </Card>
        ) : (
          displayRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {getPatientName(record.patient_id)}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(record.created_at)}
                      </span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Versão {record.version}
                      </span>
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleView(record)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(record)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {record.anamnesis && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Anamnese</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {record.anamnesis}
                      </p>
                    </div>
                  )}
                  {record.diagnosis && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Diagnóstico</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {record.diagnosis}
                      </p>
                    </div>
                  )}
                  {record.treatment_plan && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Plano de Tratamento</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {record.treatment_plan}
                      </p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1">Observações</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}