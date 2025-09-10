import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, FileText, Calendar, User, Loader2, Edit, Trash2, X } from 'lucide-react';
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
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Busca simplificada: apenas nome, CPF e RG
      const results = medicalRecords.filter(record => {
        // Busca nos campos do paciente
        const patient = patients.find(p => p.id === record.patient_id);
        if (!patient) return false;

        // Verifica nome do paciente
        const nameMatch = patient.name?.toLowerCase().includes(searchLower);
        
        // Verifica CPF do paciente
        const patientCpfMatch = patient.cpf?.toLowerCase().includes(searchLower);
        
        // Verifica RG do paciente
        const patientRgMatch = patient.rg?.toLowerCase().includes(searchLower);
        
        // Verifica CPF do prontuário
        const recordCpfMatch = record.cpf?.toLowerCase().includes(searchLower);
        
        // Verifica RG do prontuário
        const recordRgMatch = record.rg?.toLowerCase().includes(searchLower);

        return nameMatch || patientCpfMatch || patientRgMatch || recordCpfMatch || recordRgMatch;
      });
      
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Função para limpar a pesquisa
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  // Função para pesquisa em tempo real com debounce
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setSearchResults([]);
    }
  }, []);

  // Debounce para pesquisa automática
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms de delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, handleSearch]);

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Paciente não encontrado';
  };

  // Função para destacar termos de busca
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
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
              placeholder="Buscar por nome do paciente, CPF ou RG..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} disabled={isSearching || !searchTerm.trim()}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        {searchResults.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-medium">{searchResults.length}</span> prontuário(s) encontrado(s) para "<span className="font-medium">{searchTerm}</span>"
          </div>
        )}
        {searchTerm && searchResults.length === 0 && (
          <div className="mt-2 text-sm text-red-600">
            Nenhum prontuário encontrado para "<span className="font-medium">{searchTerm}</span>"
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {searchTerm.trim() ? (
          // Quando há pesquisa ativa, mostra apenas os resultados ou área vazia
          searchResults.length === 0 ? (
            // Área completamente em branco quando não há resultados da pesquisa
            <div></div>
          ) : (
            // Mostra apenas os cards dos resultados da pesquisa
            searchResults.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-800">
                      <User className="h-4 w-4 text-gray-600" />
                      <span dangerouslySetInnerHTML={{ 
                        __html: highlightSearchTerm(getPatientName(record.patient_id), searchTerm) 
                      }} />
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {(() => {
                        const patient = patients.find(p => p.id === record.patient_id);
                        return patient?.birth_date ? formatDate(patient.birth_date) : 'Data não informada';
                      })()}
                    </CardDescription>
                  </div>
                  
                  {/* Botões de ação no lado direito */}
                  <div className="flex space-x-1 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleView(record)}
                      className="w-12 h-7 text-xs px-2 border-gray-300 hover:bg-gray-50"
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(record)}
                      className="w-12 h-7 text-xs px-2 border-gray-300 hover:bg-gray-50"
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      className="w-12 h-7 text-xs px-2 border-gray-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                <div className="space-y-3">
                  {(record.diagnosis || record.treatment_plan) && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center gap-1">
                        <span>🩺</span> Diagnóstico / <span>💊</span> Plano de Tratamento
                      </h4>
                      <div className="space-y-1">
                        {record.diagnosis && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {record.diagnosis}
                          </p>
                        )}
                        {record.treatment_plan && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {record.treatment_plan}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center gap-1">
                        <span>📋</span> Observações
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          )
        ) : (
          // Quando não há pesquisa, mostra todos os prontuários ou mensagem de vazio
          medicalRecords.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum prontuário cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            medicalRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base font-medium text-gray-800">
                      <User className="h-4 w-4 text-gray-600" />
                      <span dangerouslySetInnerHTML={{ 
                        __html: highlightSearchTerm(getPatientName(record.patient_id), searchTerm) 
                      }} />
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {(() => {
                        const patient = patients.find(p => p.id === record.patient_id);
                        return patient?.birth_date ? formatDate(patient.birth_date) : 'Data não informada';
                      })()}
                    </CardDescription>
                  </div>
                  
                  {/* Botões de ação no lado direito */}
                  <div className="flex space-x-1 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleView(record)}
                      className="w-12 h-7 text-xs px-2 border-gray-300 hover:bg-gray-50"
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(record)}
                      className="w-12 h-7 text-xs px-2 border-gray-300 hover:bg-gray-50"
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(record.id)}
                      className="w-12 h-7 text-xs px-2 border-gray-300 hover:bg-red-50 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 pb-4">
                <div className="space-y-3">
                  {(record.diagnosis || record.treatment_plan) && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center gap-1">
                        <span>🩺</span> Diagnóstico / <span>💊</span> Plano de Tratamento
                      </h4>
                      <div className="space-y-1">
                        {record.diagnosis && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {record.diagnosis}
                          </p>
                        )}
                        {record.treatment_plan && (
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {record.treatment_plan}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-700 mb-1 flex items-center gap-1">
                        <span>📋</span> Observações
                      </h4>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {record.notes}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          )
        )}
      </div>
    </div>
  );
}