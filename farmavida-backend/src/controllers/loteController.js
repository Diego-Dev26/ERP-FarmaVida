const pool = require('../config/database');

const getLotes = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.id,
        l.codigo_lote,
        DATE_FORMAT(l.fecha_fabricacion, '%Y-%m-%d') as fecha_fabricacion,
        DATE_FORMAT(l.fecha_caducidad, '%Y-%m-%d') as fecha_caducidad,
        l.cantidad_inicial,
        l.cantidad_actual,
        l.estado,
        p.id as producto_id,
        p.nombre as producto,
        p.codigo_interno,
        p.precio_venta,
        pr.razon_social as proveedor,
        pr.id as proveedor_id
      FROM lotes l
      JOIN productos p ON l.producto_id = p.id
      LEFT JOIN proveedores pr ON l.proveedor_id = pr.id
      ORDER BY l.fecha_caducidad ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener lotes: ' + error.message });
  }
};

const getLoteById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.*,
        p.nombre as producto,
        p.codigo_interno,
        pr.razon_social as proveedor
      FROM lotes l
      JOIN productos p ON l.producto_id = p.id
      LEFT JOIN proveedores pr ON l.proveedor_id = pr.id
      WHERE l.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Lote no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener lote' });
  }
};

const createLote = async (req, res) => {
  const { 
    producto_id, 
    codigo_lote, 
    fecha_fabricacion, 
    fecha_caducidad, 
    cantidad_inicial, 
    proveedor_id,
    precio_compra
  } = req.body;
  
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    // Validar que el lote no exista
    const [existing] = await connection.execute(
      'SELECT id FROM lotes WHERE producto_id = ? AND codigo_lote = ?',
      [producto_id, codigo_lote]
    );
    
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Ya existe un lote con ese código para este producto' });
    }
    
    // Insertar lote
    const [result] = await connection.execute(
      `INSERT INTO lotes 
       (producto_id, codigo_lote, fecha_fabricacion, fecha_caducidad, cantidad_inicial, cantidad_actual, proveedor_id, precio_compra) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [producto_id, codigo_lote, fecha_fabricacion, fecha_caducidad, cantidad_inicial, cantidad_inicial, proveedor_id, precio_compra]
    );
    
    const loteId = result.insertId;
    
    // Buscar una ubicación por defecto
    const [ubicacion] = await connection.execute(
      'SELECT id FROM ubicaciones LIMIT 1'
    );
    
    if (ubicacion.length > 0) {
      await connection.execute(
        `INSERT INTO inventario (lote_id, ubicacion_id, cantidad, cantidad_reservada) 
         VALUES (?, ?, ?, 0)`,
        [loteId, ubicacion[0].id, cantidad_inicial]
      );
    }
    
    // Registrar movimiento
    await connection.execute(
      `INSERT INTO movimientos_inventario (tipo_movimiento_id, lote_id, cantidad, usuario_id, observaciones) 
       VALUES (1, ?, ?, ?, 'Compra inicial')`,
      [loteId, cantidad_inicial, req.userId || 1]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Lote creado exitosamente', 
      id: loteId 
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al crear lote: ' + error.message });
  } finally {
    connection.release();
  }
};

const updateLote = async (req, res) => {
  const { id } = req.params;
  const { fecha_caducidad, estado } = req.body;
  
  try {
    const [result] = await pool.execute(
      'UPDATE lotes SET fecha_caducidad = ?, estado = ? WHERE id = ?',
      [fecha_caducidad, estado, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lote no encontrado' });
    }
    
    res.json({ message: 'Lote actualizado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar lote' });
  }
};

const getMovimientos = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [rows] = await pool.execute(`
      SELECT 
        m.id,
        tm.nombre as tipo_movimiento,
        m.cantidad,
        m.precio_unitario,
        m.observaciones,
        m.created_at as fecha
      FROM movimientos_inventario m
      JOIN tipos_movimiento tm ON m.tipo_movimiento_id = tm.id
      WHERE m.lote_id = ?
      ORDER BY m.created_at DESC
    `, [id]);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener movimientos' });
  }
};

module.exports = {
  getLotes,
  getLoteById,
  createLote,
  updateLote,
  getMovimientos
};