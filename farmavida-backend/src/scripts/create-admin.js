// ============================================================
// Script para crear/actualizar el usuario admin en la BD local
// Ejecutar con: node src/scripts/create-admin.js
// ============================================================
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// // Oscar Diego Alegre Inocente

async function createAdmin() {
  console.log('🔧 Conectando a MySQL local...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'farmavida'
  });

  try {
    // Generar hash correcto para "admin123"
    const passwordPlana = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(passwordPlana, salt);
    
    console.log('🔐 Hash generado para "admin123":', hash);

    // Verificar que el hash funciona
    const verificacion = await bcrypt.compare(passwordPlana, hash);
    console.log('✅ Verificación del hash:', verificacion);

    // Verificar si ya existe el usuario admin
    const [existing] = await connection.execute(
      'SELECT id FROM empleados WHERE usuario = ?', ['admin']
    );

    if (existing.length > 0) {
      // Actualizar contraseña del admin existente
      await connection.execute(
        'UPDATE empleados SET password = ?, estado = 1 WHERE usuario = ?',
        [hash, 'admin']
      );
      console.log('🔄 Contraseña del usuario admin ACTUALIZADA');
    } else {
      // Insertar nuevo admin
      await connection.execute(
        `INSERT INTO empleados (ci, nombres, apellidos, usuario, password, rol, email, telefono, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ['12345678', 'Oscar Diego', 'Alegre Inocente', 'admin', hash, 'admin', 'admin@farmavida.com', '77712345', 1]
      );
      console.log('✅ Usuario admin CREADO');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Usuario:    admin');
    console.log('   Contraseña: admin123');
    console.log('   Rol:        admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Verificar
    const [rows] = await connection.execute(
      'SELECT id, ci, nombres, apellidos, usuario, rol, estado FROM empleados WHERE usuario = ?',
      ['admin']
    );
    console.log('\n📋 Registro:', rows[0]);
    console.log('\n🎉 ¡Listo! Ahora puedes iniciar sesión en http://localhost:5173');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

createAdmin();
