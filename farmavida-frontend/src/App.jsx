import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Productos from './pages/inventory/Productos';
import Lotes from './pages/inventory/Lotes';
import AlertasVencimiento from './pages/inventory/AlertasVencimiento';
import Transferencias from './pages/inventory/Transferencias';
import Movimientos from './pages/inventory/Movimientos';
import Proveedores from './pages/inventory/Proveedores';
import Compras from './pages/inventory/Compras';
import Pedidos from './pages/sales/Pedidos';
import Recetas from './pages/sales/Recetas';
import Clientes from './pages/sales/Clientes';
import NuevaVenta from './pages/sales/NuevaVenta';
import Reportes from './pages/reports/Reportes';
import Empleados from './pages/core/Empleados';

// Componente que usa useAuth - DEBE estar dentro de AuthProvider
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

// Componente con las rutas - TAMBIÉN debe estar dentro de AuthProvider
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="productos" element={<Productos />} />
        <Route path="inventory">
          <Route path="lotes" element={<Lotes />} />
          <Route path="alertas" element={<AlertasVencimiento />} />
          <Route path="transferencias" element={<Transferencias />} />
          <Route path="movimientos" element={<Movimientos />} />
          <Route path="proveedores" element={<Proveedores />} />
          <Route path="compras" element={<Compras />} />
        </Route>
        <Route path="sales">
          <Route index element={<Pedidos />} />
          <Route path="nueva" element={<NuevaVenta />} />
          <Route path="recetas" element={<Recetas />} />
          <Route path="clientes" element={<Clientes />} />
        </Route>
        <Route path="core">
          <Route path="empleados" element={<Empleados />} />
        </Route>
        <Route path="reports" element={<Reportes />} />
      </Route>
    </Routes>
  );
};

// App principal - AuthProvider envuelve TODO
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;