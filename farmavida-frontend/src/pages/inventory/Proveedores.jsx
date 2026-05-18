import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loading from '../../components/Common/Loading';
import '../../styles/pages/inv-productos.css';
import '../../styles/pages/core-empleados.css';

const Proveedores = () => {
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProveedor, setCurrentProveedor] = useState(null);
  const [formData, setFormData] = useState({
    razon_social: '', nit: '', contacto: '', telefono: '', email: '', direccion: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const response = await api.get('/proveedores');
      setProveedores(response.data);
    } catch (error) {
      toast.error('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    p.razon_social?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nit?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.contacto?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleOpenModal = (proveedor = null) => {
    if (proveedor) {
      setCurrentProveedor(proveedor);
      setFormData({
        razon_social: proveedor.razon_social || '',
        nit: proveedor.nit || '',
        contacto: proveedor.contacto || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        direccion: proveedor.direccion || ''
      });
    } else {
      setCurrentProveedor(null);
      setFormData({
        razon_social: '', nit: '', contacto: '', telefono: '', email: '', direccion: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentProveedor) {
        await api.put(`/proveedores/${currentProveedor.id}`, formData);
        toast.success('Proveedor actualizado exitosamente');
      } else {
        await api.post('/proveedores', formData);
        toast.success('Proveedor creado exitosamente');
      }
      handleCloseModal();
      fetchProveedores();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar proveedor');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este proveedor?')) {
      try {
        await api.delete(`/proveedores/${id}`);
        toast.success('Proveedor eliminado');
        fetchProveedores();
      } catch (error) {
        toast.error('Error al eliminar proveedor');
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="prod-container">
      <div className="prod-header">
        <h1 className="prod-title">Directorio de Proveedores</h1>
        <div>
          <button onClick={fetchProveedores} className="emp-refresh-btn">Actualizar</button>
          <button onClick={() => handleOpenModal()} className="emp-add-btn" style={{backgroundColor:'var(--fv-primary)'}}>+ Nuevo Proveedor</button>
        </div>
      </div>

      <div className="prod-search-box">
        <input
          type="text"
          placeholder="Buscar por Razón Social, NIT o Contacto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="prod-search-input"
        />
      </div>

      <div className="prod-table-container">
        <table className="prod-table">
          <thead>
            <tr>
              <th>Razón Social / NIT</th>
              <th>Contacto Principal</th>
              <th>Información de Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="prod-empty">No se encontraron proveedores</td>
              </tr>
            ) : (
              proveedoresFiltrados.map((proveedor) => (
                <tr key={proveedor.id}>
                  <td>
                    <div style={{fontWeight: '500', color: 'var(--fv-gray-900)'}}>{proveedor.razon_social}</div>
                    <div style={{fontSize: '0.875rem', color: 'var(--fv-gray-500)'}}>NIT: {proveedor.nit || 'S/N'}</div>
                  </td>
                  <td style={{color: 'var(--fv-gray-800)'}}>
                    {proveedor.contacto || '-'}
                  </td>
                  <td>
                    <div style={{fontSize: '0.875rem'}}>📞 {proveedor.telefono || '-'}</div>
                    <div style={{fontSize: '0.875rem'}}>📧 {proveedor.email || '-'}</div>
                    {proveedor.direccion && (
                      <div style={{fontSize: '0.75rem', color: 'var(--fv-gray-500)', marginTop: '4px'}}>
                        📍 {proveedor.direccion}
                      </div>
                    )}
                  </td>
                  <td>
                    <button className="emp-action-btn" onClick={() => handleOpenModal(proveedor)}>Editar</button>
                    <button className="emp-action-btn emp-action-btn--delete" onClick={() => handleDelete(proveedor.id)}>Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="emp-modal-overlay">
          <div className="emp-modal-content">
            <div className="emp-modal-header">
              <h2>{currentProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
              <button onClick={handleCloseModal} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="emp-form-grid">
                <div className="emp-form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="emp-form-label">Razón Social *</label>
                  <input type="text" required value={formData.razon_social} onChange={(e) => setFormData({...formData, razon_social: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">NIT</label>
                  <input type="text" value={formData.nit} onChange={(e) => setFormData({...formData, nit: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Persona de Contacto</label>
                  <input type="text" value={formData.contacto} onChange={(e) => setFormData({...formData, contacto: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group" style={{gridColumn: '1 / -1'}}>
                  <label className="emp-form-label">Dirección</label>
                  <input type="text" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} className="emp-form-input" />
                </div>
              </div>
              
              <div className="emp-modal-actions">
                <button type="button" onClick={handleCloseModal} className="emp-btn-cancel">Cancelar</button>
                <button type="submit" className="emp-btn-save">{currentProveedor ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proveedores;
