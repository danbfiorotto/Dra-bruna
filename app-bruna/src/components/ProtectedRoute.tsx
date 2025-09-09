import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Login } from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  console.log('🔍 ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);

  if (isLoading) {
    console.log('⏳ Mostrando loading...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🔐 Mostrando tela de login...');
    return <Login onLoginSuccess={() => {
      console.log('✅ Login realizado, recarregando página...');
      window.location.reload();
    }} />;
  }

  console.log('✅ Usuário autenticado, mostrando app...');
  return <>{children}</>;
};
