import { useEffect, useState } from 'react';

export function useTauri() {
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Check if we're running in Tauri environment
    setIsTauri(typeof window !== 'undefined' && window.__TAURI__ !== undefined);
  }, []);

  return isTauri;
}

// Mock Tauri invoke function for web development
export const mockInvoke = async (command: string, args?: any) => {
  console.log(`Mock Tauri invoke: ${command}`, args);
  
  // Return mock data based on command
  switch (command) {
    case 'get_appointments':
      return [
        {
          id: '1',
          patient_id: 'P001',
          date: '2024-01-15',
          time: '09:00',
          status: 'confirmada',
          notes: 'Primeira consulta',
          created_at: '2024-01-10T10:00:00Z',
          updated_at: '2024-01-10T10:00:00Z'
        },
        {
          id: '2',
          patient_id: 'P002',
          date: '2024-01-15',
          time: '14:30',
          status: 'pendente',
          notes: 'Retorno',
          created_at: '2024-01-12T14:00:00Z',
          updated_at: '2024-01-12T14:00:00Z'
        }
      ];
    case 'get_patients':
      return [
        {
          id: 'P001',
          name: 'Maria Silva',
          email: 'maria@email.com',
          phone: '(11) 99999-9999',
          created_at: '2024-01-01T10:00:00Z'
        }
      ];
    default:
      return [];
  }
};

// Safe invoke function that works in both environments
export const safeInvoke = async (command: string, args?: any) => {
  // For now, always use mock data in web development
  // When running in actual Tauri, this will be replaced
  return mockInvoke(command, args);
};
