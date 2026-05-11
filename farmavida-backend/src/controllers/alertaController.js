const pool = require('../config/database');

const getAlertas = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        l.id as lote_id,
        l.codigo_lote,
        l.fecha_caducidad,
        p.nombre as producto,
        p.codigo_interno,
        DATEDIFF(l.fecha_caducidad, CURDATE()) as dias_restantes,
        l.cantidad_actual as stock_total,
        a.id as alerta_id,
        a.atendido,
        CASE 
          WHEN DATEDIFF(l.fecha_caducidad, CURDATE()) <= 0 THEN 'vencido'
          WHEN DATEDIFF(l.fecha_caducidad, CURDATE()) <= 7 THEN '7_dias'
          WHEN DATEDIFF(l.fecha_caducidad, CURDATE()) <= 15 THEN '15_dias'
          WHEN DATEDIFF(l.fecha_caducidad, CURDATE()) <= 30 THEN '30_dias'
        END as tipo_alerta
      FROM lotes l
      JOIN productos p ON l.producto_id = p.id
      LEFT JOIN alertas_vencimiento a ON l.id = a.lote_id AND a.fecha_alerta = CURDATE()
      WHERE l.estado = 'activo'
        AND l.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND l.cantidad_actual > 0
      ORDER BY l.fecha_caducidad ASC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener alertas' });
  }
};

const marcarAtendida = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Primero verificar si existe la alerta
    const [existing] = await pool.execute(
      'SELECT id FROM alertas_vencimiento WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      // Si no existe, crearla
      const [lote] = await pool.execute(`
        SELECT l.id, DATEDIFF(l.fecha_caducidad, CURDATE()) as dias
        FROM lotes l
        WHERE l.id = ?
      `, [id]);
      
      if (lote.length > 0) {
        await pool.execute(
          `INSERT INTO alertas_vencimiento (lote_id, dias_restantes, fecha_alerta, tipo_alerta, atendido, fecha_atencion, usuario_atendio)
           VALUES (?, ?, CURDATE(), 
             CASE 
               WHEN ? <= 0 THEN 'vencido'
               WHEN ? <= 7 THEN '7_dias'
               WHEN ? <= 15 THEN '15_dias'
               WHEN ? <= 30 THEN '30_dias'
             END,
           1, NOW(), ?)`,
          [id, lote[0].dias, lote[0].dias, lote[0].dias, lote[0].dias, req.userId]
        );
      }
    } else {
      await pool.execute(
        `UPDATE alertas_vencimiento 
         SET atendido = 1, fecha_atencion = NOW(), usuario_atendio = ? 
         WHERE id = ?`,
        [req.userId, id]
      );
    }
    
    res.json({ message: 'Alerta marcada como atendida' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al marcar alerta' });
  }
};

const generarAlertas = async (req, res) => {
  try {
    await pool.execute(`
      INSERT INTO alertas_vencimiento (lote_id, dias_restantes, fecha_alerta, tipo_alerta)
      SELECT 
        l.id,
        DATEDIFF(l.fecha_caducidad, CURDATE()) as dias,
        CURDATE(),
        CASE 
          WHEN DATEDIFF(l.fecha_caducidad, CURDATE()) <= 0 THEN 'vencido'
          WHEN DATEDIFF(l.fecha_caducidad, CURDATE()) <= 7 THEN '7_dias'
          WHEN DATEDIFF(l.fecha_caducidad, CURDATE()) <= 15 THEN '15_dias'
          WHEN DATEDIFF(l.fecha_caducidad, CURDATE()) <= 30 THEN '30_dias'
        END as tipo
      FROM lotes l
      WHERE l.estado = 'activo'
        AND l.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND l.cantidad_actual > 0
        AND NOT EXISTS (
          SELECT 1 FROM alertas_vencimiento av 
          WHERE av.lote_id = l.id 
            AND av.fecha_alerta = CURDATE()
        )
    `);
    
    res.json({ message: 'Alertas generadas exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al generar alertas' });
  }
};

module.exports = {
  getAlertas,
  marcarAtendida,
  generarAlertas
};