import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loading from '../../components/Common/Loading';
import '../../styles/pages/inv-productos.css';

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const response = await api.get('/productos');
      setProductos(response.data);
    } catch (error) {
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.codigo_interno?.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="prod-container">
      <div className="prod-header">
        <h1 className="prod-title">Productos</h1>
        <button onClick={fetchProductos} className="prod-refresh-btn">
          Actualizar
        </button>
      </div>

      <div className="prod-search-box">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="prod-search-input"
        />
      </div>

      <div className="prod-table-container">
        <table className="prod-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Receta</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="prod-empty">No hay productos</td>
              </tr>
            ) : (
              productosFiltrados.map((producto) => (
                <tr key={producto.id}>
                  <td>{producto.codigo_interno}</td>
                  <td>
                    <div className="font-medium text-gray-900">{producto.nombre}</div>
                    {producto.nombre_comercial && (
                      <div className="text-xs text-gray-500">{producto.nombre_comercial}</div>
                    )}
                  </td>
                  <td className="font-medium text-green-600">Bs {producto.precio_venta}</td>
                  <td>
                    {producto.requiere_receta ? (
                      <span className="prod-badge-receta">Requiere receta</span>
                    ) : (
                      <span className="prod-badge--normal">Venta libre</span>
                    )}
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

export default Productos;