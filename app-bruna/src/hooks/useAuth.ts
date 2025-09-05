import React, { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AUTH_CONFIG } from '../config/auth';
import { useTauri, safeInvoke } from './useTauri';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface EncryptedDocument {
  content: string;
  iv: string;
  salt: string;
  tag: string;
  file_hash: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isTauri = useTauri();

  // Load authentication state from localStorage on mount
  React.useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedAuth = localStorage.getItem('auth_authenticated');
    
    if (savedUser && savedAuth === 'true') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_authenticated');
      }
    }
    setIsLoading(false);
  }, []);

  // Helper function to safely invoke Tauri commands
  const safeInvokeCommand = useCallback(async <T = any>(command: string, args?: any): Promise<T> => {
    if (isTauri) {
      return await invoke<T>(command, args);
    } else {
      return await safeInvoke(command, args) as T;
    }
  }, [isTauri]);

  // Initialize authentication services
  const initializeAuth = useCallback(async (
    supabaseUrl: string,
    supabaseAnonKey: string,
    masterPassword: string
  ) => {
    try {
      await safeInvokeCommand('initialize_auth', {
        supabaseUrl,
        supabaseAnonKey,
        masterPassword,
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      return false;
    }
  }, [safeInvokeCommand]);

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<LoginResponse | null> => {
    try {
      setIsLoading(true);
      const response = await safeInvokeCommand<LoginResponse>('login', {
        email,
        password,
      });
      
      if (response && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        
        // Save to localStorage for persistence
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        localStorage.setItem('auth_authenticated', 'true');
        
        return response;
      } else {
        throw new Error('Resposta de login inválida');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [safeInvokeCommand]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await safeInvokeCommand('logout');
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear localStorage
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_authenticated');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [safeInvokeCommand]);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    try {
      const currentUser = await safeInvokeCommand<User | null>('get_current_user');
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      return currentUser;
    } catch (error) {
      console.error('Failed to get current user:', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, [safeInvokeCommand]);

  // Refresh session
  const refreshSession = useCallback(async (): Promise<LoginResponse | null> => {
    try {
      const response = await safeInvokeCommand<LoginResponse>('refresh_session');
      setUser(response.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      console.error('Session refresh failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, [safeInvokeCommand]);

  // Check permission
  const checkPermission = useCallback(async (action: string): Promise<boolean> => {
    try {
      return await safeInvokeCommand<boolean>('check_permission', { action });
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }, [safeInvokeCommand]);

  // Encrypt document
  const encryptDocument = useCallback(async (
    content: string, // Base64 encoded content
    filename: string
  ): Promise<EncryptedDocument> => {
    try {
      return await safeInvokeCommand<EncryptedDocument>('encrypt_document', {
        content,
        filename,
      });
    } catch (error) {
      console.error('Document encryption failed:', error);
      throw error;
    }
  }, [safeInvokeCommand]);

  // Decrypt document
  const decryptDocument = useCallback(async (
    encryptedDoc: EncryptedDocument
  ): Promise<string> => {
    try {
      return await safeInvokeCommand<string>('decrypt_document', {
        encryptedDoc,
      });
    } catch (error) {
      console.error('Document decryption failed:', error);
      throw error;
    }
  }, [safeInvokeCommand]);

  // Get audit logs
  const getAuditLogs = useCallback(async (
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<AuditLog[]> => {
    try {
      return await safeInvokeCommand<AuditLog[]>('get_audit_logs', {
        userId: userId || null,
        startDate: startDate || null,
        endDate: endDate || null,
      });
    } catch (error) {
      console.error('Failed to get audit logs:', error);
      return [];
    }
  }, [safeInvokeCommand]);

  // Check if user has permission for an action
  const hasPermission = useCallback(async (action: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    return await checkPermission(action);
  }, [isAuthenticated, user, checkPermission]);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // In development mode, don't auto-login but check localStorage
        if (!isTauri) {
          // The localStorage check is already handled in the first useEffect
          return;
        }

        // Try to get current user first (only in Tauri mode)
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          // If no current user, try to initialize with configuration values
          await initializeAuth(
            AUTH_CONFIG.supabase.url,
            AUTH_CONFIG.supabase.anonKey,
            AUTH_CONFIG.masterPassword
          );
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      }
    };

    initAuth();
  }, [getCurrentUser, initializeAuth, isTauri]);

  return {
    user,
    isLoading,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    getCurrentUser,
    refreshSession,
    checkPermission,
    hasPermission,
    encryptDocument,
    decryptDocument,
    getAuditLogs,
  };
};
