const express = require('express');
const {
  createVenta,
  getVentas,
  getVentaById,
  getDashboardStats
} = require('../controllers/ventaController');
const { authMiddleware } = require('../middleware/auth');
const { validateVenta, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard/stats', getDashboardStats);
router.get('/', getVentas);
router.get('/:id', getVentaById);
router.post('/', validateVenta, handleValidationErrors, createVenta);

module.exports = router;