import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loading from '../../components/Common/Loading';
import '../../styles/pages/inv-productos.css';
import '../../styles/pages/core-empleados.css';

const Pedidos = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetalles, setLoadingDetalles] = useState(false);

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const response = await api.get('/sales');
      setVentas(response.data);
    } catch (error) {
      toast.error('Error al cargar el historial de ventas');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalles = async (id) => {
    setIsModalOpen(true);
    setLoadingDetalles(true);
    try {
      const response = await api.get(`/sales/${id}`);
      setSelectedVenta(response.data);
    } catch (error) {
      toast.error('Error al cargar detalles de la venta');
      setIsModalOpen(false);
    } finally {
      setLoadingDetalles(false);
    }
  };

  const ventasFiltradas = ventas.filter(v => 
    v.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.documento?.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.apellidos?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="prod-container">
      <div className="prod-header">
        <h1 className="prod-title">Historial de Ventas (Facturas)</h1>
        <button onClick={fetchVentas} className="emp-refresh-btn">Actualizar</button>
      </div>

      <div className="prod-search-box">
        <input
          type="text"
          placeholder="Buscar por código de factura, documento o cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="prod-search-input"
        />
      </div>

      <div className="prod-table-container">
        <table className="prod-table">
          <thead>
            <tr>
              <th>Factura / Fecha</th>
              <th>Cliente</th>
              <th>Sucursal</th>
              <th style={{textAlign: 'right'}}>Total</th>
              <th style={{textAlign: 'center'}}>Estado</th>
              <th style={{textAlign: 'center'}}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" className="prod-empty">No se encontraron ventas registradas</td>
              </tr>
            ) : (
              ventasFiltradas.map((venta) => (
                <tr key={venta.id}>
                  <td>
                    <div style={{fontWeight: '700', color: 'var(--fv-primary)'}}>{venta.codigo}</div>
                    <div style={{fontSize: '0.75rem', color: 'var(--fv-gray-500)'}}>{new Date(venta.fecha_pedido).toLocaleString()}</div>
                  </td>
                  <td>
                    {venta.documento ? (
                      <>
                        <div style={{fontWeight: '500', color: 'var(--fv-gray-900)'}}>{venta.apellidos}, {venta.nombres}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--fv-gray-500)'}}>CI: {venta.documento}</div>
                      </>
                    ) : (
                      <span style={{fontStyle: 'italic', color: 'var(--fv-gray-500)'}}>Consumidor Final</span>
                    )}
                  </td>
                  <td style={{fontSize: '0.875rem', color: 'var(--fv-gray-700)'}}>
                    {venta.sucursal}
                  </td>
                  <td style={{textAlign: 'right', fontWeight: '700', color: 'var(--fv-gray-900)'}}>
                    Bs {parseFloat(venta.total).toFixed(2)}
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <span className={`prod-badge ${venta.estado === 'pagado' ? 'prod-badge--normal' : ''}`} style={{textTransform:'uppercase', fontSize: '0.65rem'}}>
                      {venta.estado}
                    </span>
                  </td>
                  <td style={{textAlign: 'center'}}>
                    <button 
                      onClick={() => handleVerDetalles(venta.id)}
                      className="emp-action-btn"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-content" style={{maxWidth: '800px'}}>
            <div className="emp-modal-header">
              <h2>
                Detalle de Venta
                {selectedVenta && <span style={{color: 'var(--fv-primary)', marginLeft: '8px'}}>{selectedVenta.codigo}</span>}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}}>&times;</button>
            </div>
            
            <div style={{padding: 'var(--fv-space-2) 0'}}>
              {loadingDetalles ? (
                <div style={{textAlign:'center', padding:'2rem'}}>Cargando...</div>
              ) : selectedVenta ? (
                <div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:'1rem', backgroundColor:'var(--fv-gray-50)', padding:'1rem', borderRadius:'var(--fv-radius-md)', marginBottom:'1rem'}}>
                    <div>
                      <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--fv-gray-500)', textTransform:'uppercase'}}>Fecha</p>
                      <p style={{fontSize:'0.875rem', fontWeight:'500'}}>{new Date(selectedVenta.fecha_pedido).toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--fv-gray-500)', textTransform:'uppercase'}}>Sucursal</p>
                      <p style={{fontSize:'0.875rem', fontWeight:'500'}}>{selectedVenta.sucursal}</p>
                    </div>
                    <div>
                      <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--fv-gray-500)', textTransform:'uppercase'}}>Método Pago</p>
                      <p style={{fontSize:'0.875rem', fontWeight:'500'}}>{selectedVenta.pago ? 'Registrado' : 'Desconocido'}</p>
                    </div>
                    <div>
                      <p style={{fontSize:'0.75rem', fontWeight:'bold', color:'var(--fv-gray-500)', textTransform:'uppercase'}}>Estado</p>
                      <p style={{fontSize:'0.875rem', fontWeight:'500', color:'var(--fv-success)'}}>{selectedVenta.estado.toUpperCase()}</p>
                    </div>
                  </div>

                  <div style={{marginBottom:'1.5rem'}}>
                    <h3 style={{fontSize:'0.875rem', fontWeight:'bold', borderBottom:'1px solid var(--fv-gray-200)', paddingBottom:'0.5rem', marginBottom:'0.5rem'}}>Datos del Cliente</h3>
                    {selectedVenta.documento ? (
                      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem'}}>
                        <div><p style={{fontSize:'0.75rem', color:'var(--fv-gray-500)'}}>Nombre</p><p style={{fontSize:'0.875rem'}}>{selectedVenta.nombres} {selectedVenta.apellidos}</p></div>
                        <div><p style={{fontSize:'0.75rem', color:'var(--fv-gray-500)'}}>Documento</p><p style={{fontSize:'0.875rem'}}>{selectedVenta.documento}</p></div>
                        <div><p style={{fontSize:'0.75rem', color:'var(--fv-gray-500)'}}>Teléfono</p><p style={{fontSize:'0.875rem'}}>{selectedVenta.telefono || 'N/A'}</p></div>
                      </div>
                    ) : (
                      <p style={{fontSize:'0.875rem', fontStyle:'italic', color:'var(--fv-gray-500)'}}>Consumidor Final</p>
                    )}
                  </div>

                  <div>
                    <h3 style={{fontSize:'0.875rem', fontWeight:'bold', borderBottom:'1px solid var(--fv-gray-200)', paddingBottom:'0.5rem', marginBottom:'0.5rem'}}>Productos Vendidos</h3>
                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.875rem'}}>
                      <thead>
                        <tr style={{backgroundColor:'var(--fv-gray-100)', color:'var(--fv-gray-600)'}}>
                          <th style={{padding:'8px', textAlign:'left'}}>Producto</th>
                          <th style={{padding:'8px', textAlign:'left'}}>Lote</th>
                          <th style={{padding:'8px', textAlign:'right'}}>Cant.</th>
                          <th style={{padding:'8px', textAlign:'right'}}>Precio U.</th>
                          <th style={{padding:'8px', textAlign:'right'}}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVenta.detalles.map((detalle, idx) => (
                          <tr key={idx} style={{borderBottom:'1px solid var(--fv-gray-100)'}}>
                            <td style={{padding:'8px'}}>
                              <span style={{fontWeight:'500'}}>{detalle.producto}</span>
                              <div style={{fontSize:'0.75rem', color:'var(--fv-gray-500)'}}>{detalle.codigo_interno}</div>
                            </td>
                            <td style={{padding:'8px', color:'var(--fv-gray-600)'}}>{detalle.codigo_lote || 'N/A'}</td>
                            <td style={{padding:'8px', textAlign:'right', fontWeight:'500'}}>{detalle.cantidad}</td>
                            <td style={{padding:'8px', textAlign:'right', color:'var(--fv-gray-600)'}}>Bs {parseFloat(detalle.precio_unitario).toFixed(2)}</td>
                            <td style={{padding:'8px', textAlign:'right', fontWeight:'500', color:'var(--fv-gray-800)'}}>Bs {parseFloat(detalle.subtotal).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="4" style={{padding:'16px 8px', textAlign:'right', fontWeight:'bold', fontSize:'1rem'}}>Total a Pagar:</td>
                          <td style={{padding:'16px 8px', textAlign:'right', fontWeight:'900', color:'var(--fv-primary)', fontSize:'1.25rem'}}>Bs {parseFloat(selectedVenta.total).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{textAlign:'center', color:'var(--fv-gray-500)', padding:'2rem'}}>No se pudo cargar la información</div>
              )}
            </div>
            
            <div className="emp-modal-actions" style={{borderTop:'1px solid var(--fv-gray-200)', paddingTop:'1rem'}}>
              <button 
                onClick={() => window.print()}
                disabled={!selectedVenta}
                className="emp-btn-cancel"
                style={{display:'flex', alignItems:'center', gap:'8px'}}
              >
                🖨️ Imprimir Recibo
              </button>
              <button onClick={() => setIsModalOpen(false)} className="emp-btn-save">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pedidos;