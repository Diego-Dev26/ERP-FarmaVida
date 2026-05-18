const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'farmavida',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// // Oscar Diego Alegre Inocente

pool.getConnection()
  .then(async connection => {
    console.log('✅ Conectado a MySQL en localhost!');
    console.log(`📌 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.log(`📌 Base de datos: ${process.env.DB_NAME || 'farmavida'}`);
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tablas encontradas: ${tables.length}`);
    
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err.message);
    console.log('\n🔧 Soluciones:');
    console.log('1. Verifica que MySQL esté corriendo (XAMPP, WAMP o servicio MySQL)');
    console.log('2. Revisa usuario y contraseña en el archivo .env');
    console.log('3. Asegúrate de haber creado la base de datos "farmavida"');
  });

module.exports = pool;