const pool = require('../config/database');
const bcrypt = require('bcryptjs');

exports.getAllEmpleados = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, ci, nombres, apellidos, usuario, rol, email, telefono, estado, created_at
      FROM empleados
      WHERE estado = 1
      ORDER BY apellidos ASC, nombres ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createEmpleado = async (req, res) => {
  const { ci, nombres, apellidos, usuario, password, rol, email, telefono } = req.body;
  
  if (!ci || !nombres || !apellidos || !usuario || !password) {
    return res.status(400).json({ message: 'Datos incompletos requeridos' });
  }
  
  try {
    const [exist] = await pool.execute('SELECT id FROM empleados WHERE ci = ? OR usuario = ?', [ci, usuario]);
    if (exist.length > 0) {
      return res.status(400).json({ message: 'El CI o el usuario ya están en uso' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const [result] = await pool.execute(`
      INSERT INTO empleados (ci, nombres, apellidos, usuario, password, rol, email, telefono)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [ci, nombres, apellidos, usuario, hashedPassword, rol || 'cajero', email || null, telefono || null]);
    
    res.status(201).json({ message: 'Empleado creado exitosamente' });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.updateEmpleado = async (req, res) => {
  const { id } = req.params;
  const { ci, nombres, apellidos, usuario, password, rol, email, telefono } = req.body;
  
  try {
    const [emp] = await pool.execute('SELECT id, password FROM empleados WHERE id = ?', [id]);
    if (emp.length === 0) {
      return res.status(404).json({ message: 'Empleado no encontrado' });
    }
    
    let passToSave = emp[0].password;
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      passToSave = await bcrypt.hash(password, salt);
    }
    
    await pool.execute(`
      UPDATE empleados SET 
        ci = ?, nombres = ?, apellidos = ?, usuario = ?, password = ?, rol = ?, email = ?, telefono = ?
      WHERE id = ?
    `, [ci, nombres, apellidos, usuario, passToSave, rol, email, telefono, id]);
    
    res.json({ message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.deleteEmpleado = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('UPDATE empleados SET estado = 0 WHERE id = ?', [id]);
    res.json({ message: 'Empleado desactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
