const pool = require('../config/database');

exports.registrarCompra = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { proveedor_id, ubicacion_id, observaciones, detalles } = req.body;
    const usuario_id = req.user ? req.user.id : 1; // Fallback to 1 (admin) si no hay usuario en req

    if (!proveedor_id || !ubicacion_id || !detalles || detalles.length === 0) {
      return res.status(400).json({ message: 'Faltan datos requeridos para registrar la compra' });
    }

    await connection.beginTransaction();

    // ID del tipo de movimiento para compra (generalmente 1 según script)
    const TIPO_MOVIMIENTO_COMPRA = 1;

    for (const item of detalles) {
      const { producto_id, codigo_lote, fecha_fabricacion, fecha_caducidad, cantidad, precio_compra } = item;

      // 1. Insertar el nuevo lote
      const [loteResult] = await connection.execute(`
        INSERT INTO lotes (
          producto_id, codigo_lote, fecha_fabricacion, fecha_caducidad, 
          cantidad_inicial, cantidad_actual, precio_compra, proveedor_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        producto_id, codigo_lote, fecha_fabricacion || null, fecha_caducidad, 
        cantidad, cantidad, precio_compra, proveedor_id
      ]);

      const loteId = loteResult.insertId;

      // 2. Insertar en el inventario para la ubicación seleccionada
      await connection.execute(`
        INSERT INTO inventario (lote_id, ubicacion_id, cantidad, cantidad_reservada) 
        VALUES (?, ?, ?, 0)
      `, [loteId, ubicacion_id, cantidad]);

      // 3. Registrar el movimiento de inventario (Entrada)
      await connection.execute(`
        INSERT INTO movimientos_inventario (
          tipo_movimiento_id, lote_id, cantidad, precio_unitario, usuario_id, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        TIPO_MOVIMIENTO_COMPRA, loteId, cantidad, precio_compra, usuario_id, 
        observaciones || 'Ingreso por compra a proveedor'
      ]);
      
      // Actualizar el precio de compra actual en el catálogo de productos (opcional pero útil)
      await connection.execute(`
        UPDATE productos SET precio_compra = ? WHERE id = ?
      `, [precio_compra, producto_id]);
    }

    await connection.commit();
    res.status(201).json({ message: 'Compra registrada y stock actualizado exitosamente' });

  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar compra:', error);
    res.status(500).json({ message: 'Error interno al registrar la compra' });
  } finally {
    connection.release();
  }
};
