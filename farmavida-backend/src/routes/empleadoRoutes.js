const express = require('express');
const router = express.Router();
const empleadoController = require('../controllers/empleadoController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', empleadoController.getAllEmpleados);
router.post('/', empleadoController.createEmpleado);
router.put('/:id', empleadoController.updateEmpleado);
router.delete('/:id', empleadoController.deleteEmpleado);

module.exports = router;
