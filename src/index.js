import express from 'express';
import bodyParser from 'body-parser';
import { envs } from './config/envs.js';
import exampleRoutes from './routes/example/example.routes.js';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path'; // <--- Nuevo import
import fs from 'fs'; // <--- Para cargar swagger.json
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url'; // <--- Nuevo import
import { errorHandler } from './middlewares/error.middleware.js';
import { prisma } from './db/client.js';
import router from './routes/index.routes.js';

// Configuración de rutas para archivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const BASE_PATH = '/api/kitchen';

// Cargar documentación Swagger
const swaggerDocument = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../swagger.json'), 'utf8')
);

// Middlewares globales
app.use(bodyParser.json());

// --- CONFIGURACIÓN DE IMÁGENES PÚBLICAS ---
// Esto permite acceder a http://localhost:3000/public/uploads/foto.jpg
app.use('/public', express.static(path.join(__dirname, 'public')));
// ------------------------------------------

// Documentos de la API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(morgan('dev'));
app.use(cors({ origin: envs.ALLOWED_ORIGINS || '*' }));

// Rutas
app.use('/api/example', exampleRoutes);
app.use(`${BASE_PATH}`, router);

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