const express = require('express');
const {
  getAlertas,
  marcarAtendida,
  generarAlertas
} = require('../controllers/alertaController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getAlertas);
router.post('/generar', generarAlertas);
router.put('/:id/atender', marcarAtendida);

module.exports = router;