import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { WhatsAppPage } from '../pages/WhatsAppPage';
import { SubscriptionPage } from '../pages/SubscriptionPage';

export const AppRouter = () => {
  // Para fins de demonstração do design, vamos considerar autenticado por padrão
  // No futuro, isso será controlado pelo estado de autenticação real
  const isAuthenticated = true;

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/whatsapp" 
        element={isAuthenticated ? <WhatsAppPage /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/subscription" 
        element={isAuthenticated ? <SubscriptionPage /> : <Navigate to="/login" />} 
      />
      
      {/* Redirects */}
      <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};
