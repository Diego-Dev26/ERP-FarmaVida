import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loading from '../../components/Common/Loading';
import '../../styles/pages/inv-productos.css';
import '../../styles/pages/core-empleados.css';

const Transferencias = () => {
  const [ubicaciones, setUbicaciones] = useState([]);
  const [inventarioOrigen, setInventarioOrigen] = useState([]);
  const [loading, setLoading] = useState(true);

  const [ubicacionOrigen, setUbicacionOrigen] = useState('');
  const [ubicacionDestino, setUbicacionDestino] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [itemSeleccionado, setItemSeleccionado] = useState('');
  const [cantidadTransferir, setCantidadTransferir] = useState(1);

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  useEffect(() => {
    if (ubicacionOrigen) {
      fetchInventarioOrigen(ubicacionOrigen);
    } else {
      setInventarioOrigen([]);
      setItemSeleccionado('');
    }
  }, [ubicacionOrigen]);

  const fetchUbicaciones = async () => {
    try {
      const response = await api.get('/ubicaciones');
      setUbicaciones(response.data);
    } catch (error) {
      toast.error('Error al cargar ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventarioOrigen = async (id) => {
    try {
      setLoading(true);
      const response = await api.get(`/ubicaciones/${id}/inventario`);
      setInventarioOrigen(response.data);
      setItemSeleccionado('');
      setCantidadTransferir(1);
    } catch (error) {
      toast.error('Error al cargar el inventario');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ubicacionOrigen || !ubicacionDestino || !itemSeleccionado) {
      toast.error('Datos incompletos'); return;
    }
    const itemDetails = inventarioOrigen.find(i => i.inventario_id === parseInt(itemSeleccionado));
    if (!itemDetails || cantidadTransferir <= 0 || cantidadTransferir > itemDetails.cantidad) {
      toast.error('Cantidad inválida'); return;
    }

    try {
      await api.post('/transferencias', {
        ubicacion_origen_id: ubicacionOrigen,
        ubicacion_destino_id: ubicacionDestino,
        lote_id: itemDetails.lote_id,
        cantidad: cantidadTransferir,
        observaciones: observaciones
      });
      toast.success('Transferencia realizada');
      setUbicacionDestino(''); setObservaciones(''); setItemSeleccionado(''); setCantidadTransferir(1);
      fetchInventarioOrigen(ubicacionOrigen);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en transferencia');
    }
  };

  const selectedItemData = itemSeleccionado ? inventarioOrigen.find(i => i.inventario_id === parseInt(itemSeleccionado)) : null;

  if (loading && ubicaciones.length === 0) return <Loading />;

  return (
    <div className="prod-container">
      <div className="prod-header">
        <h1 className="prod-title">Transferencias de Stock</h1>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--fv-radius-lg)', border: '1px solid var(--fv-gray-200)', boxShadow: 'var(--fv-shadow-sm)' }}>
        <form onSubmit={handleSubmit}>
          
          <div className="emp-form-grid" style={{ marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'var(--fv-gray-50)', padding: '1.5rem', borderRadius: 'var(--fv-radius-md)' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--fv-gray-700)', textTransform: 'uppercase', marginBottom: '1rem' }}>📍 Origen</h3>
              <select value={ubicacionOrigen} onChange={(e) => setUbicacionOrigen(e.target.value)} className="emp-form-input" style={{ width: '100%' }}>
                <option value="">-- Seleccionar --</option>
                {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.sucursal_nombre} - {u.nombre}</option>)}
              </select>
            </div>

            <div style={{ backgroundColor: '#f0fdfa', padding: '1.5rem', borderRadius: 'var(--fv-radius-md)', border: '1px solid #ccfbf1' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--fv-primary-dark)', textTransform: 'uppercase', marginBottom: '1rem' }}>🎯 Destino</h3>
              <select value={ubicacionDestino} onChange={(e) => setUbicacionDestino(e.target.value)} className="emp-form-input" style={{ width: '100%', borderColor: '#99f6e4' }}>
                <option value="">-- Seleccionar --</option>
                {ubicaciones.map(u => <option key={u.id} value={u.id} disabled={u.id === parseInt(ubicacionOrigen)}>{u.sucursal_nombre} - {u.nombre}</option>)}
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--fv-gray-200)', paddingTop: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Detalle de la Transferencia</h3>
            
            <div className="emp-form-grid">
              <div className="emp-form-group">
                <label className="emp-form-label">Producto del Origen *</label>
                <select value={itemSeleccionado} onChange={(e) => setItemSeleccionado(e.target.value)} disabled={!ubicacionOrigen} className="emp-form-input">
                  <option value="">{inventarioOrigen.length === 0 ? '-- No hay stock --' : '-- Seleccionar --'}</option>
                  {inventarioOrigen.map(item => (
                    <option key={item.inventario_id} value={item.inventario_id}>
                      {item.codigo_interno} - {item.producto_nombre} (Lote: {item.codigo_lote} | Disp: {item.cantidad})
                    </option>
                  ))}
                </select>
              </div>

              <div className="emp-form-group">
                <label className="emp-form-label">Cantidad a Mover *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="number" min="1" max={selectedItemData?.cantidad || 1} value={cantidadTransferir} onChange={(e) => setCantidadTransferir(parseInt(e.target.value) || 0)} disabled={!itemSeleccionado} className="emp-form-input" style={{ flex: 1 }} />
                  {selectedItemData && <span style={{ fontSize: '0.875rem', color: 'var(--fv-gray-500)' }}>/ {selectedItemData.cantidad} máx</span>}
                </div>
              </div>
            </div>

            {selectedItemData && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: 'var(--fv-radius-sm)', border: '1px solid #bfdbfe', fontSize: '0.875rem', color: '#1e3a8a' }}>
                <strong>Lote:</strong> {selectedItemData.codigo_lote} | <strong>Vencimiento:</strong> {selectedItemData.fecha_caducidad}
              </div>
            )}
          </div>

          <div className="emp-form-group" style={{ marginBottom: '2rem' }}>
            <label className="emp-form-label">Observaciones</label>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="emp-form-input" rows="2" placeholder="Motivo de la transferencia..."></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" disabled={!ubicacionOrigen || !ubicacionDestino || !itemSeleccionado} className="emp-btn-save" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              Ejecutar Transferencia
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Transferencias;