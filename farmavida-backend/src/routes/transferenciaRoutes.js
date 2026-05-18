const express = require('express');
const router = express.Router();
const transferenciaController = require('../controllers/transferenciaController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// POST /api/transferencias - Realizar una transferencia de inventario
router.post('/', transferenciaController.registrarTransferencia);

module.exports = router;
