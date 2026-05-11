const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  console.log('📥 Body recibido:', req.body);
  
  const { usuario, password } = req.body;

  // Validar que los datos no sean undefined
  if (!usuario || !password) {
    console.log('❌ Faltan datos:', { usuario: !!usuario, password: !!password });
    return res.status(400).json({ 
      message: 'Usuario y contraseña son requeridos',
      received: { usuario: !!usuario, password: !!password }
    });
  }

  try {
    console.log('🔍 Buscando usuario:', usuario);
    
    const [rows] = await pool.execute(
      'SELECT id, nombres, apellidos, usuario, password, rol FROM empleados WHERE usuario = ? AND estado = 1',
      [usuario.trim()]
    );

    console.log('📊 Resultados encontrados:', rows.length);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const empleado = rows[0];
    
    // Verificar que la contraseña existe
    if (!empleado.password) {
      console.error('Usuario sin contraseña:', usuario);
      return res.status(401).json({ message: 'Error en la configuración del usuario' });
    }
    
    console.log('🔐 Verificando contraseña...');
    const validPassword = await bcrypt.compare(password.trim(), empleado.password);
    console.log('✅ Contraseña válida:', validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: empleado.id, usuario: empleado.usuario, rol: empleado.rol },
      process.env.JWT_SECRET || 'farmavida_secret_key_2024',
      { expiresIn: '8h' }
    );

    console.log('✅ Login exitoso para:', usuario);
    
    res.json({
      token,
      user: {
        id: empleado.id,
        nombres: empleado.nombres,
        apellidos: empleado.apellidos,
        usuario: empleado.usuario,
        rol: empleado.rol
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor: ' + error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, nombres, apellidos, usuario, rol, email, telefono FROM empleados WHERE id = ?',
      [req.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = { login, getProfile };