const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Obtener todas las sucursales
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, codigo, nombre, direccion, telefono, encargado
      FROM sucursales 
      WHERE estado = 1
      ORDER BY nombre ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener sucursales' });
  }
});

// Obtener sucursal por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(`
      SELECT id, codigo, nombre, direccion, telefono, encargado
      FROM sucursales 
      WHERE id = ? AND estado = 1
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Sucursal no encontrada' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener sucursal' });
  }
});

module.exports = router;