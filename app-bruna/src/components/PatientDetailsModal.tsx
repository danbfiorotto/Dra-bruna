import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Calendar, FileText, Stethoscope, MapPin, Download, Eye, Clock, CreditCard, AlertCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DocumentViewer } from './DocumentViewer';
import { Patient } from '../types/patient';
import { Appointment } from '../types/appointment';
import { Document } from '../types/document';
import { MedicalRecord } from '../types/medicalRecord';
import { AppointmentsService } from '../services/supabase/appointments';
import { DocumentsService } from '../services/supabase/documents';
import { MedicalRecordsService } from '../services/supabase/medicalRecords';

interface PatientDetailsModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onViewMedicalRecord?: (record: MedicalRecord) => void;
  onEditMedicalRecord?: (record: MedicalRecord) => void;
}

export function PatientDetailsModal({ patient, isOpen, onClose, onViewMedicalRecord, onEditMedicalRecord }: PatientDetailsModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [documentPassword, setDocumentPassword] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && patient?.id && !dataLoaded) {
      loadPatientData();
    }
  }, [isOpen, patient?.id, dataLoaded]);

  const loadPatientData = async () => {
    if (loading) return; // Evitar chamadas duplicadas
    
    console.log('🔄 Carregando dados do paciente:', patient.id);
    
    setLoading(true);
    try {
      const [appointmentsData, documentsData, medicalRecordsData] = await Promise.all([
        AppointmentsService.getAppointmentsByPatient(patient.id),
        DocumentsService.getDocumentsByPatient(patient.id),
        MedicalRecordsService.getMedicalRecordsByPatient(patient.id)
      ]);
      
      console.log('✅ Dados carregados:', { 
        appointments: appointmentsData.length, 
        documents: documentsData.length, 
        medicalRecords: medicalRecordsData.length 
      });
      
      setAppointments(appointmentsData);
      setDocuments(documentsData);
      setMedicalRecords(medicalRecordsData);
      setDataLoaded(true);
    } catch (error) {
      console.error('❌ Erro ao carregar dados do paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return 'N/A';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      
      if (isNaN(birth.getTime())) return 'N/A';
      
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return 'N/A';
    }
  };

  const handleClose = () => {
    setDataLoaded(false);
    setAppointments([]);
    setDocuments([]);
    setMedicalRecords([]);
    setSelectedDocument(null);
    setShowDocumentViewer(false);
    setDocumentPassword('');
    onClose();
  };

  const isSupportedFormat = (mimeType: string | undefined) => {
    if (!mimeType) return false;
    return (
      mimeType.includes('pdf') ||
      mimeType.includes('image') ||
      mimeType.includes('word') ||
      mimeType.includes('document')
    );
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setDocumentPassword('');
    setShowDocumentViewer(true);
  };

  const handleCloseDocumentViewer = () => {
    setShowDocumentViewer(false);
    setSelectedDocument(null);
    setDocumentPassword('');
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      const blob = await DocumentsService.downloadDocument(document.id, documentPassword || undefined);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.file_name || 'documento';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Erro ao baixar documento:', error);
      alert('Erro ao baixar documento: ' + (error.message || 'Erro desconhecido'));
    }
  };

  const getFileIcon = (mimeType: string | undefined) => {
    if (!mimeType) return '📄';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel')) return '📊';
    if (mimeType.includes('powerpoint')) return '📊';
    return '📄';
  };

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{patient.name}</h2>
              <p className="text-gray-600">Dados do Paciente</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Carregando dados do paciente...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Informações Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dados Básicos */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <CreditCard className="h-4 w-4" />
                        <span>Dados Básicos</span>
                      </h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-sm font-medium text-gray-900">Nome:</span>
                            <p className="text-sm text-gray-600">{patient.name}</p>
                          </div>
                        </div>
                        
                        {patient.birth_date && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Data de Nascimento:</span>
                              <p className="text-sm text-gray-600">
                                {formatDate(patient.birth_date)} 
                                <span className="ml-2 text-xs text-blue-600">
                                  ({calculateAge(patient.birth_date)} anos)
                                </span>
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Contato */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Contato</span>
                      </h4>
                      
                      <div className="space-y-3">
                        {patient.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">Telefone:</span>
                              <p className="text-sm text-gray-600">{patient.phone}</p>
                            </div>
                          </div>
                        )}
                        
                        {patient.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <div>
                              <span className="text-sm font-medium text-gray-900">E-mail:</span>
                              <p className="text-sm text-gray-600">{patient.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Endereço */}
                    {patient.address && (
                      <div className="space-y-4 md:col-span-2">
                        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>Endereço</span>
                        </h4>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <p className="text-sm text-gray-600">{patient.address}</p>
                        </div>
                      </div>
                    )}

                    {/* Observações */}
                    {patient.notes && (
                      <div className="space-y-4 md:col-span-2">
                        <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4" />
                          <span>Observações</span>
                        </h4>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{patient.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Informações do Sistema */}
                    <div className="space-y-4 md:col-span-2">
                      <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>Informações do Sistema</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Cadastrado em:</span>
                          <p>{formatDateTime(patient.created_at)}</p>
                        </div>
                        <div>
                          <span className="font-medium">Última atualização:</span>
                          <p>{formatDateTime(patient.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Consultas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Consultas ({appointments.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhuma consulta encontrada</p>
                  ) : (
                    <div className="space-y-3">
                      {appointments
                        .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
                        .map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium">{appointment.title}</span>
                                <Badge className={getStatusColor(appointment.status)}>
                                  {appointment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                <span>{formatDate(appointment.appointment_date)}</span>
                                <span>{appointment.start_time}</span>
                                {appointment.clinic && (
                                  <span className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    {appointment.clinic.name}
                                  </span>
                                )}
                              </div>
                              {appointment.notes && (
                                <p className="text-xs text-gray-400 mt-1">{appointment.notes}</p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documentos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Documentos ({documents.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum documento encontrado</p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="text-2xl">{getFileIcon(document.mime_type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 truncate">{document.title || 'Documento sem título'}</div>
                              {document.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{document.description}</p>
                              )}
                              <div className="flex items-center space-x-4 text-xs text-gray-400 mt-2">
                                <span className="flex items-center space-x-1">
                                  <FileText className="h-3 w-3" />
                                  {document.file_name || 'arquivo'}
                                </span>
                                <span>{formatFileSize(document.file_size)}</span>
                                <span>{document.created_at ? formatDateTime(document.created_at) : 'Data não disponível'}</span>
                                {document.encrypted && (
                                  <Badge variant="secondary" className="text-xs">
                                    🔒 Criptografado
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {isSupportedFormat(document.mime_type) ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument(document)}
                                className="flex items-center space-x-1"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Visualizar</span>
                              </Button>
                            ) : (
                              <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                Formato não suportado
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadDocument(document)}
                              className="flex items-center space-x-1"
                            >
                              <Download className="h-4 w-4" />
                              <span>Baixar</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Prontuários */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5" />
                    <span>Prontuários ({medicalRecords.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {medicalRecords.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Nenhum prontuário encontrado</p>
                  ) : (
                    <div className="space-y-3">
                      {medicalRecords.map((record) => (
                        <div key={record.id} className="p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-sm text-gray-500">
                              {formatDate(record.created_at)} - Versão {record.version}
                            </div>
                            <div className="flex space-x-2">
                              {onViewMedicalRecord && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onViewMedicalRecord(record)}
                                  className="flex items-center space-x-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Ver</span>
                                </Button>
                              )}
                              {onEditMedicalRecord && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onEditMedicalRecord(record)}
                                  className="flex items-center space-x-1"
                                >
                                  <Edit className="h-3 w-3" />
                                  <span>Editar</span>
                                </Button>
                              )}
                            </div>
                          </div>
                          {record.diagnosis && (
                            <div className="mb-2">
                              <span className="font-medium text-sm">Diagnóstico:</span>
                              <p className="text-sm text-gray-700 mt-1 line-clamp-2">{record.diagnosis}</p>
                            </div>
                          )}
                          {record.treatment_plan && (
                            <div className="mb-2">
                              <span className="font-medium text-sm">Plano de Tratamento:</span>
                              <p className="text-sm text-gray-700 mt-1 line-clamp-2">{record.treatment_plan}</p>
                            </div>
                          )}
                          {record.notes && (
                            <div>
                              <span className="font-medium text-sm">Observações:</span>
                              <p className="text-sm text-gray-700 mt-1 line-clamp-2">{record.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Visualizador de Documentos */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          isOpen={showDocumentViewer}
          onClose={handleCloseDocumentViewer}
          password={documentPassword}
        />
      )}
    </div>
  );
}
