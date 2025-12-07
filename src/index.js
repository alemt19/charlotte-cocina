import express from 'express';
import bodyParser from 'body-parser';
import { envs } from './config/envs.js';
import exampleRoutes from './routes/example/example.routes.js';
import morgan from 'morgan';

const app = express();

// Middlewares globales
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(morgan('dev'));

// Rutas
app.get('/api', (req, res) => {
  res.json({ up: true });
});

// Montar rutas de ejemplo
app.use('/api/example', exampleRoutes);

// Iniciar servidor
const server = app.listen(envs.PORT, () =>
  console.log(`🚀 Server ready at: http://localhost:${envs.PORT}`)
);


