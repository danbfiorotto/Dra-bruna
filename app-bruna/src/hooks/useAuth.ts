import React, { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

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
  
  // Cache local para evitar consultas desnecessárias
  const [profileCache, setProfileCache] = useState<Map<string, User>>(new Map());

  // Load authentication state from Supabase session
  React.useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🔍 Inicializando autenticação...');
        
        // Get initial session with timeout
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000) // Reduzido para 5s
        );
        
        const { data: { session }, error: sessionError } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ]) as any;
        
        if (sessionError) {
          console.error('❌ Erro ao obter sessão:', sessionError);
          if (isMounted) {
            setIsLoading(false);
          }
          return;
        }
        
        console.log('📊 Sessão atual:', session);
        
        if (session?.user && isMounted) {
          console.log('👤 Usuário encontrado na sessão:', session.user);
          
          // Get user profile with timeout
          const profilePromise = supabase
            .from('profiles')
            .select('id, email, name, role, active, created_at, updated_at')
            .eq('id', session.user.id)
            .single();

          const profileTimeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile timeout')), 3000) // Reduzido para 3s
          );

          const { data: profile, error: profileError } = await Promise.race([
            profilePromise,
            profileTimeoutPromise
          ]) as any;

          if (profileError) {
            console.error('❌ Erro ao obter perfil:', profileError);
            if (isMounted) {
              setIsLoading(false);
            }
            return;
          }
          
          console.log('📋 Perfil do usuário:', profile);

          if (profile && isMounted) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name || '',
              role: profile.role as 'admin',
              active: profile.active,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            });
            setIsAuthenticated(true);
            console.log('✅ Usuário autenticado com sucesso');
          }
        } else {
          console.log('ℹ️ Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Timeout de segurança reduzido
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.log('⏰ Timeout de segurança - parando loading');
        setIsLoading(false);
      }
    }, 5000); // Reduzido para 5 segundos

    // Listen for auth changes - Otimizado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (!isMounted) return;
      
      console.log('🔄 Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('🔐 Processando SIGNED_IN...');
        
        // Evitar consulta duplicada se já temos o usuário
        if (user && user.id === session.user.id) {
          console.log('✅ Usuário já carregado, pulando consulta');
          return;
        }
        
        try {
          // Get user profile with timeout reduzido
          const profilePromise = supabase
            .from('profiles')
            .select('id, email, name, role, active, created_at, updated_at')
            .eq('id', session.user.id)
            .single();

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile timeout')), 2000) // Reduzido para 2s
          );

          const { data: profile, error: profileError } = await Promise.race([
            profilePromise,
            timeoutPromise
          ]) as any;

          if (profileError) {
            console.error('❌ Erro ao obter perfil no state change:', profileError);
            if (isMounted) {
              setIsLoading(false);
            }
            return;
          }

          if (profile && isMounted) {
            const userData = {
              id: profile.id,
              email: profile.email,
              name: profile.name || '',
              role: profile.role as 'admin',
              active: profile.active,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            };
            
            setUser(userData);
            setIsAuthenticated(true);
            setIsLoading(false);
            console.log('✅ Usuário autenticado via state change');
          }
        } catch (error) {
          console.error('❌ Erro no processamento SIGNED_IN:', error);
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
          console.log('🚪 Usuário deslogado');
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token atualizado');
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // Login function - Otimizada
  const login = useCallback(async (email: string, password: string): Promise<LoginResponse | null> => {
    try {
      console.log('🔐 Iniciando login para:', email);
      setIsLoading(true);
      
      // Sign in with Supabase com timeout
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const authTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000) // 5s timeout
      );

      const { data: authData, error: authError } = await Promise.race([
        authPromise,
        authTimeoutPromise
      ]) as any;

      if (authError) {
        console.error('❌ Erro de autenticação:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('❌ Nenhum usuário retornado da autenticação');
        throw new Error('No user returned from authentication');
      }

      console.log('✅ Usuário autenticado:', authData.user);

      // Get user profile com timeout
      const profilePromise = supabase
        .from('profiles')
        .select('id, email, name, role, active, created_at, updated_at')
        .eq('id', authData.user.id)
        .single();

      const profileTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile timeout')), 3000) // 3s timeout
      );

      const { data: profile, error: profileError } = await Promise.race([
        profilePromise,
        profileTimeoutPromise
      ]) as any;

      if (profileError) {
        console.error('❌ Erro ao obter perfil:', profileError);
        throw profileError;
      }
      
      if (!profile) {
        console.error('❌ Perfil do usuário não encontrado');
        throw new Error('User profile not found');
      }

      const userData: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name || '',
        role: profile.role as 'admin',
        active: profile.active,
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };

      setUser(userData);
      setIsAuthenticated(true);
      setIsLoading(false);
      console.log('✅ Login realizado com sucesso');

      return {
        user: userData,
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
        expires_at: authData.session?.expires_at ? new Date(authData.session.expires_at * 1000).toISOString() : ''
      };
    } catch (error) {
      console.error('❌ Falha no login:', error);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          const userData: User = {
            id: profile.id,
            email: profile.email,
            name: profile.name || '',
            role: profile.role as 'admin',
            active: profile.active,
            created_at: profile.created_at,
            updated_at: profile.updated_at
          };
          setUser(userData);
          setIsAuthenticated(true);
          return userData;
        }
      }
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    }
  }, []);

  // Check if user has permission for an action
  const hasPermission = useCallback(async (_action: string): Promise<boolean> => {
    if (!isAuthenticated || !user) return false;
    // For now, all authenticated users have all permissions
    // This can be extended with more granular permission checking
    return true;
  }, [isAuthenticated, user]);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    hasPermission,
  };
};
