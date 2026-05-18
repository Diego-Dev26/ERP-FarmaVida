const pool = require('../config/database');

exports.registrarTransferencia = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { ubicacion_origen_id, ubicacion_destino_id, lote_id, cantidad, observaciones } = req.body;
    const usuario_id = req.user ? req.user.id : 1;

    if (!ubicacion_origen_id || !ubicacion_destino_id || !lote_id || cantidad <= 0) {
      return res.status(400).json({ message: 'Datos incompletos o cantidad inválida' });
    }

    if (ubicacion_origen_id === ubicacion_destino_id) {
      return res.status(400).json({ message: 'La ubicación de origen y destino no pueden ser la misma' });
    }

    await connection.beginTransaction();

    // 1. Verificar stock en origen
    const [invOrigen] = await connection.execute(
      'SELECT id, cantidad FROM inventario WHERE lote_id = ? AND ubicacion_id = ? FOR UPDATE',
      [lote_id, ubicacion_origen_id]
    );

    if (invOrigen.length === 0 || invOrigen[0].cantidad < cantidad) {
      await connection.rollback();
      return res.status(400).json({ message: 'Stock insuficiente en la ubicación de origen' });
    }

    // 2. Descontar stock del origen
    await connection.execute(
      'UPDATE inventario SET cantidad = cantidad - ? WHERE id = ?',
      [cantidad, invOrigen[0].id]
    );

    // 3. Sumar stock en destino
    const [invDestino] = await connection.execute(
      'SELECT id FROM inventario WHERE lote_id = ? AND ubicacion_id = ? FOR UPDATE',
      [lote_id, ubicacion_destino_id]
    );

    if (invDestino.length > 0) {
      await connection.execute(
        'UPDATE inventario SET cantidad = cantidad + ? WHERE id = ?',
        [cantidad, invDestino[0].id]
      );
    } else {
      await connection.execute(
        'INSERT INTO inventario (lote_id, ubicacion_id, cantidad, cantidad_reservada) VALUES (?, ?, ?, 0)',
        [lote_id, ubicacion_destino_id, cantidad]
      );
    }

    // Obtener información del lote para el historial de movimientos
    const [loteData] = await connection.execute('SELECT precio_compra FROM lotes WHERE id = ?', [lote_id]);
    const precioUnitario = loteData.length > 0 ? loteData[0].precio_compra : 0;

    // 4. Registrar movimientos (Salida origen y Entrada destino)
    const TIPO_SALIDA = 6; // Transferencia Salida
    const TIPO_ENTRADA = 7; // Transferencia Entrada

    // Movimiento de salida
    await connection.execute(`
      INSERT INTO movimientos_inventario (tipo_movimiento_id, lote_id, cantidad, precio_unitario, usuario_id, observaciones) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [TIPO_SALIDA, lote_id, cantidad, precioUnitario, usuario_id, `Salida hacia ubicación ${ubicacion_destino_id}. ${observaciones || ''}`]);

    // Movimiento de entrada
    await connection.execute(`
      INSERT INTO movimientos_inventario (tipo_movimiento_id, lote_id, cantidad, precio_unitario, usuario_id, observaciones) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [TIPO_ENTRADA, lote_id, cantidad, precioUnitario, usuario_id, `Entrada desde ubicación ${ubicacion_origen_id}. ${observaciones || ''}`]);

    await connection.commit();
    res.status(200).json({ message: 'Transferencia realizada con éxito' });

  } catch (error) {
    await connection.rollback();
    console.error('Error en transferencia:', error);
    res.status(500).json({ message: 'Error interno al procesar la transferencia' });
  } finally {
    connection.release();
  }
};
