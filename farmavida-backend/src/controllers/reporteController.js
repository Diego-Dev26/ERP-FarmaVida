const pool = require('../config/database');

exports.getDashboardData = async (req, res) => {
  try {
    // 1. KPIs del día
    const [ventasHoy] = await pool.execute(`
      SELECT COUNT(*) as total_ventas, COALESCE(SUM(total), 0) as total_ingresos
      FROM pedidos 
      WHERE DATE(fecha_pedido) = CURDATE() AND estado = 'pagado'
    `);
    
    const [productos] = await pool.execute(`
      SELECT COUNT(DISTINCT producto_id) as total FROM lotes WHERE estado = 'activo' AND cantidad_actual > 0
    `);
    
    // 2. Ventas de los últimos 7 días
    const [ventasDiarias] = await pool.execute(`
      SELECT DATE(fecha_pedido) as fecha, SUM(total) as ingresos 
      FROM pedidos 
      WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND estado = 'pagado'
      GROUP BY DATE(fecha_pedido)
      ORDER BY fecha ASC
    `);

    // 3. Top 5 productos más vendidos este mes
    const [topProductos] = await pool.execute(`
      SELECT pr.nombre, SUM(pd.cantidad) as cantidad_vendida
      FROM pedido_detalles pd
      JOIN pedidos p ON pd.pedido_id = p.id
      JOIN productos pr ON pd.producto_id = pr.id
      WHERE p.estado = 'pagado' AND MONTH(p.fecha_pedido) = MONTH(CURDATE()) AND YEAR(p.fecha_pedido) = YEAR(CURDATE())
      GROUP BY pr.id, pr.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 5
    `);

    // 4. Stock bajo (alertas)
    const [stockBajo] = await pool.execute(`
      SELECT p.codigo_interno, p.nombre, SUM(l.cantidad_actual) as stock_total, p.stock_minimo
      FROM productos p
      JOIN lotes l ON p.id = l.producto_id
      WHERE l.estado = 'activo'
      GROUP BY p.id, p.codigo_interno, p.nombre, p.stock_minimo
      HAVING stock_total <= p.stock_minimo
      ORDER BY stock_total ASC
      LIMIT 10
    `);

    res.json({
      kpis: {
        ventasHoy: ventasHoy[0].total_ventas,
        ingresosHoy: ventasHoy[0].total_ingresos,
        totalProductos: productos[0].total,
      },
      ventasDiarias,
      topProductos,
      stockBajo
    });
  } catch (error) {
    console.error('Error al obtener reporte del dashboard:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
