import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loading from '../../components/Common/Loading';
import '../../styles/pages/inv-productos.css'; // Reusing the beautiful original style
import '../../styles/pages/core-empleados.css'; // Reusing modal styles

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCliente, setCurrentCliente] = useState(null);
  const [formData, setFormData] = useState({
    documento: '', tipo_documento: 'CI', nombres: '', apellidos: '', telefono: '', email: '', direccion: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(c =>
    c.documento?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.nombres?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.apellidos?.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setCurrentCliente(cliente);
      setFormData({
        documento: cliente.documento || '',
        tipo_documento: cliente.tipo_documento || 'CI',
        nombres: cliente.nombres || '',
        apellidos: cliente.apellidos || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || ''
      });
    } else {
      setCurrentCliente(null);
      setFormData({
        documento: '', tipo_documento: 'CI', nombres: '', apellidos: '', telefono: '', email: '', direccion: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCliente) {
        await api.put(`/clientes/${currentCliente.id}`, formData);
        toast.success('Cliente actualizado exitosamente');
      } else {
        await api.post('/clientes', formData);
        toast.success('Cliente creado exitosamente');
      }
      handleCloseModal();
      fetchClientes();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar cliente');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await api.delete(`/clientes/${id}`);
        toast.success('Cliente eliminado');
        fetchClientes();
      } catch (error) {
        toast.error('Error al eliminar cliente');
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="prod-container">
      <div className="prod-header">
        <h1 className="prod-title">Gestión de Clientes</h1>
        <div>
          <button onClick={fetchClientes} className="emp-refresh-btn">Actualizar</button>
          <button onClick={() => handleOpenModal()} className="emp-add-btn">+ Nuevo Cliente</button>
        </div>
      </div>

      <div className="prod-search-box">
        <input
          type="text"
          placeholder="Buscar por documento, nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="prod-search-input"
        />
      </div>

      <div className="prod-table-container">
        <table className="prod-table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombre Completo</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan="4" className="prod-empty">No se encontraron clientes</td>
              </tr>
            ) : (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.id}>
                  <td>
                    <div style={{fontWeight: '600', color: 'var(--fv-gray-800)'}}>{cliente.documento}</div>
                    <span style={{fontSize: '0.75rem', color: 'var(--fv-gray-500)'}}>{cliente.tipo_documento}</span>
                  </td>
                  <td>
                    <div style={{fontWeight: '500', color: 'var(--fv-gray-900)'}}>{cliente.apellidos}, {cliente.nombres}</div>
                    {cliente.direccion && <div style={{fontSize: '0.8rem', color: 'var(--fv-gray-500)'}}>{cliente.direccion}</div>}
                  </td>
                  <td>
                    <div style={{fontSize: '0.875rem'}}>{cliente.telefono || '-'}</div>
                    <div style={{fontSize: '0.875rem', color: 'var(--fv-gray-500)'}}>{cliente.email || '-'}</div>
                  </td>
                  <td>
                    <button className="emp-action-btn" onClick={() => handleOpenModal(cliente)}>Editar</button>
                    <button className="emp-action-btn emp-action-btn--delete" onClick={() => handleDelete(cliente.id)}>Eliminar</button>
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
              <h2>{currentCliente ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
              <button onClick={handleCloseModal} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}}>&times;</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="emp-form-grid">
                <div className="emp-form-group">
                  <label className="emp-form-label">Tipo Doc.</label>
                  <select name="tipo_documento" value={formData.tipo_documento} onChange={(e) => setFormData({...formData, tipo_documento: e.target.value})} className="emp-form-input">
                    <option value="CI">Cédula de Identidad (CI)</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Documento *</label>
                  <input type="text" required value={formData.documento} onChange={(e) => setFormData({...formData, documento: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Nombres *</label>
                  <input type="text" required value={formData.nombres} onChange={(e) => setFormData({...formData, nombres: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Apellidos *</label>
                  <input type="text" required value={formData.apellidos} onChange={(e) => setFormData({...formData, apellidos: e.target.value})} className="emp-form-input" />
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
                <button type="submit" className="emp-btn-save">{currentCliente ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;