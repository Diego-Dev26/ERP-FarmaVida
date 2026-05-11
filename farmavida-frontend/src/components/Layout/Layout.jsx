import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import '../../styles/components/lay-layout.css';

const Layout = () => {
  return (
    <div className="lay-container">
      <Sidebar />
      <div className="lay-main">
        <Navbar />
        <main className="lay-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;