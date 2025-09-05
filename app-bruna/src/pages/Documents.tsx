import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, EncryptedDocument } from '../hooks/useAuth';
import { Plus, FileText, Download, Trash2, X, Upload, Lock, Shield } from 'lucide-react';

interface Document {
  id: string;
  patient_id: string;
  appointment_id?: string;
  filename: string;
  file_type?: string;
  file_size?: number;
  encrypted: boolean;
  created_at: string;
  updated_at: string;
}

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CreateDocumentRequest {
  patient_id: string;
  appointment_id?: string;
  filename: string;
  file_type?: string;
  file_size?: number;
  content: string;
}

export function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { encryptDocument, decryptDocument } = useAuth();
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
      const result = await invoke('db_get_documents', { patient_id: null });
      setDocuments(result as Document[]);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const result = await invoke('db_get_patients');
      setPatients(result as Patient[]);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        // Remove data URL prefix to get base64 content
        const base64Content = content.split(',')[1] || content;
        
        setFormData({
          ...formData,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          content: base64Content
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Encrypt the document content
      const encryptedDoc = await encryptDocument(formData.content, formData.filename);
      
      // Store the encrypted document metadata
      const documentRequest = {
        ...formData,
        content: JSON.stringify(encryptedDoc) // Store encrypted document as JSON string
      };
      
      await invoke('db_create_document', { request: documentRequest });
      
      setShowForm(false);
      setFormData({
        patient_id: '',
        appointment_id: '',
        filename: '',
        file_type: '',
        file_size: 0,
        content: ''
      });
      loadDocuments();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await invoke('db_delete_document', { id });
        loadDocuments();
      } catch (error) {
        console.error('Erro ao excluir documento:', error);
      }
    }
  };

  const handleDownload = async (document: Document) => {
    try {
      const content = await invoke('get_document_content', { documentId: document.id });
      
      // Try to parse as encrypted document first
      try {
        const encryptedDoc: EncryptedDocument = JSON.parse(content as string);
        const decryptedContent = await decryptDocument(encryptedDoc);
        
        // Convert base64 to blob
        const byteCharacters = atob(decryptedContent);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: document.file_type || 'application/octet-stream' });
        
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.filename;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // Fallback for non-encrypted documents
        const blob = new Blob([content as string], { type: document.file_type || 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = document.filename;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
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
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={!formData.content}>
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
                            {document.filename}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span>Paciente: {getPatientName(document.patient_id)}</span>
                            <span>•</span>
                            <span>{document.file_type || 'Tipo desconhecido'}</span>
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
                    {new Set(documents.map(d => d.file_type).filter(Boolean)).size}
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
