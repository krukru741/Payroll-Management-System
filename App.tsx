import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Payroll from './pages/Payroll';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { canAccessRoute } from './utils/rbac';

// Placeholder components for routes not yet implemented
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-96 text-gray-400">
    <div className="text-6xl mb-4">🚧</div>
    <h2 className="text-2xl font-bold text-gray-600">{title}</h2>
    <p>This module is currently under development.</p>
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children, path }: { children: React.ReactNode, path: string }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  if (user && !canAccessRoute(user.role, path)) {
    return <Navigate to="/" replace />; // Or to a 403 Forbidden page
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        {/* Protected Routes based on Role */}
        <Route path="/employees" element={
          <ProtectedRoute path="/employees">
            <Employees />
          </ProtectedRoute>
        } />
        
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/attendance" element={<Placeholder title="Attendance" />} />
        <Route path="/reports" element={<Placeholder title="Reports" />} />
        <Route path="/documents" element={<Placeholder title="Documents" />} />
        <Route path="/settings" element={<Placeholder title="Settings" />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DataProvider>
          <Router>
            <AppContent />
          </Router>
        </DataProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;