import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CubeIcon, ShoppingCartIcon, ExclamationTriangleIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import '../styles/pages/pag-dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    totalProductos: 0, 
    ventasHoy: 0, 
    alertasVencimiento: 0, 
    ingresosHoy: 0 
  });
  const [loading, setLoading] = useState(true);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Obtener productos
      const productosRes = await api.get('/productos');
      const totalProductos = productosRes.data.length;

      // Obtener alertas
      const alertasRes = await api.get('/inventory/alertas');
      const alertasVencimiento = alertasRes.data?.filter(a => a.dias_restantes <= 30 && a.dias_restantes > 0).length || 0;
      
      // Obtener estadísticas de ventas
      const statsRes = await api.get('/sales/dashboard/stats').catch(() => ({ data: { ventasHoy: 0, ingresosHoy: 0 } }));
      
      setStats({
        totalProductos,
        ventasHoy: statsRes.data?.ventasHoy || 0,
        alertasVencimiento,
        ingresosHoy: statsRes.data?.ingresosHoy || 0
      });
      
      setAlertas(alertasRes.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Productos en Stock', value: stats.totalProductos, icon: CubeIcon, iconColor: 'blue', path: '/productos' },
    { title: 'Ventas Hoy', value: stats.ventasHoy, icon: ShoppingCartIcon, iconColor: 'green', path: '/sales' },
    { title: 'Alertas Vencimiento', value: stats.alertasVencimiento, icon: ExclamationTriangleIcon, iconColor: 'red', path: '/reports' },
    { title: 'Ingresos Hoy', value: `Bs ${stats.ingresosHoy?.toLocaleString() || 0}`, icon: CurrencyDollarIcon, iconColor: 'yellow', path: '/reports' }
  ];

  if (loading) {
    return (
      <div className="dash-container">
        <div className="dash-loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="dash-container fade-in">
      <h1 className="dash-title">Dashboard</h1>
      
      <div className="dash-stats-grid">
        {statCards.map((stat, index) => (
          <div 
            key={index} 
            className="dash-stat-card" 
            onClick={() => navigate(stat.path)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s', ...({':hover': {transform: 'scale(1.02)'}}) }}
            title={`Ver detalles de ${stat.title}`}
          >
            <div className="dash-stat-content">
              <div className="dash-stat-info">
                <p>{stat.title}</p>
                <p className="dash-stat-value">{stat.value}</p>
              </div>
              <div className={`dash-stat-icon dash-stat-icon--${stat.iconColor}`}>
                <stat.icon />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <div className="dash-card-header">
            <h2>Alertas de Vencimiento</h2>
          </div>
          <div className="dash-card-body">
            {alertas.length === 0 ? (
              <div className="dash-empty">No hay alertas activas</div>
            ) : (
              <div className="dash-alerts-list">
                {alertas.map((alerta) => (
                  <div key={alerta.lote_id} className="dash-alert-item">
                    <div className="dash-alert-info">
                      <p>{alerta.producto}</p>
                      <span>Vence en {alerta.dias_restantes} días</span>
                    </div>
                    <span className="dash-alert-lote">Lote: {alerta.codigo_lote}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;