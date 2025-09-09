import { useState, useEffect, useCallback } from 'react';
import { AppointmentsService } from '../services/supabase/appointments';
import { Appointment } from '../types/appointment';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load appointments
  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await AppointmentsService.getAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
      console.error('Failed to load appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load appointments on mount
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Create appointment
  const createAppointment = useCallback(async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient_name' | 'patient_phone' | 'patient_email'>) => {
    try {
      setError(null);
      const newAppointment = await AppointmentsService.createAppointment(appointmentData);
      setAppointments(prev => [newAppointment, ...prev]);
      return newAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
      throw err;
    }
  }, []);

  // Update appointment
  const updateAppointment = useCallback(async (id: string, updates: Partial<Appointment>) => {
    try {
      setError(null);
      const updatedAppointment = await AppointmentsService.updateAppointment(id, updates);
      setAppointments(prev => prev.map(a => a.id === id ? updatedAppointment : a));
      return updatedAppointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      throw err;
    }
  }, []);

  // Delete appointment
  const deleteAppointment = useCallback(async (id: string) => {
    try {
      setError(null);
      await AppointmentsService.deleteAppointment(id);
      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment');
      throw err;
    }
  }, []);

  // Get appointments by date
  const getAppointmentsByDate = useCallback(async (date: string) => {
    try {
      setError(null);
      return await AppointmentsService.getAppointmentsByDate(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get appointments by date');
      throw err;
    }
  }, []);

  // Get appointments by patient
  const getAppointmentsByPatient = useCallback(async (patientId: string) => {
    try {
      setError(null);
      return await AppointmentsService.getAppointmentsByPatient(patientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get appointments by patient');
      throw err;
    }
  }, []);

  // Get today's appointments
  const getTodayAppointments = useCallback(async () => {
    try {
      setError(null);
      return await AppointmentsService.getTodayAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get today appointments');
      throw err;
    }
  }, []);

  // Get week's appointments
  const getWeekAppointments = useCallback(async () => {
    try {
      setError(null);
      return await AppointmentsService.getWeekAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get week appointments');
      throw err;
    }
  }, []);

  // Get appointment by ID
  const getAppointment = useCallback(async (id: string) => {
    try {
      setError(null);
      return await AppointmentsService.getAppointment(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get appointment');
      throw err;
    }
  }, []);

  return {
    appointments,
    isLoading,
    error,
    loadAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDate,
    getAppointmentsByPatient,
    getTodayAppointments,
    getWeekAppointments,
    getAppointment,
  };
};
