import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Login } from '../pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, isLoading, user, hasPermission } = useAuth();
  const [hasRequiredPermission, setHasRequiredPermission] = React.useState<boolean | null>(null);
  const navigate = useNavigate();



  React.useEffect(() => {
    const checkPermission = async () => {
      if (requiredPermission && isAuthenticated) {
        const permission = await hasPermission(requiredPermission);
        setHasRequiredPermission(permission);
      } else {
        setHasRequiredPermission(true);
      }
    };

    checkPermission();
  }, [requiredPermission, isAuthenticated, hasPermission]);

  // Redirect to dashboard when authenticated and no specific route
  React.useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {
      // Force a page reload to ensure state is properly updated
      window.location.href = '/';
    }} />;
  }

  if (requiredPermission && hasRequiredPermission === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <p className="text-sm text-gray-500">
            Seu papel atual: <span className="font-medium">{user?.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
