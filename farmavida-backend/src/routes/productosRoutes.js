const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Obtener todos los productos (activos)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, 
        codigo_interno, 
        nombre, 
        nombre_comercial,
        precio_venta, 
        requiere_receta,
        stock_minimo,
        imagen_url,
        estado
      FROM productos 
      WHERE estado = 1
      ORDER BY nombre ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
});

// Buscar productos por nombre o código
router.get('/buscar', async (req, res) => {
  const { q } = req.query;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, 
        codigo_interno, 
        nombre, 
        nombre_comercial,
        precio_venta, 
        requiere_receta
      FROM productos 
      WHERE estado = 1 
        AND (nombre LIKE ? OR codigo_interno LIKE ? OR nombre_comercial LIKE ?)
      LIMIT 20
    `, [`%${q}%`, `%${q}%`, `%${q}%`]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al buscar productos' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, 
        codigo_barras,
        codigo_interno, 
        nombre, 
        nombre_comercial,
        descripcion,
        categoria_id,
        unidad_medida_id,
        requiere_receta,
        requiere_refrigeracion,
        es_controlado,
        precio_compra,
        precio_venta,
        stock_minimo,
        stock_maximo,
        imagen_url,
        estado
      FROM productos 
      WHERE id = ? AND estado = 1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
});

// Obtener stock disponible de un producto
router.get('/:id/stock', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.id,
        p.nombre,
        p.codigo_interno,
        COALESCE(SUM(l.cantidad_actual), 0) as stock_total,
        COUNT(DISTINCT l.id) as lotes_disponibles
      FROM productos p
      LEFT JOIN lotes l ON p.id = l.producto_id 
        AND l.estado = 'activo' 
        AND l.fecha_caducidad > CURDATE()
      WHERE p.id = ?
      GROUP BY p.id
    `, [id]);
    
    res.json(rows[0] || { 
      id: parseInt(id), 
      stock_total: 0, 
      lotes_disponibles: 0 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener stock' });
  }
});

module.exports = router;