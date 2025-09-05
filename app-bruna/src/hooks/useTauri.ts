import { useEffect, useState } from 'react';

export function useTauri() {
  const [isTauri, setIsTauri] = useState(false);

  useEffect(() => {
    // Check if we're running in Tauri environment
    setIsTauri(typeof window !== 'undefined' && (window as any).__TAURI__ !== undefined);
  }, []);

  return isTauri;
}

// Mock Tauri invoke function for web development
export const mockInvoke = async (command: string, args?: any) => {
  
  // Return mock data based on command
  switch (command) {
    case 'initialize_auth':
      return { success: true };
    
    case 'login':
      if (args?.email === 'admin@drabruna.com' && args?.password === 'admin123') {
        return {
          user: {
            id: 'admin-user-id',
            email: 'admin@drabruna.com',
            name: 'Administrador',
            role: 'admin',
            active: true,
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-01T10:00:00Z'
          },
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: '2024-12-31T23:59:59Z'
        };
      } else {
        throw new Error('Credenciais inválidas');
      }
    
    case 'get_current_user':
      // In development mode, always return null to force login
      return null;
    
    case 'logout':
      return { success: true };
    
    case 'check_permission':
      return true; // Admin tem todas as permissões
    
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
    
    case 'get_audit_logs':
      return [
        {
          id: 'log-1',
          user_id: 'admin-user-id',
          user_email: 'admin@drabruna.com',
          action: 'LOGIN',
          entity_type: 'USER',
          entity_id: 'admin-user-id',
          details: 'Login realizado com sucesso',
          ip_address: '127.0.0.1',
          user_agent: 'Mozilla/5.0...',
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
