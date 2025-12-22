import express from 'express';
import bodyParser from 'body-parser';
import { envs } from './config/envs.js';
import exampleRoutes from './routes/example/example.routes.js';
import morgan from 'morgan';
import cors from 'cors';
import kitchenStaffRoutes from './routes/kitchenStaff.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { prisma } from './db/client.js';
import staffShiftRoutes from './routes/staffShift.routes.js';
import kdsRoutes from './routes/kds.routes.js';

const app = express();

//  Middlewares globales
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cors({ origin: envs.ALLOWED_ORIGINS || '*' }));

//  Luego las rutas
app.use('/api/kitchen', kitchenStaffRoutes);
app.use('/api/example', exampleRoutes);
app.use(staffShiftRoutes);
app.use(kdsRoutes);

app.get('/api', (req, res) => {
  res.json({ up: true });
});

//  Middleware de errores
app.use(errorHandler);

// Iniciar servidor
const server = app.listen(envs.PORT, () =>
  console.log(`🚀 Server ready at: http://localhost:${envs.PORT}`)
);

// Graceful Shutdown
const gracefulShutdown = async () => {
  console.log('\nCerrando servidor y desconectando base de datos...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Servidor cerrado correctamente.');
    process.exit(0);
  });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);


