import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import '../../styles/components/lay-navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="nav-container">
      <div className="nav-info">
        <h2>FarmaVida</h2>
        <p>Bienvenido, {user?.nombres || 'Usuario'}</p>
      </div>
      <div className="nav-actions">
        <div className="nav-user">
          <UserCircleIcon className="nav-user-icon" />
          <div className="nav-user-info">
            <p className="nav-user-name">{user?.nombres} {user?.apellidos}</p>
            <p className="nav-user-role">{user?.rol === 'admin' ? 'Administrador' : 'Usuario'}</p>
          </div>
        </div>
        <button onClick={logout} className="nav-logout-btn">
          <ArrowRightOnRectangleIcon style={{ width: '1.25rem', height: '1.25rem' }} />
          Salir
        </button>
      </div>
    </header>
  );
};

export default Navbar;