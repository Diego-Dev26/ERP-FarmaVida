import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loading from '../../components/Common/Loading';
import '../../styles/pages/inv-productos.css';
import '../../styles/pages/core-empleados.css';

const Compras = () => {
  const [proveedores, setProveedores] = useState([]);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [proveedorId, setProveedorId] = useState('');
  const [ubicacionId, setUbicacionId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [detalles, setDetalles] = useState([]);

  const [currentItem, setCurrentItem] = useState({
    producto_id: '',
    codigo_lote: '',
    fecha_fabricacion: '',
    fecha_caducidad: '',
    cantidad: 1,
    precio_compra: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [provRes, ubiRes, prodRes] = await Promise.all([
        api.get('/proveedores'),
        api.get('/ubicaciones'),
        api.get('/productos')
      ]);
      setProveedores(provRes.data);
      setUbicaciones(ubiRes.data);
      setProductos(prodRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!currentItem.producto_id || !currentItem.codigo_lote || !currentItem.fecha_caducidad || currentItem.cantidad <= 0 || currentItem.precio_compra < 0) {
      toast.error('Complete los datos del lote correctamente');
      return;
    }

    const producto = productos.find(p => p.id === parseInt(currentItem.producto_id));

    setDetalles([...detalles, { 
      ...currentItem, 
      producto_nombre: producto.nombre,
      producto_codigo: producto.codigo_interno
    }]);

    setCurrentItem({
      producto_id: '',
      codigo_lote: '',
      fecha_fabricacion: '',
      fecha_caducidad: '',
      cantidad: 1,
      precio_compra: 0
    });
  };

  const handleRemoveItem = (index) => {
    const newDetalles = [...detalles];
    newDetalles.splice(index, 1);
    setDetalles(newDetalles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proveedorId || !ubicacionId || detalles.length === 0) {
      toast.error('Datos incompletos o sin productos');
      return;
    }

    try {
      await api.post('/compras', { proveedor_id: proveedorId, ubicacion_id: ubicacionId, observaciones, detalles });
      toast.success('Compra registrada exitosamente');
      setProveedorId(''); setUbicacionId(''); setObservaciones(''); setDetalles([]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar la compra');
    }
  };

  const totalCompra = detalles.reduce((sum, item) => sum + (item.cantidad * item.precio_compra), 0);

  if (loading) return <Loading />;

  return (
    <div className="prod-container">
      <div className="prod-header">
        <h1 className="prod-title">Ingreso de Compras</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--fv-radius-lg)', border: '1px solid var(--fv-gray-200)', boxShadow: 'var(--fv-shadow-sm)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid var(--fv-gray-200)', paddingBottom: '0.5rem' }}>Datos de la Factura</h2>
          
          <div className="emp-form-group" style={{ marginBottom: '1rem' }}>
            <label className="emp-form-label">Proveedor</label>
            <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="emp-form-input">
              <option value="">-- Seleccionar --</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.razon_social}</option>)}
            </select>
          </div>
          <div className="emp-form-group" style={{ marginBottom: '1rem' }}>
            <label className="emp-form-label">Ubicación Destino</label>
            <select value={ubicacionId} onChange={(e) => setUbicacionId(e.target.value)} className="emp-form-input">
              <option value="">-- Seleccionar --</option>
              {ubicaciones.map(u => <option key={u.id} value={u.id}>{u.sucursal_nombre} - {u.nombre}</option>)}
            </select>
          </div>
          <div className="emp-form-group" style={{ marginBottom: '1rem' }}>
            <label className="emp-form-label">Observaciones</label>
            <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} className="emp-form-input" rows="2"></textarea>
          </div>

          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid var(--fv-gray-200)', textAlign: 'center' }}>
            <p style={{ fontSize: '1rem', color: 'var(--fv-gray-600)', marginBottom: '0.5rem' }}>Total Ingreso</p>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--fv-primary)', marginBottom: '1.5rem' }}>Bs {totalCompra.toFixed(2)}</h3>
            <button onClick={handleSubmit} className="emp-btn-save" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>Registrar Compra</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--fv-radius-lg)', border: '1px solid var(--fv-gray-200)', boxShadow: 'var(--fv-shadow-sm)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', borderBottom: '1px solid var(--fv-gray-200)', paddingBottom: '0.5rem' }}>Agregar Lote de Producto</h2>
            
            <div className="emp-form-grid" style={{ marginBottom: '1rem' }}>
              <div className="emp-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="emp-form-label">Producto *</label>
                <select value={currentItem.producto_id} onChange={(e) => setCurrentItem({...currentItem, producto_id: e.target.value})} className="emp-form-input">
                  <option value="">-- Buscar y Seleccionar --</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.codigo_interno} - {p.nombre}</option>)}
                </select>
              </div>
              <div className="emp-form-group">
                <label className="emp-form-label">Código Lote *</label>
                <input type="text" value={currentItem.codigo_lote} onChange={(e) => setCurrentItem({...currentItem, codigo_lote: e.target.value.toUpperCase()})} className="emp-form-input" />
              </div>
              <div className="emp-form-group">
                <label className="emp-form-label">Fecha Caducidad *</label>
                <input type="date" value={currentItem.fecha_caducidad} onChange={(e) => setCurrentItem({...currentItem, fecha_caducidad: e.target.value})} className="emp-form-input" />
              </div>
              <div className="emp-form-group">
                <label className="emp-form-label">Cantidad *</label>
                <input type="number" min="1" value={currentItem.cantidad} onChange={(e) => setCurrentItem({...currentItem, cantidad: parseInt(e.target.value) || 0})} className="emp-form-input" />
              </div>
              <div className="emp-form-group">
                <label className="emp-form-label">Precio Compra Unitario *</label>
                <input type="number" min="0" step="0.1" value={currentItem.precio_compra} onChange={(e) => setCurrentItem({...currentItem, precio_compra: parseFloat(e.target.value) || 0})} className="emp-form-input" />
              </div>
            </div>
            <button onClick={handleAddItem} className="emp-refresh-btn" style={{ margin: 0 }}>+ Añadir a la lista</button>
          </div>

          <div className="prod-table-container">
            <table className="prod-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Lote / Vencimiento</th>
                  <th style={{ textAlign: 'right' }}>Cant.</th>
                  <th style={{ textAlign: 'right' }}>Costo U.</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {detalles.length === 0 ? (
                  <tr><td colSpan="6" className="prod-empty">No hay lotes ingresados</td></tr>
                ) : (
                  detalles.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '500', color: 'var(--fv-gray-800)' }}>
                        {item.producto_nombre}
                        <div style={{ fontSize: '0.75rem', color: 'var(--fv-gray-500)', fontWeight: 'normal' }}>{item.producto_codigo}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{item.codigo_lote}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--fv-danger)' }}>Exp: {item.fecha_caducidad}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '500' }}>{item.cantidad}</td>
                      <td style={{ textAlign: 'right' }}>Bs {item.precio_compra.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--fv-gray-900)' }}>Bs {(item.cantidad * item.precio_compra).toFixed(2)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => handleRemoveItem(index)} className="emp-action-btn emp-action-btn--delete" style={{ margin: 0 }}>✕</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compras;
