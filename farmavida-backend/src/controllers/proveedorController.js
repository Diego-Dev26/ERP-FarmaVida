const pool = require('../config/database');

exports.getAllProveedores = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, razon_social, nit, contacto, telefono, email, direccion, estado, created_at
      FROM proveedores
      WHERE estado = 1
      ORDER BY razon_social ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener proveedores:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getProveedorById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT * FROM proveedores WHERE id = ? AND estado = 1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.createProveedor = async (req, res) => {
  const { razon_social, nit, contacto, telefono, email, direccion } = req.body;
  
  if (!razon_social) {
    return res.status(400).json({ message: 'La razón social es requerida' });
  }
  
  try {
    const [result] = await pool.execute(`
      INSERT INTO proveedores (razon_social, nit, contacto, telefono, email, direccion) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [razon_social, nit || null, contacto || null, telefono || null, email || null, direccion || null]);
    
    res.status(201).json({
      message: 'Proveedor creado exitosamente',
      proveedor: {
        id: result.insertId,
        razon_social,
        nit,
        contacto,
        telefono,
        email,
        direccion
      }
    });
  } catch (error) {
    console.error('Error al crear proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.updateProveedor = async (req, res) => {
  const { id } = req.params;
  const { razon_social, nit, contacto, telefono, email, direccion } = req.body;
  
  if (!razon_social) {
    return res.status(400).json({ message: 'La razón social es requerida' });
  }
  
  try {
    const [proveedor] = await pool.execute('SELECT id FROM proveedores WHERE id = ?', [id]);
    if (proveedor.length === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    await pool.execute(`
      UPDATE proveedores 
      SET 
        razon_social = ?,
        nit = ?,
        contacto = ?,
        telefono = ?,
        email = ?,
        direccion = ?
      WHERE id = ?
    `, [razon_social, nit || null, contacto || null, telefono || null, email || null, direccion || null, id]);
    
    res.json({ message: 'Proveedor actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.deleteProveedor = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await pool.execute('UPDATE proveedores SET estado = 0 WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Proveedor no encontrado' });
    }
    
    res.json({ message: 'Proveedor desactivado exitosamente' });
  } catch (error) {
    console.error('Error al desactivar proveedor:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
