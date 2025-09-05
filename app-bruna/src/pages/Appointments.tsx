import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Clock, Edit, Trash2, X } from 'lucide-react';

interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface Patient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CreateAppointmentRequest {
  patient_id: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
}

export function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<CreateAppointmentRequest>({
    patient_id: '',
    date: '',
    time: '',
    status: 'pendente',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
    loadPatients();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const result = await invoke('db_get_appointments');
      setAppointments(result as Appointment[]);
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await invoke('db_update_appointment', {
          id: editingAppointment.id,
          request: formData
        });
      } else {
        await invoke('db_create_appointment', { request: formData });
      }
      
      setShowForm(false);
      setEditingAppointment(null);
      setFormData({
        patient_id: '',
        date: '',
        time: '',
        status: 'pendente',
        notes: ''
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
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta consulta?')) {
      try {
        await invoke('db_delete_appointment', { id });
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
      date: '',
      time: '',
      status: 'pendente',
      notes: ''
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'realizada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="confirmada">Confirmada</SelectItem>
                      <SelectItem value="realizada">Realizada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                          <h3 className="font-medium text-gray-900">
                            {appointment.patient_name || `Paciente ID: ${appointment.patient_id}`}
                          </h3>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {new Date(appointment.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {appointment.time}
                            </span>
                          </div>
                          {appointment.notes && (
                            <p className="text-xs text-gray-400 mt-1">
                              {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
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
                    {appointments.filter(a => a.status.toLowerCase() === 'confirmada').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pendentes</span>
                  <span className="font-medium text-yellow-600">
                    {appointments.filter(a => a.status.toLowerCase() === 'pendente').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Realizadas</span>
                  <span className="font-medium text-blue-600">
                    {appointments.filter(a => a.status.toLowerCase() === 'realizada').length}
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