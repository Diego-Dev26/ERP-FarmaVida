const pool = require('../config/database');

// Obtener todos los clientes activos
exports.getAllClientes = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, documento, tipo_documento, nombres, apellidos, telefono, email, direccion, estado, created_at 
      FROM clientes 
      WHERE estado = 1
      ORDER BY apellidos ASC, nombres ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener un cliente por ID o por documento (CI)
exports.getClienteByIdOrDoc = async (req, res) => {
  const { param } = req.params;
  try {
    // Buscar por ID o por documento
    const [rows] = await pool.execute(`
      SELECT 
        id, documento, tipo_documento, nombres, apellidos, telefono, email, direccion, estado, created_at 
      FROM clientes 
      WHERE (id = ? OR documento = ?) AND estado = 1
    `, [param, param]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Crear un nuevo cliente
exports.createCliente = async (req, res) => {
  const { documento, tipo_documento = 'CI', nombres, apellidos, telefono, email, direccion } = req.body;
  
  if (!documento || !nombres || !apellidos) {
    return res.status(400).json({ message: 'Documento, nombres y apellidos son requeridos' });
  }
  
  try {
    // Validar si el documento ya existe
    const [existing] = await pool.execute('SELECT id FROM clientes WHERE documento = ?', [documento]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Ya existe un cliente con ese documento' });
    }
    
    const [result] = await pool.execute(`
      INSERT INTO clientes (documento, tipo_documento, nombres, apellidos, telefono, email, direccion) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [documento, tipo_documento, nombres, apellidos, telefono || null, email || null, direccion || null]);
    
    res.status(201).json({
      message: 'Cliente creado exitosamente',
      cliente: {
        id: result.insertId,
        documento,
        tipo_documento,
        nombres,
        apellidos,
        telefono,
        email,
        direccion
      }
    });
  } catch (error) {
    console.error('Error al crear cliente:', error);
    res.status(500).json({ message: 'Error al crear cliente' });
  }
};

// Actualizar un cliente
exports.updateCliente = async (req, res) => {
  const { id } = req.params;
  const { documento, tipo_documento, nombres, apellidos, telefono, email, direccion } = req.body;
  
  if (!nombres || !apellidos) {
    return res.status(400).json({ message: 'Nombres y apellidos son requeridos' });
  }
  
  try {
    // Validar existencia
    const [cliente] = await pool.execute('SELECT * FROM clientes WHERE id = ?', [id]);
    if (cliente.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    // Si cambia el documento, verificar que no exista
    if (documento && documento !== cliente[0].documento) {
      const [existing] = await pool.execute('SELECT id FROM clientes WHERE documento = ? AND id != ?', [documento, id]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'El documento ya está en uso por otro cliente' });
      }
    }
    
    await pool.execute(`
      UPDATE clientes 
      SET 
        documento = COALESCE(?, documento),
        tipo_documento = COALESCE(?, tipo_documento),
        nombres = ?,
        apellidos = ?,
        telefono = ?,
        email = ?,
        direccion = ?
      WHERE id = ?
    `, [
      documento || cliente[0].documento, 
      tipo_documento || cliente[0].tipo_documento, 
      nombres, 
      apellidos, 
      telefono || null, 
      email || null, 
      direccion || null, 
      id
    ]);
    
    res.json({ message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar (soft delete) un cliente
exports.deleteCliente = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.execute('UPDATE clientes SET estado = 0 WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    
    res.json({ message: 'Cliente desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar cliente:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
