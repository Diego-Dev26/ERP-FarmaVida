const express = require('express');
const {
  getLotes,
  getLoteById,
  createLote,
  updateLote,
  getMovimientos
} = require('../controllers/loteController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { validateLote, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getLotes);
router.get('/:id', getLoteById);
router.get('/:id/movimientos', getMovimientos);
router.post('/', adminOnly, validateLote, handleValidationErrors, createLote);
router.put('/:id', adminOnly, updateLote);
// Eliminamos la línea de delete porque no tenemos esa función implementada
// router.delete('/:id', adminOnly, deleteLote);

module.exports = router;