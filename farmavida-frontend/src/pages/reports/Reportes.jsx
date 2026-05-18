import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loading from '../../components/Common/Loading';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import '../../styles/pages/inv-productos.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Reportes = () => {
  const [data, setData] = useState({
    kpis: { ventasHoy: 0, ingresosHoy: 0, totalProductos: 0 },
    ventasDiarias: [],
    topProductos: [],
    stockBajo: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportes();
  }, []);

  const fetchReportes = async () => {
    try {
      const response = await api.get('/reportes/dashboard');
      setData(response.data);
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  // Line Chart Data
  const lineChartData = {
    labels: data.ventasDiarias.map(v => {
      const d = new Date(v.fecha);
      return `${d.getDate()}/${d.getMonth()+1}`;
    }),
    datasets: [
      {
        label: 'Ingresos por Ventas (Bs)',
        data: data.ventasDiarias.map(v => v.ingresos),
        borderColor: '#059669', // var(--fv-primary)
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        tension: 0.4,
        fill: true,
      }
    ]
  };

  // Bar Chart Data
  const barChartData = {
    labels: data.topProductos.map(p => p.nombre.length > 15 ? p.nombre.substring(0, 15) + '...' : p.nombre),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: data.topProductos.map(p => p.cantidad_vendida),
        backgroundColor: '#3b82f6', // var(--fv-info)
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' }
    }
  };

  return (
    <div className="prod-container">
      <div className="prod-header">
        <h1 className="prod-title">Dashboard Gerencial</h1>
        <button onClick={fetchReportes} className="emp-refresh-btn">Actualizar Datos</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--fv-radius-lg)', boxShadow: 'var(--fv-shadow-sm)', borderLeft: '4px solid var(--fv-primary)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--fv-gray-500)', textTransform: 'uppercase' }}>Ingresos de Hoy</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--fv-gray-900)', marginTop: '0.5rem' }}>
            Bs {parseFloat(data.kpis.ingresosHoy).toFixed(2)}
          </h2>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--fv-radius-lg)', boxShadow: 'var(--fv-shadow-sm)', borderLeft: '4px solid var(--fv-info)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--fv-gray-500)', textTransform: 'uppercase' }}>Ventas de Hoy</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--fv-gray-900)', marginTop: '0.5rem' }}>
            {data.kpis.ventasHoy} <span style={{fontSize: '1rem', color: 'var(--fv-gray-400)', fontWeight: 'normal'}}>facturas</span>
          </h2>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--fv-radius-lg)', boxShadow: 'var(--fv-shadow-sm)', borderLeft: '4px solid var(--fv-warning)' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--fv-gray-500)', textTransform: 'uppercase' }}>Productos con Stock</p>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--fv-gray-900)', marginTop: '0.5rem' }}>
            {data.kpis.totalProductos}
          </h2>
        </div>

      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--fv-radius-lg)', boxShadow: 'var(--fv-shadow-sm)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--fv-gray-800)', marginBottom: '1.5rem' }}>Evolución de Ingresos (Últimos 7 días)</h3>
          <div style={{ height: '300px' }}>
            <Line options={chartOptions} data={lineChartData} />
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--fv-radius-lg)', boxShadow: 'var(--fv-shadow-sm)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--fv-gray-800)', marginBottom: '1.5rem' }}>Top 5 Vendidos del Mes</h3>
          <div style={{ height: '300px' }}>
            <Bar options={chartOptions} data={barChartData} />
          </div>
        </div>

      </div>

      {/* Stock Bajo Table */}
      <div style={{ backgroundColor: 'white', borderRadius: 'var(--fv-radius-lg)', boxShadow: 'var(--fv-shadow-sm)', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--fv-gray-200)', backgroundColor: 'var(--fv-gray-50)' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--fv-danger)' }}>⚠️ Alerta de Stock Crítico</h3>
        </div>
        
        <div className="prod-table-container" style={{ boxShadow: 'none', border: 'none', borderRadius: '0' }}>
          <table className="prod-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th style={{textAlign: 'right'}}>Stock Actual</th>
                <th style={{textAlign: 'right'}}>Stock Mínimo</th>
                <th style={{textAlign: 'center'}}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.stockBajo.length === 0 ? (
                <tr><td colSpan="5" className="prod-empty">No hay productos con stock crítico</td></tr>
              ) : (
                data.stockBajo.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{color: 'var(--fv-gray-500)'}}>{item.codigo_interno}</td>
                    <td style={{fontWeight: '500', color: 'var(--fv-gray-900)'}}>{item.nombre}</td>
                    <td style={{textAlign: 'right', fontWeight: '700', color: 'var(--fv-danger)'}}>{item.stock_total}</td>
                    <td style={{textAlign: 'right', color: 'var(--fv-gray-500)'}}>{item.stock_minimo}</td>
                    <td style={{textAlign: 'center'}}>
                      <span className="prod-badge" style={{backgroundColor: '#fee2e2', color: '#991b1b', fontSize: '0.65rem'}}>REABASTECER</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Reportes;