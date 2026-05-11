const pool = require('../config/database');

const createVenta = async (req, res) => {
  const { cliente_id, sucursal_id, productos, total, metodo_pago_id } = req.body;
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const codigo = `VEN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const [pedidoResult] = await connection.execute(
      `INSERT INTO pedidos 
       (codigo, cliente_id, sucursal_id, tipo_pedido, fecha_pedido, subtotal, total, estado) 
       VALUES (?, ?, ?, 'mostrador', NOW(), ?, ?, 'pagado')`,
      [codigo, cliente_id || null, sucursal_id, total, total]
    );
    
    const pedidoId = pedidoResult.insertId;
    
    for (const item of productos) {
      // Buscar lote disponible
      const [lote] = await connection.execute(
        `SELECT l.id, l.cantidad_actual
         FROM lotes l
         WHERE l.producto_id = ? 
           AND l.estado = 'activo'
           AND l.fecha_caducidad > CURDATE()
           AND l.cantidad_actual >= ?
         LIMIT 1`,
        [item.producto_id, item.cantidad]
      );
      
      if (lote.length === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          message: `Stock insuficiente para producto ID ${item.producto_id}` 
        });
      }
      
      await connection.execute(
        `INSERT INTO pedido_detalles (pedido_id, producto_id, lote_id, cantidad, precio_unitario, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [pedidoId, item.producto_id, lote[0].id, item.cantidad, item.precio_unitario, item.cantidad * item.precio_unitario]
      );
      
      // Actualizar stock del lote
      await connection.execute(
        `UPDATE lotes 
         SET cantidad_actual = cantidad_actual - ? 
         WHERE id = ?`,
        [item.cantidad, lote[0].id]
      );
      
      // Registrar movimiento
      await connection.execute(
        `INSERT INTO movimientos_inventario 
         (tipo_movimiento_id, lote_id, cantidad, usuario_id, observaciones)
         VALUES (4, ?, ?, ?, ?)`,
        [lote[0].id, item.cantidad, req.userId || 1, `Venta ${codigo}`]
      );
    }
    
    if (metodo_pago_id) {
      await connection.execute(
        `INSERT INTO pagos (pedido_id, metodo_pago_id, monto, fecha_pago, estado)
         VALUES (?, ?, ?, NOW(), 'completado')`,
        [pedidoId, metodo_pago_id, total]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Venta registrada exitosamente',
      pedido_id: pedidoId,
      codigo: codigo
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: 'Error al registrar venta: ' + error.message });
  } finally {
    connection.release();
  }
};

const getVentas = async (req, res) => {
  const { fecha_inicio, fecha_fin, sucursal_id } = req.query;
  
  let query = `
    SELECT 
      p.id,
      p.codigo,
      p.fecha_pedido,
      p.total,
      p.estado,
      c.nombres,
      c.apellidos,
      c.documento,
      s.nombre as sucursal
    FROM pedidos p
    LEFT JOIN clientes c ON p.cliente_id = c.id
    JOIN sucursales s ON p.sucursal_id = s.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (fecha_inicio) {
    query += ` AND DATE(p.fecha_pedido) >= ?`;
    params.push(fecha_inicio);
  }
  
  if (fecha_fin) {
    query += ` AND DATE(p.fecha_pedido) <= ?`;
    params.push(fecha_fin);
  }
  
  if (sucursal_id) {
    query += ` AND p.sucursal_id = ?`;
    params.push(sucursal_id);
  }
  
  query += ` ORDER BY p.fecha_pedido DESC LIMIT 100`;
  
  try {
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
};

const getVentaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [venta] = await pool.execute(`
      SELECT 
        p.*,
        c.nombres,
        c.apellidos,
        c.documento,
        c.telefono,
        s.nombre as sucursal
      FROM pedidos p
      LEFT JOIN clientes c ON p.cliente_id = c.id
      JOIN sucursales s ON p.sucursal_id = s.id
      WHERE p.id = ?
    `, [id]);
    
    if (venta.length === 0) {
      return res.status(404).json({ message: 'Venta no encontrada' });
    }
    
    const [detalles] = await pool.execute(`
      SELECT 
        pd.*,
        pr.nombre as producto,
        pr.codigo_interno,
        l.codigo_lote
      FROM pedido_detalles pd
      JOIN productos pr ON pd.producto_id = pr.id
      LEFT JOIN lotes l ON pd.lote_id = l.id
      WHERE pd.pedido_id = ?
    `, [id]);
    
    const [pago] = await pool.execute(`
      SELECT * FROM pagos WHERE pedido_id = ?
    `, [id]);
    
    res.json({
      ...venta[0],
      detalles,
      pago: pago[0] || null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener venta' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const [ventasHoy] = await pool.execute(`
      SELECT COUNT(*) as total_ventas, COALESCE(SUM(total), 0) as total_ingresos
      FROM pedidos 
      WHERE DATE(fecha_pedido) = CURDATE() AND estado = 'pagado'
    `);
    
    const [productos] = await pool.execute(`
      SELECT COUNT(DISTINCT producto_id) as total
      FROM lotes
      WHERE estado = 'activo' AND cantidad_actual > 0
    `);
    
    const [alertas] = await pool.execute(`
      SELECT COUNT(*) as total
      FROM lotes l
      WHERE l.estado = 'activo' 
        AND l.fecha_caducidad <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND l.cantidad_actual > 0
    `);
    
    res.json({
      ventasHoy: ventasHoy[0].total_ventas,
      ingresosHoy: ventasHoy[0].total_ingresos,
      totalProductos: productos[0].total,
      alertasVencimiento: alertas[0].total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  createVenta,
  getVentas,
  getVentaById,
  getDashboardStats
};