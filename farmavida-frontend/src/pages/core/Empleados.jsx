import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import Loading from '../../components/Common/Loading';
import '../../styles/pages/core-empleados.css';

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmp, setCurrentEmp] = useState(null);
  const [formData, setFormData] = useState({
    ci: '',
    nombres: '',
    apellidos: '',
    usuario: '',
    password: '',
    rol: 'cajero',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const fetchEmpleados = async () => {
    try {
      const response = await api.get('/empleados');
      setEmpleados(response.data);
    } catch (error) {
      toast.error('Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setCurrentEmp(emp);
      setFormData({
        ci: emp.ci || '',
        nombres: emp.nombres || '',
        apellidos: emp.apellidos || '',
        usuario: emp.usuario || '',
        password: '',
        rol: emp.rol || 'cajero',
        email: emp.email || '',
        telefono: emp.telefono || ''
      });
    } else {
      setCurrentEmp(null);
      setFormData({
        ci: '', nombres: '', apellidos: '', usuario: '', password: '', rol: 'cajero', email: '', telefono: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentEmp) {
        await api.put(`/empleados/${currentEmp.id}`, formData);
        toast.success('Empleado actualizado');
      } else {
        await api.post('/empleados', formData);
        toast.success('Empleado creado');
      }
      handleCloseModal();
      fetchEmpleados();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Desactivar este empleado?')) {
      try {
        await api.delete(`/empleados/${id}`);
        toast.success('Empleado desactivado');
        fetchEmpleados();
      } catch (error) {
        toast.error('Error al eliminar');
      }
    }
  };

  const filtrados = empleados.filter(e => 
    e.nombres.toLowerCase().includes(busqueda.toLowerCase()) || 
    e.apellidos.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.ci.includes(busqueda)
  );

  if (loading) return <Loading />;

  return (
    <div className="emp-container">
      <div className="emp-header">
        <h1 className="emp-title">Gestión de Usuarios</h1>
        <div>
          <button className="emp-refresh-btn" onClick={fetchEmpleados}>Actualizar</button>
          <button className="emp-add-btn" onClick={() => handleOpenModal()}>+ Nuevo Usuario</button>
        </div>
      </div>

      <div className="emp-search-box">
        <input 
          type="text" 
          placeholder="Buscar por nombre, apellido o CI..." 
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="emp-search-input"
        />
      </div>

      <div className="emp-table-container">
        <table className="emp-table">
          <thead>
            <tr>
              <th>C.I.</th>
              <th>Nombre Completo</th>
              <th>Usuario / Rol</th>
              <th>Contacto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan="5" className="emp-empty">No se encontraron empleados</td></tr>
            ) : (
              filtrados.map(emp => (
                <tr key={emp.id}>
                  <td><strong>{emp.ci}</strong></td>
                  <td>{emp.nombres} {emp.apellidos}</td>
                  <td>
                    <div style={{fontWeight: 600, color: 'var(--fv-gray-800)'}}>{emp.usuario}</div>
                    <span className={`emp-badge emp-badge--${emp.rol}`}>{emp.rol}</span>
                  </td>
                  <td>
                    <div style={{fontSize: '0.8rem'}}>{emp.telefono || 'N/A'}</div>
                    <div style={{fontSize: '0.8rem'}}>{emp.email || 'N/A'}</div>
                  </td>
                  <td>
                    <button className="emp-action-btn" onClick={() => handleOpenModal(emp)}>Editar</button>
                    <button className="emp-action-btn emp-action-btn--delete" onClick={() => handleDelete(emp.id)}>Eliminar</button>
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
              <h2>{currentEmp ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button onClick={handleCloseModal} style={{background:'none',border:'none',fontSize:'1.5rem',cursor:'pointer'}}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="emp-form-grid">
                <div className="emp-form-group">
                  <label className="emp-form-label">Cédula de Identidad *</label>
                  <input type="text" value={formData.ci} onChange={e => setFormData({...formData, ci: e.target.value})} className="emp-form-input" required />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Nombres *</label>
                  <input type="text" value={formData.nombres} onChange={e => setFormData({...formData, nombres: e.target.value})} className="emp-form-input" required />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Apellidos *</label>
                  <input type="text" value={formData.apellidos} onChange={e => setFormData({...formData, apellidos: e.target.value})} className="emp-form-input" required />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Teléfono</label>
                  <input type="text" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="emp-form-input" />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Rol *</label>
                  <select value={formData.rol} onChange={e => setFormData({...formData, rol: e.target.value})} className="emp-form-input" required>
                    <option value="cajero">Cajero</option>
                    <option value="farmaceutico">Farmacéutico</option>
                    <option value="almacenero">Almacenero</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Nombre de Usuario *</label>
                  <input type="text" value={formData.usuario} onChange={e => setFormData({...formData, usuario: e.target.value})} className="emp-form-input" required />
                </div>
                <div className="emp-form-group">
                  <label className="emp-form-label">Contraseña {currentEmp && '(dejar en blanco para mantener)'}</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="emp-form-input" required={!currentEmp} />
                </div>
              </div>
              <div className="emp-modal-actions">
                <button type="button" className="emp-btn-cancel" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="emp-btn-save">{currentEmp ? 'Actualizar' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;
