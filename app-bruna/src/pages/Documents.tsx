import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { DocumentsService } from '../services/supabase/documents';
import { PatientsService } from '../services/supabase/patients';
import { Document } from '../types/document';
import { Patient } from '../types/patient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Download, Trash2, X, Upload, Lock, Shield } from 'lucide-react';

interface CreateDocumentRequest {
  patient_id: string;
  appointment_id?: string;
  filename: string;
  file_type?: string;
  file_size?: number;
  content: string;
}

export function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  // Document encryption/decryption is now handled by the useDocuments hook
  const [formData, setFormData] = useState<CreateDocumentRequest>({
    patient_id: '',
    appointment_id: '',
    filename: '',
    file_type: '',
    file_size: 0,
    content: ''
  });

  useEffect(() => {
    loadDocuments();
    loadPatients();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const result = await DocumentsService.getDocuments();
      setDocuments(result);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const result = await PatientsService.getPatients();
      setPatients(result);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        content: '' // Não precisamos mais do base64
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se o usuário está logado
    if (!user?.id) {
      console.error('Usuário não está logado');
      return;
    }

    // Validar se um arquivo foi selecionado
    const fileInput = document.getElementById('file') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      alert('Por favor, selecione um arquivo');
      return;
    }
    
    try {
      console.log('📤 Iniciando upload do documento:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        patientId: formData.patient_id
      });

      // Usar o serviço de upload que salva no Supabase Storage
      await DocumentsService.uploadDocument(
        file,
        formData.patient_id,
        formData.appointment_id || undefined,
        user.id
      );
      
      console.log('✅ Documento enviado com sucesso!');
      
      setShowForm(false);
      setFormData({
        patient_id: '',
        appointment_id: '',
        filename: '',
        file_type: '',
        file_size: 0,
        content: ''
      });
      
      // Limpar o input de arquivo
      if (fileInput) {
        fileInput.value = '';
      }
      
      loadDocuments();
    } catch (error) {
      console.error('❌ Erro ao enviar documento:', error);
      alert('Erro ao enviar documento. Verifique o console para mais detalhes.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await DocumentsService.deleteDocument(id);
        loadDocuments();
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
      }
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      if (document.encrypted) {
        const password = prompt('Este documento está criptografado. Digite a senha:');
        if (password) {
          await performDownload(document.id, password);
        }
      } else {
        await performDownload(document.id);
      }
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
    }
  };

  const performDownload = async (documentId: string, password?: string) => {
    try {
      const blob = await DocumentsService.downloadDocument(documentId, password);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = documents.find(d => d.id === documentId)?.file_name || 'documento';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro no download:', error);
      alert('Erro ao baixar documento. Verifique a senha se o documento estiver criptografado.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      patient_id: '',
      appointment_id: '',
      filename: '',
      file_type: '',
      file_size: 0,
      content: ''
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient?.name || `Paciente ID: ${patientId}`;
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
            <p className="mt-2 text-gray-600">
              Gerencie documentos e arquivos dos pacientes
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Documento
          </Button>
        </div>
      </div>

      {/* Formulário de Documento */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Novo Documento</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient_id">Paciente</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={(value) => setFormData({ ...formData, patient_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file">Arquivo</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileUpload}
                    required
                  />
                </div>
              </div>

              {formData.filename && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{formData.filename}</p>
                      <p className="text-sm text-gray-500">
                        {formData.file_type} • {formatFileSize(formData.file_size)}
                      </p>
                    </div>
                    <Lock className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={!formData.patient_id || !formData.filename}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documento
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>
                {documents.length} documento(s) armazenado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Carregando documentos...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {document.file_name}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Paciente: {getPatientName(document.patient_id)}</span>
                            <span>•</span>
                            <span>{document.mime_type || 'Tipo desconhecido'}</span>
                            <span>•</span>
                            <span>{formatFileSize(document.file_size)}</span>
                            {document.encrypted && (
                              <>
                                <span>•</span>
                                <span className="flex items-center text-green-600">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Criptografado
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Criado em: {new Date(document.created_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDelete(document.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {documents.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Nenhum documento armazenado.</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>
                Resumo dos documentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total de documentos</span>
                  <span className="font-medium">{documents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Criptografados</span>
                  <span className="font-medium text-green-600 flex items-center">
                    <Shield className="h-4 w-4 mr-1" />
                    {documents.filter(d => d.encrypted).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tamanho total</span>
                  <span className="font-medium">
                    {formatFileSize(documents.reduce((sum, d) => sum + (d.file_size || 0), 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tipos únicos</span>
                  <span className="font-medium">
                    {new Set(documents.map(d => d.mime_type).filter(Boolean)).size}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
