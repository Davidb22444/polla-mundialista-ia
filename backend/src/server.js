import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { supabase } from './config/supabase.js';

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

app.listen(port, async () => {
  console.log(`Backend listo en http://localhost:${port}`);

  // Verificar conexión con Supabase al arrancar
  try {
    const { error } = await supabase.from('teams').select('id').limit(1);
    if (error) {
      console.error('⚠️  Advertencia: No se pudo conectar a Supabase:', error.message);
      console.error('   Verifica SUPABASE_URL y SUPABASE_KEY en el archivo .env');
    } else {
      console.log('✅  Conexión con Supabase verificada correctamente.');
    }
  } catch (err) {
    console.error('⚠️  Error inesperado al verificar Supabase:', err.message);
  }
});
