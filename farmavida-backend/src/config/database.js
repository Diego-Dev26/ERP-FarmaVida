const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: 'caboose.proxy.rlwy.net',
  port: 51327,
  user: 'root',
  password: 'FDwBOvJuJnKOuLfoyFivIuCMvdREryYI',
  database: 'farmavida',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.getConnection()
  .then(async connection => {
    console.log('✅ Conectado a MySQL en Railway!');
    console.log('📌 Host: caboose.proxy.rlwy.net:51327');
    console.log('📌 Base de datos: railway');
    
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tablas encontradas: ${tables.length}`);
    
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err.message);
    console.log('\n🔧 Soluciones:');
    console.log('1. Verifica que el servicio MySQL esté activo en Railway');
    console.log('2. Espera unos minutos y reintenta');
    console.log('3. Reinicia el servicio MySQL en Railway');
  });

module.exports = pool;