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

  // Loading otimizado com timeout
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {
      // Não recarregar a página, deixar o React gerenciar o estado
      console.log('✅ Login realizado com sucesso');
    }} />;
  }

  return <>{children}</>;
};
