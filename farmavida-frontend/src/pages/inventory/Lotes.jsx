import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Loading from '../../components/Common/Loading';
import '../../styles/pages/inv-lotes.css';

const Lotes = () => {
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      const response = await api.get('/inventory/lotes');
      setLotes(response.data);
    } catch (error) {
      toast.error('Error al cargar los lotes');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoClass = (estado, fechaCaducidad) => {
    if (estado === 'vencido') return 'inv-badge inv-badge--vencido';
    if (new Date(fechaCaducidad) < new Date()) return 'inv-badge inv-badge--vencido';
    if (estado === 'agotado') return 'inv-badge inv-badge--agotado';
    const diasRestantes = Math.ceil((new Date(fechaCaducidad) - new Date()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 30) return 'inv-badge inv-badge--proximo';
    return 'inv-badge inv-badge--activo';
  };

  const getEstadoTexto = (estado, fechaCaducidad) => {
    if (estado === 'vencido') return 'Vencido';
    if (estado === 'agotado') return 'Agotado';
    if (new Date(fechaCaducidad) < new Date()) return 'Vencido';
    const diasRestantes = Math.ceil((new Date(fechaCaducidad) - new Date()) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 30) return `Próximo (${diasRestantes}d)`;
    return 'Activo';
  };

  const getStockClass = (cantidad, stockMinimo) => {
    if (cantidad === 0) return 'inv-stock inv-stock--out';
    if (cantidad <= stockMinimo) return 'inv-stock inv-stock--low';
    return 'inv-stock';
  };

  const lotesFiltrados = lotes.filter(lote =>
    lote.producto?.toLowerCase().includes(filtro.toLowerCase()) ||
    lote.codigo_lote?.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="inv-container">
      <div className="inv-header">
        <h1 className="inv-title">Gestión de Lotes</h1>
        <button onClick={fetchLotes} className="inv-btn-primary">
          Actualizar
        </button>
      </div>

      <div className="inv-search-box">
        <input
          type="text"
          placeholder="Buscar por producto o código de lote..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="inv-search-input"
        />
      </div>

      <div className="inv-table-container">
        <table className="inv-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Código Lote</th>
              <th>Stock</th>
              <th>Fecha Caducidad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lotesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="inv-empty">No hay lotes registrados</td>
              </tr>
            ) : (
              lotesFiltrados.map((lote) => (
                <tr key={lote.id}>
                  <td>
                    <div className="inv-product-name">{lote.producto}</div>
                    <div className="inv-product-code">{lote.codigo_interno}</div>
                  </td>
                  <td className="font-mono text-sm">{lote.codigo_lote}</td>
                  <td>
                    <span className={getStockClass(lote.cantidad_actual, lote.stock_minimo || 5)}>
                      {lote.cantidad_actual} und
                    </span>
                    {lote.cantidad_actual <= (lote.stock_minimo || 5) && lote.cantidad_actual > 0 && (
                      <span className="inv-badge inv-badge--proximo" style={{ marginLeft: '8px', fontSize: '10px' }}>
                        Stock bajo
                      </span>
                    )}
                  </td>
                  <td>
                    {format(new Date(lote.fecha_caducidad), 'dd/MM/yyyy', { locale: es })}
                    {new Date(lote.fecha_caducidad) < new Date() && (
                      <span className="inv-badge inv-badge--vencido" style={{ marginLeft: '8px', fontSize: '10px' }}>
                        Vencido
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={getEstadoClass(lote.estado, lote.fecha_caducidad)}>
                      {getEstadoTexto(lote.estado, lote.fecha_caducidad)}
                    </span>
                  </td>
                  <td>
                    <button className="inv-btn-edit">Editar</button>
                    <button className="inv-btn-movements">Movimientos</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Lotes;