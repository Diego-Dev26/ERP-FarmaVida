const { body, validationResult } = require('express-validator');

const validateLote = [
  body('producto_id').isInt().withMessage('Producto ID debe ser un número'),
  body('codigo_lote').notEmpty().withMessage('Código de lote es requerido'),
  body('fecha_caducidad').isDate().withMessage('Fecha de caducidad válida requerida'),
  body('cantidad_inicial').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0')
];

const validateVenta = [
  body('cliente_id').optional().isInt(),
  body('sucursal_id').isInt().withMessage('Sucursal es requerida'),
  body('productos').isArray().withMessage('Productos debe ser un array'),
  body('productos.*.producto_id').isInt(),
  body('productos.*.cantidad').isInt({ min: 1 }),
  body('total').isFloat({ min: 0 })
];

const validateReceta = [
  body('cliente_id').isInt().withMessage('Cliente es requerido'),
  body('productos').isArray().withMessage('Productos debe ser un array'),
  body('medico_nombre').notEmpty().withMessage('Nombre del médico es requerido'),
  body('fecha_validez').isDate().withMessage('Fecha de validez requerida')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateLote,
  validateVenta,
  validateReceta,
  handleValidationErrors
};