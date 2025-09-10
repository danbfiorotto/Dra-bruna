import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AppointmentsService } from '../services/supabase/appointments';
import { PatientsService } from '../services/supabase/patients';
import { ClinicsService } from '../services/supabase/clinics';
import { Appointment } from '../types/appointment';
import { Patient } from '../types/patient';
import { Clinic } from '../types/clinic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CalendarView } from '../components/CalendarView';
import { PatientDetailsModal } from '../components/PatientDetailsModal';
import { useAppKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { Plus, Calendar, Edit, Trash2, X, List, Grid, Search, Printer, User } from 'lucide-react';

interface CreateAppointmentRequest {
  patient_id: string;
  clinic_id?: string;
  appointment_date: string;
  start_time: string;
  title: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  user_id: string;
}

export function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [searchVisible, setSearchVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    patient_id: '',
    clinic_id: '',
    appointment_date: '',
    start_time: '',
    title: '',
    status: 'scheduled',
    notes: '',
    user_id: user?.id || '' // UUID do usuário logado
  });

  useEffect(() => {
    loadAppointments();
    loadPatients();
    loadClinics();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const result = await AppointmentsService.getAppointments();
      setAppointments(result);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
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

  const loadClinics = async () => {
    try {
      const result = await ClinicsService.getClinics();
      setClinics(result);
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar se o usuário está logado
    if (!user?.id) {
      console.error('Usuário não está logado');
      return;
    }
    
    // Validar campos obrigatórios
    if (!formData.patient_id || !formData.appointment_date || !formData.start_time || !formData.title) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Garantir que o user_id está definido
    const appointmentData = {
      ...formData,
      user_id: user.id
    };
    
    try {
      if (editingAppointment) {
        await AppointmentsService.updateAppointment(editingAppointment.id, appointmentData);
      } else {
        await AppointmentsService.createAppointment(appointmentData);
      }
      
      setShowForm(false);
      setEditingAppointment(null);
      setFormData({
        patient_id: '',
        appointment_date: '',
        start_time: '',
        title: '',
        status: 'scheduled',
        notes: '',
        user_id: user?.id || ''
      });
      loadAppointments();
    } catch (error) {
      console.error('Erro ao salvar consulta:', error);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      clinic_id: appointment.clinic_id || '',
      appointment_date: appointment.appointment_date,
      start_time: appointment.start_time,
      title: appointment.title,
      status: appointment.status,
      notes: appointment.notes || '',
      user_id: appointment.user_id
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta consulta?')) {
      try {
        await AppointmentsService.deleteAppointment(id);
        loadAppointments();
      } catch (error) {
        console.error('Erro ao excluir consulta:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAppointment(null);
      setFormData({
        patient_id: '',
        clinic_id: '',
        appointment_date: '',
        start_time: '',
        title: '',
        status: 'scheduled',
        notes: '',
        user_id: user?.id || ''
      });
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    // Mostrar detalhes do paciente ao invés de editar
    if (appointment.patient) {
      // Converter o tipo do paciente para o formato esperado
      const patient: Patient = {
        id: appointment.patient.id,
        name: appointment.patient.name,
        phone: appointment.patient.phone,
        email: '',
        birth_date: '',
        address: '',
        notes: '',
        created_at: '',
        updated_at: '',
        user_id: ''
      };
      setSelectedPatient(patient);
      setShowPatientDetails(true);
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientDetails(true);
  };

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      appointment_date: dateStr
    }));
    setShowForm(true);
  };

  // Atalhos de teclado
  useAppKeyboardShortcuts({
    onNewAppointment: () => setShowForm(true),
    onSearchPatient: () => setSearchVisible(!searchVisible),
    onGlobalSearch: () => setSearchVisible(!searchVisible),
    onPrintAgenda: () => window.print(),
    onSave: showForm ? () => handleSubmit({} as React.FormEvent) : undefined,
    onCancel: showForm ? handleCancel : undefined,
    enabled: true
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'Agendada';
      case 'confirmed':
        return 'Confirmada';
      case 'completed':
        return 'Realizada';
      case 'cancelled':
        return 'Cancelada';
      case 'no_show':
        return 'Não compareceu';
      default:
        return status;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
            <p className="mt-2 text-gray-600">
              Gerencie a agenda de consultas da clínica
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4 mr-2" />
                Calendário
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                title="Imprimir agenda (Ctrl+P)"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90"
                title="Nova consulta (N)"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Consulta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa Global */}
      {searchVisible && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Pesquisar pacientes, consultas..."
                className="flex-1"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchVisible(false);
                  }
                }}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de Consulta */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {editingAppointment ? 'Editar Consulta' : 'Nova Consulta'}
              </CardTitle>
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
                  <Label htmlFor="clinic_id">Clínica</Label>
                  <Select
                    value={formData.clinic_id}
                    onValueChange={(value) => setFormData({ ...formData, clinic_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma clínica" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.id} value={clinic.id}>
                          {clinic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="title">Título/Procedimento</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Consulta de rotina, Cirurgia, etc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="confirmed">Confirmada</SelectItem>
                      <SelectItem value="completed">Realizada</SelectItem>
                      <SelectItem value="cancelled">Cancelada</SelectItem>
                      <SelectItem value="no_show">Não compareceu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="start_time">Horário</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações sobre a consulta..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingAppointment ? 'Atualizar' : 'Criar'} Consulta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {viewMode === 'calendar' ? (
        <CalendarView
          appointments={appointments}
          onAppointmentClick={handleAppointmentClick}
          onDateClick={handleDateClick}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Consultas Agendadas</CardTitle>
                <CardDescription>
                  {appointments.length} consulta(s) agendada(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Carregando consultas...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Calendar className="h-6 w-6 text-primary" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">Paciente:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  {appointment.patient?.name || `ID: ${appointment.patient_id}`}
                                </span>
                                {appointment.patient && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const patient: Patient = {
                                        id: appointment.patient!.id,
                                        name: appointment.patient!.name,
                                        phone: appointment.patient!.phone,
                                        email: '',
                                        birth_date: '',
                                        address: '',
                                        notes: '',
                                        created_at: '',
                                        updated_at: '',
                                        user_id: ''
                                      };
                                      handlePatientClick(patient);
                                    }}
                                    className="h-6 w-6 p-0"
                                  >
                                    <User className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              
                              {appointment.clinic && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-600">Clínica:</span>
                                  <span className="text-sm text-gray-700">{appointment.clinic.name}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">Procedimento:</span>
                                <span className="text-sm text-gray-700">{appointment.title}</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-600">Horário:</span>
                                <span className="text-sm text-gray-700">
                                  {new Date(appointment.appointment_date).toLocaleDateString('pt-BR')} às {appointment.start_time}
                                </span>
                              </div>
                              
                              {appointment.notes && (
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-600">Observações:</span>
                                  <span className="text-sm text-gray-500">{appointment.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                            {getStatusText(appointment.status)}
                          </span>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(appointment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {appointments.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Nenhuma consulta agendada.</p>
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
                <CardTitle>Resumo da Semana</CardTitle>
                <CardDescription>
                  Estatísticas das consultas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total de consultas</span>
                    <span className="font-medium">{appointments.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confirmadas</span>
                    <span className="font-medium text-green-600">
                      {appointments.filter(a => a.status.toLowerCase() === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Agendadas</span>
                    <span className="font-medium text-yellow-600">
                      {appointments.filter(a => a.status.toLowerCase() === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Realizadas</span>
                    <span className="font-medium text-blue-600">
                      {appointments.filter(a => a.status.toLowerCase() === 'completed').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Paciente */}
      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={showPatientDetails}
          onClose={() => {
            setShowPatientDetails(false);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
}