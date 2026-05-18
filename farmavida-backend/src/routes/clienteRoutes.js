const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authMiddleware } = require('../middleware/auth');

// Todas las rutas de clientes requieren autenticación
router.use(authMiddleware);

// Rutas CRUD para clientes
router.get('/', clienteController.getAllClientes);
router.get('/:param', clienteController.getClienteByIdOrDoc);
router.post('/', clienteController.createCliente);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;
