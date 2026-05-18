import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import '../../styles/pages/sal-nueva-venta.css';

const NuevaVenta = () => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [sucursales, setSucursales] = useState([]);
  const [sucursalId, setSucursalId] = useState('');
  const [metodosPago, setMetodosPago] = useState([]);
  const [metodoPagoId, setMetodoPagoId] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [prodRes, cliRes, sucRes, metRes] = await Promise.all([
        api.get('/productos'),
        api.get('/clientes'),
        api.get('/sucursales'),
        api.get('/metodos-pago')
      ]);
      setProductos(prodRes.data);
      setClientes(cliRes.data);
      setSucursales(sucRes.data);
      setMetodosPago(metRes.data);
      
      if (sucRes.data.length > 0) setSucursalId(sucRes.data[0].id);
      if (metRes.data.length > 0) setMetodoPagoId(metRes.data[0].id);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error al cargar datos del sistema');
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo_interno.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find(item => item.id === producto.id);
    if (existente) {
      setCarrito(carrito.map(item =>
        item.id === producto.id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }
    toast.success(`${producto.nombre} agregado`);
  };

  const eliminarDelCarrito = (productoId) => {
    setCarrito(carrito.filter(item => item.id !== productoId));
    toast.success('Producto eliminado');
  };

  const actualizarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad < 1) {
      eliminarDelCarrito(productoId);
      return;
    }
    setCarrito(carrito.map(item =>
      item.id === productoId ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio_venta * item.cantidad), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (carrito.length === 0) {
      toast.error('Agregue productos al carrito');
      return;
    }
    
    if (!sucursalId) {
      toast.error('Seleccione una sucursal');
      return;
    }

    if (!clienteId) {
      if (!window.confirm('¿Registrar venta a nombre de Consumidor Final?')) return;
    }
    
    setLoading(true);
    
    try {
      const ventaData = {
        cliente_id: clienteId || null,
        sucursal_id: sucursalId,
        productos: carrito.map(item => ({
          producto_id: item.id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_venta
        })),
        total: calcularTotal(),
        metodo_pago_id: metodoPagoId
      };
      
      const response = await api.post('/sales', ventaData);
      toast.success(`Venta registrada exitosamente. Código: ${response.data.codigo}`);
      setCarrito([]);
      setBusqueda('');
      setClienteId('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al registrar venta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="venta-container">
      <div className="venta-header">
        <h1 className="venta-title">Punto de Venta (POS)</h1>
      </div>

      <div className="venta-grid">
        {/* Panel izquierdo - Productos */}
        <div className="venta-card">
          <div className="venta-card-header">
            <h2>Catálogo de Productos</h2>
          </div>
          <div className="venta-card-body">
            <div className="venta-search-box">
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="venta-search-input"
              />
            </div>
            <div className="venta-product-list">
              {productosFiltrados.slice(0, 30).map((producto) => (
                <div
                  key={producto.id}
                  className="venta-product-item"
                  onClick={() => agregarAlCarrito(producto)}
                >
                  <div className="venta-product-info">
                    <h4>{producto.nombre} {producto.requiere_receta && <span style={{color:'red', fontSize:'10px', marginLeft:'4px'}}>(RECETA)</span>}</h4>
                    <p>Código: {producto.codigo_interno}</p>
                  </div>
                  <div className="venta-product-price">
                    Bs {producto.precio_venta}
                  </div>
                </div>
              ))}
              {productosFiltrados.length === 0 && (
                <div className="venta-empty">No se encontraron productos</div>
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho - Carrito */}
        <div className="venta-card">
          <div className="venta-card-header">
            <h2>Detalle de Venta</h2>
          </div>
          <div className="venta-card-body">
            
            <div style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="venta-label" style={{display:'block', marginBottom:'4px', fontSize:'0.875rem', fontWeight:'500', color:'var(--fv-gray-700)'}}>Cliente</label>
                <select
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                  className="venta-search-input"
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--fv-gray-300)', borderRadius: 'var(--fv-radius-md)' }}
                >
                  <option value="">Consumidor Final (S/N)</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.documento} - {c.apellidos}, {c.nombres}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="venta-table-container" style={{ minHeight: '200px', maxHeight: '300px', overflowY: 'auto' }}>
              <table className="venta-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item) => (
                    <tr key={item.id}>
                      <td style={{fontWeight: '500', color: 'var(--fv-gray-800)'}}>{item.nombre}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value))}
                          style={{ width: '50px', padding: '4px', borderRadius: '4px', border: '1px solid var(--fv-gray-300)', textAlign: 'center' }}
                        />
                      </td>
                      <td>Bs {item.precio_venta}</td>
                      <td style={{fontWeight: '600'}}>Bs {(item.precio_venta * item.cantidad).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => eliminarDelCarrito(item.id)}
                          style={{ color: 'var(--fv-danger)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {carrito.length === 0 && (
                <div className="venta-empty" style={{padding: '32px 0'}}>Agregue productos al carrito</div>
              )}
            </div>
            
            <div className="venta-total">
              <p>Total a Pagar: <span>Bs {calcularTotal().toFixed(2)}</span></p>
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label className="venta-label" style={{display:'block', marginBottom:'4px', fontSize:'0.875rem', fontWeight:'500', color:'var(--fv-gray-700)'}}>Sucursal</label>
                <select
                  value={sucursalId}
                  onChange={(e) => setSucursalId(e.target.value)}
                  className="venta-search-input"
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--fv-gray-300)', borderRadius: 'var(--fv-radius-md)' }}
                >
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="venta-label" style={{display:'block', marginBottom:'4px', fontSize:'0.875rem', fontWeight:'500', color:'var(--fv-gray-700)'}}>Método de Pago</label>
                <select
                  value={metodoPagoId}
                  onChange={(e) => setMetodoPagoId(e.target.value)}
                  className="venta-search-input"
                  style={{ width: '100%', padding: '8px', border: '1px solid var(--fv-gray-300)', borderRadius: 'var(--fv-radius-md)' }}
                >
                  {metodosPago.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="venta-actions">
              <button
                type="button"
                onClick={() => setCarrito([])}
                className="venta-btn-secondary"
                disabled={carrito.length === 0}
              >
                Vaciar Carrito
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || carrito.length === 0}
                className="venta-btn-primary"
              >
                {loading ? 'Procesando...' : 'Confirmar y Cobrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevaVenta;