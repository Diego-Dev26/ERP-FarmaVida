const express = require('express');
const {
  createReceta,
  getRecetas,
  getRecetaById,
  validarReceta,
  getRecetaByQR
} = require('../controllers/recetaController');
const { authMiddleware } = require('../middleware/auth');
const { validateReceta, handleValidationErrors } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRecetas);
router.get('/qr/:qr', getRecetaByQR);
router.get('/:id', getRecetaById);
router.post('/', validateReceta, handleValidationErrors, createReceta);
router.put('/:id/validar', validarReceta);

module.exports = router;