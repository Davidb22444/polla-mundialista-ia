import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

app.get('/', (_req, res) => {
  res.json({
    app: 'Polla Mundialista IA API',
    status: 'ok'
  });
});

app.use('/api', apiRouter);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Backend listo en http://localhost:${port}`);
});
