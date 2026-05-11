const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

// Obtener todos los métodos de pago
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, nombre, codigo, activo
      FROM metodos_pago 
      WHERE activo = 1
      ORDER BY id ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener métodos de pago' });
  }
});

module.exports = router;