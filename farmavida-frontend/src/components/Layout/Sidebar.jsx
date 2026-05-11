import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CubeIcon, 
  ExclamationTriangleIcon,
  ShoppingCartIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import '../../styles/components/lay-sidebar.css';

const navigation = [
  { name: 'Dashboard', to: '/', icon: HomeIcon },
  { name: 'Productos', to: '/productos', icon: ClipboardDocumentListIcon },
  { name: 'Lotes', to: '/inventory/lotes', icon: CubeIcon },
  { name: 'Alertas', to: '/inventory/alertas', icon: ExclamationTriangleIcon },
  { name: 'Ventas', to: '/sales/nueva', icon: ShoppingCartIcon },
  { name: 'Recetas', to: '/sales/recetas', icon: DocumentTextIcon },
  { name: 'Clientes', to: '/sales/clientes', icon: UserGroupIcon },
  { name: 'Reportes', to: '/reports', icon: ChartBarIcon },
];

const Sidebar = () => {
  return (
    <div className="side-container">
      <div className="side-header">
        <h1 className="side-title">FarmaVida</h1>
        <p className="side-subtitle">Sistema de Gestión</p>
      </div>
      <nav className="side-nav">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              `side-nav-item ${isActive ? 'side-nav-item--active' : ''}`
            }
          >
            <item.icon className="side-nav-icon" />
            <span className="side-nav-text">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="side-footer">
        <p>© 2024 FarmaVida</p>
      </div>
    </div>
  );
};

export default Sidebar;