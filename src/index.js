import express from 'express';
import bodyParser from 'body-parser';
import { envs } from './config/envs.js';
import exampleRoutes from './routes/example/example.routes.js';
import morgan from 'morgan';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware.js';
import { prisma } from './db/client.js';
import router from './routes/index.routes.js';

const app = express();
const BASE_PATH = '/api/kitchen';

//  Middlewares globales
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(cors({ origin: envs.ALLOWED_ORIGINS || '*' }));

//  Middleware de errores
app.use(errorHandler);

//  Luego las rutas
app.use('/api/example', exampleRoutes);
app.use(`${BASE_PATH}`, router);

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


