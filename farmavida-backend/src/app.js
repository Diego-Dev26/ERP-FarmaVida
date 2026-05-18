const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const loteRoutes = require('./routes/loteRoutes');
const alertaRoutes = require('./routes/alertaRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const productosRoutes = require('./routes/productosRoutes');
const sucursalesRoutes = require('./routes/sucursalesRoutes');
const metodosPagoRoutes = require('./routes/metodosPagoRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const proveedorRoutes = require('./routes/proveedorRoutes');
const compraRoutes = require('./routes/compraRoutes');
const ubicacionRoutes = require('./routes/ubicacionRoutes');
const transferenciaRoutes = require('./routes/transferenciaRoutes');
const empleadoRoutes = require('./routes/empleadoRoutes');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory/lotes', loteRoutes);
app.use('/api/inventory/alertas', alertaRoutes);
app.use('/api/sales', ventaRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/sucursales', sucursalesRoutes);
app.use('/api/metodos-pago', metodosPagoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/proveedores', proveedorRoutes);
app.use('/api/compras', compraRoutes);
app.use('/api/ubicaciones', ubicacionRoutes);
app.use('/api/transferencias', transferenciaRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/reportes', reporteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FarmaVida API running', timestamp: new Date() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor', error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor FarmaVida corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   POST /api/auth/login - Login`);
  console.log(`   GET  /api/inventory/lotes - Listar lotes`);
  console.log(`   GET  /api/inventory/alertas - Alertas vencimiento`);
  console.log(`   POST /api/sales - Registrar venta`);
  console.log(`   GET  /api/productos - Listar productos`);
  console.log(`   GET  /api/sucursales - Listar sucursales`);
  console.log(`   GET  /api/metodos-pago - Listar métodos de pago`);
  console.log(`   GET  /api/clientes - Listar clientes\n`);
});

module.exports = app;