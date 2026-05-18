const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// Obtener todas las ubicaciones activas (con el nombre de la sucursal)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id, u.codigo, u.nombre, u.tipo, 
        s.nombre as sucursal_nombre
      FROM ubicaciones u
      LEFT JOIN sucursales s ON u.sucursal_id = s.id
      WHERE u.estado = 1
      ORDER BY s.nombre ASC, u.nombre ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener inventario por ubicacion_id
router.get('/:id/inventario', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        i.id as inventario_id,
        i.cantidad,
        l.id as lote_id,
        l.codigo_lote,
        l.fecha_caducidad,
        p.id as producto_id,
        p.nombre as producto_nombre,
        p.codigo_interno
      FROM inventario i
      JOIN lotes l ON i.lote_id = l.id
      JOIN productos p ON l.producto_id = p.id
      WHERE i.ubicacion_id = ? AND i.cantidad > 0
      ORDER BY p.nombre ASC, l.fecha_caducidad ASC
    `, [id]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener inventario por ubicación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
