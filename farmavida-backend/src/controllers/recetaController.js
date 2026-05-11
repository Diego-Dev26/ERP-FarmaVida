const pool = require('../config/database');

const createReceta = async (req, res) => {
  const { cliente_id, productos, medico_nombre, medico_ci, medico_especialidad, fecha_validez, diagnostico } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const codigo_qr = `REC-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    
    const [result] = await connection.execute(
      `INSERT INTO recetas 
       (cliente_id, codigo_qr, medico_nombre, medico_ci, medico_especialidad, fecha_emision, fecha_validez, diagnostico, estado) 
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, ?, 'pendiente')`,
      [cliente_id, codigo_qr, medico_nombre, medico_ci, medico_especialidad, fecha_validez, diagnostico]
    );
    
    const recetaId = result.insertId;
    
    for (const item of productos) {
      await connection.execute(
        `INSERT INTO receta_detalles (receta_id, producto_id, cantidad, indicaciones)
         VALUES (?, ?, ?, ?)`,
        [recetaId, item.producto_id, item.cantidad, item.indicaciones || null]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Receta registrada exitosamente',
      id: recetaId,
      codigo_qr: codigo_qr
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al registrar receta' });
  } finally {
    connection.release();
  }
};

const getRecetas = async (req, res) => {
  const { estado, cliente_id } = req.query;
  
  let query = `
    SELECT 
      r.id,
      r.codigo_qr,
      r.medico_nombre,
      r.fecha_emision,
      r.fecha_validez,
      r.estado,
      c.id as cliente_id,
      c.nombres,
      c.apellidos,
      c.documento
    FROM recetas r
    JOIN clientes c ON r.cliente_id = c.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (estado) {
    query += ` AND r.estado = ?`;
    params.push(estado);
  }
  
  if (cliente_id) {
    query += ` AND r.cliente_id = ?`;
    params.push(cliente_id);
  }
  
  query += ` ORDER BY r.created_at DESC`;
  
  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener recetas' });
  }
};

const getRecetaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [receta] = await pool.execute(`
      SELECT 
        r.*,
        c.nombres,
        c.apellidos,
        c.documento,
        c.telefono
      FROM recetas r
      JOIN clientes c ON r.cliente_id = c.id
      WHERE r.id = ?
    `, [id]);
    
    if (receta.length === 0) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }
    
    const [detalles] = await pool.execute(`
      SELECT 
        rd.*,
        p.nombre as producto,
        p.codigo_interno,
        p.precio_venta
      FROM receta_detalles rd
      JOIN productos p ON rd.producto_id = p.id
      WHERE rd.receta_id = ?
    `, [id]);
    
    res.json({
      ...receta[0],
      detalles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener receta' });
  }
};

const validarReceta = async (req, res) => {
  const { id } = req.params;
  const { estado, observaciones } = req.body;
  
  try {
    const [result] = await pool.execute(
      `UPDATE recetas 
       SET estado = ?, validada_por = ?, fecha_validacion = NOW(), observaciones_rechazo = ?
       WHERE id = ?`,
      [estado, req.userId, observaciones || null, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }
    
    res.json({ message: `Receta ${estado === 'validada' ? 'validada' : 'rechazada'} exitosamente` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al validar receta' });
  }
};

const getRecetaByQR = async (req, res) => {
  const { qr } = req.params;
  
  try {
    const [receta] = await pool.execute(`
      SELECT 
        r.*,
        c.nombres,
        c.apellidos,
        c.documento
      FROM recetas r
      JOIN clientes c ON r.cliente_id = c.id
      WHERE r.codigo_qr = ? AND r.estado = 'validada' AND r.fecha_validez >= CURDATE()
    `, [qr]);
    
    if (receta.length === 0) {
      return res.status(404).json({ message: 'Receta no válida o expirada' });
    }
    
    const [detalles] = await pool.execute(`
      SELECT 
        rd.*,
        p.nombre as producto,
        p.codigo_interno,
        p.precio_venta
      FROM receta_detalles rd
      JOIN productos p ON rd.producto_id = p.id
      WHERE rd.receta_id = ?
    `, [receta[0].id]);
    
    res.json({
      ...receta[0],
      detalles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener receta' });
  }
};

module.exports = {
  createReceta,
  getRecetas,
  getRecetaById,
  validarReceta,
  getRecetaByQR
};