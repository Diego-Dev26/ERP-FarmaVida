import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import '../../styles/pages/inv-alertas.css';

const AlertasVencimiento = () => {
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todas');

  useEffect(() => {
    fetchAlertas();
  }, []);

  const fetchAlertas = async () => {
    try {
      const response = await api.get('/inventory/alertas');
      setAlertas(response.data);
    } catch (error) {
      toast.error('Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  const marcarAtendida = async (alertaId) => {
    try {
      await api.put(`/inventory/alertas/${alertaId}/atender`);
      toast.success('Alerta marcada como atendida');
      fetchAlertas();
    } catch (error) {
      toast.error('Error al actualizar alerta');
    }
  };

  const getNivelClass = (dias) => {
    if (dias <= 0) return 'alert-level alert-level--expired';
    if (dias <= 7) return 'alert-level alert-level--critical';
    if (dias <= 15) return 'alert-level alert-level--high';
    return 'alert-level alert-level--medium';
  };

  const getNivelTexto = (dias) => {
    if (dias <= 0) return 'VENCIDO';
    if (dias <= 7) return 'CRÍTICO';
    if (dias <= 15) return 'ALTO';
    return 'MEDIO';
  };

  const getCardClass = (dias) => {
    if (dias <= 0) return 'alert-card alert-card--expired';
    if (dias <= 7) return 'alert-card alert-card--critical';
    if (dias <= 15) return 'alert-card alert-card--high';
    return 'alert-card alert-card--medium';
  };

  const alertasFiltradas = alertas.filter(alerta => {
    if (filtro === 'todas') return true;
    if (filtro === 'criticas') return alerta.dias_restantes <= 7 && alerta.dias_restantes > 0;
    if (filtro === 'vencidas') return alerta.dias_restantes <= 0;
    return true;
  });

  if (loading) {
    return (
      <div className="alert-container">
        <div className="alert-loading">Cargando alertas...</div>
      </div>
    );
  }

  return (
    <div className="alert-container">
      <div className="alert-header">
        <h1 className="alert-title">Alertas de Vencimiento</h1>
        <button onClick={fetchAlertas} className="alert-refresh-btn">
          Actualizar
        </button>
      </div>

      <div className="alert-filters">
        <div className="alert-filter-group">
          <button
            onClick={() => setFiltro('todas')}
            className={`alert-filter-btn ${filtro === 'todas' ? 'alert-filter-btn--all' : 'alert-filter-btn--default'}`}
          >
            Todas
          </button>
          <button
            onClick={() => setFiltro('criticas')}
            className={`alert-filter-btn ${filtro === 'criticas' ? 'alert-filter-btn--critical' : 'alert-filter-btn--default'}`}
          >
            Críticas (≤ 7 días)
          </button>
          <button
            onClick={() => setFiltro('vencidas')}
            className={`alert-filter-btn ${filtro === 'vencidas' ? 'alert-filter-btn--expired' : 'alert-filter-btn--default'}`}
          >
            Vencidas
          </button>
        </div>
      </div>

      <div className="alert-list">
        {alertasFiltradas.length === 0 ? (
          <div className="alert-empty">
            <CheckCircleIcon className="alert-empty-icon" />
            <p className="alert-empty-text">No hay alertas de vencimiento activas</p>
          </div>
        ) : (
          alertasFiltradas.map((alerta) => (
            <div key={alerta.alerta_id || alerta.lote_id} className={getCardClass(alerta.dias_restantes)}>
              <div className="alert-card-header">
                <span className={getNivelClass(alerta.dias_restantes)}>
                  {getNivelTexto(alerta.dias_restantes)}
                </span>
                <span className="alert-lote-code">Lote: {alerta.codigo_lote}</span>
              </div>
              
              <h3 className="alert-product-name">{alerta.producto}</h3>
              
              <div className="alert-details">
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Fecha Caducidad</span>
                  <span className="alert-detail-value">
                    {format(new Date(alerta.fecha_caducidad), 'dd/MM/yyyy', { locale: es })}
                  </span>
                </div>
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Días Restantes</span>
                  <span className={`alert-detail-value ${alerta.dias_restantes <= 0 ? 'alert-detail-value--danger' : alerta.dias_restantes <= 7 ? 'alert-detail-value--warning' : ''}`}>
                    {alerta.dias_restantes <= 0 ? 'Vencido' : `${alerta.dias_restantes} días`}
                  </span>
                </div>
                <div className="alert-detail-item">
                  <span className="alert-detail-label">Stock Actual</span>
                  <span className="alert-detail-value">{alerta.stock_total || alerta.cantidad_actual || 0} unidades</span>
                </div>
              </div>
              
              {!alerta.atendido && alerta.dias_restantes > 0 && (
                <div className="alert-card-actions">
                  <button
                    onClick={() => marcarAtendida(alerta.alerta_id || alerta.lote_id)}
                    className="alert-mark-btn"
                  >
                    Marcar Atendida
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="alert-recommendations">
        <h4>Recomendaciones</h4>
        <ul>
          <li>Revise los productos próximos a vencer para aplicar descuentos promocionales</li>
          <li>Coordine con proveedores la devolución de lotes con menos de 30 días de vigencia</li>
          <li>Priorice la rotación de productos con fecha de caducidad más cercana</li>
        </ul>
      </div>
    </div>
  );
};

export default AlertasVencimiento;