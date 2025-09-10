import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Appointment } from '../types/appointment';

interface CalendarViewProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  onDateClick: (date: Date) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export function CalendarView({ appointments, onAppointmentClick, onDateClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');

  // Função para obter o início da semana
  const getWeekStart = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());
    start.setHours(0, 0, 0, 0);
    return start;
  };

  // Função para obter o fim da semana
  const getWeekEnd = (date: Date) => {
    const end = new Date(date);
    end.setDate(date.getDate() - date.getDay() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };


  // Função para obter os dias da semana
  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Função para obter os dias do mês
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = getWeekStart(firstDay);
    const endDate = getWeekEnd(lastDay);
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Função para filtrar consultas por data
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };


  // Função para obter o status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'no_show':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Navegação
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Renderizar visão do dia
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate);
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold">
            {currentDate.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
        </div>
        
        <div className="space-y-3">
          {dayAppointments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhuma consulta agendada para este dia
            </div>
          ) : (
            dayAppointments
              .sort((a, b) => a.start_time.localeCompare(b.start_time))
              .map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-l-4 border-l-blue-500 bg-gradient-to-r from-white to-blue-50/30"
                  onClick={() => onAppointmentClick(appointment)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-full">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-semibold text-gray-800">{appointment.start_time}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-700">{appointment.patient?.name || 'Paciente'}</span>
                        </div>
                        {appointment.clinic && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{appointment.clinic.name}</span>
                          </div>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(appointment.status)} shadow-sm self-start sm:self-auto`}>
                        {appointment.status}
                      </Badge>
                    </div>
                    {appointment.title && (
                      <div className="mt-3">
                        <span className="font-medium text-gray-800">{appointment.title}</span>
                      </div>
                    )}
                    {appointment.notes && (
                      <p className="text-sm text-gray-600 mt-3 p-2 bg-gray-50 rounded-md italic">
                        {appointment.notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>
    );
  };

  // Renderizar visão da semana
  const renderWeekView = () => {
    const weekStart = getWeekStart(currentDate);
    const weekEnd = getWeekEnd(currentDate);
    const weekDays = getWeekDays(weekStart);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg md:text-xl font-bold">
            {weekStart.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {weekEnd.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div key={index} className="space-y-2">
                <div className={`text-center p-3 rounded-lg transition-all duration-200 ${
                  isToday 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}>
                  <div className="text-sm font-semibold uppercase tracking-wide">
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </div>
                  <div className="text-xl font-bold mt-1">
                    {day.getDate()}
                  </div>
                </div>
                
                <div className="space-y-2 min-h-[120px]">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-3 text-xs rounded-lg cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 border-l-3 ${getStatusColor(appointment.status)}`}
                      onClick={() => onAppointmentClick(appointment)}
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-800">{appointment.start_time}</div>
                        <div className="truncate text-gray-600 font-medium">{appointment.patient?.name || 'Paciente'}</div>
                        {appointment.clinic && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="truncate text-gray-500">{appointment.clinic.name}</span>
                          </div>
                        )}
                        {appointment.title && (
                          <div className="text-gray-700 font-medium truncate">{appointment.title}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar visão do mês
  const renderMonthView = () => {
    const monthDays = getMonthDays(currentDate);

    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-lg md:text-xl font-bold">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {/* Cabeçalho dos dias da semana */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="p-2 md:p-3 text-center text-xs md:text-sm font-bold text-gray-600 bg-gray-100 rounded-lg">
              {day}
            </div>
          ))}
          
          {/* Dias do mês */}
          {monthDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                className={`min-h-[100px] md:min-h-[120px] p-1 md:p-2 border border-gray-200 rounded-lg cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-blue-50'
                } ${isToday ? 'bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-300 shadow-md' : ''}`}
                onClick={() => onDateClick(day)}
              >
                <div className={`text-xs md:text-sm font-bold mb-1 md:mb-2 ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayAppointments.slice(0, 2).map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`p-1 md:p-2 text-xs rounded-lg cursor-pointer hover:shadow-sm transition-all duration-200 border-l-2 ${getStatusColor(appointment.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold truncate">{appointment.start_time}</div>
                        <div className="truncate text-gray-600">{appointment.patient?.name || 'Paciente'}</div>
                        {appointment.clinic && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-2 w-2 text-gray-400" />
                            <span className="truncate text-gray-500 text-xs">{appointment.clinic.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-500 text-center font-medium bg-gray-100 rounded px-1 py-0.5">
                      +{dayAppointments.length - 2} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="flex items-center space-x-2 text-white">
            <Calendar className="h-5 w-5 md:h-6 md:w-6" />
            <span className="text-lg md:text-xl font-semibold">Calendário de Consultas</span>
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Botões de navegação */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPrevious}
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToToday}
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white font-medium"
              >
                Hoje
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNext}
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Seletor de visualização */}
            <div className="flex border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm">
              {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-none first:rounded-l-lg last:rounded-r-lg transition-all duration-200 ${
                    viewMode === mode 
                      ? 'bg-white text-blue-600 shadow-md' 
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-6">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
      </CardContent>
    </Card>
  );
}
