const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  console.log('📦 Conectando a Railway MySQL...');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('✅ Conectado!');
    
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, '..', 'farmavida.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📝 Ejecutando script SQL...');
    
    // Ejecutar el script
    const queries = sql.split(';');
    for (const query of queries) {
      if (query.trim()) {
        try {
          await connection.execute(query);
        } catch (err) {
          if (!err.message.includes('already exists')) {
            console.log('⚠️ Error en query:', err.message);
          }
        }
      }
    }
    
    console.log('✅ Base de datos inicializada correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

initDatabase();