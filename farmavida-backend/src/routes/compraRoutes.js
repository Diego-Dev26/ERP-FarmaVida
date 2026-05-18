const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/compras - Registrar una nueva compra/ingreso
router.post('/', compraController.registrarCompra);

module.exports = router;
