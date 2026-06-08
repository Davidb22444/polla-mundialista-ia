import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan SUPABASE_URL o SUPABASE_KEY en el archivo .env\n' +
    '  - SUPABASE_URL: va en Supabase → Settings → API → Project URL\n' +
    '  - SUPABASE_KEY: va en Supabase → Settings → API → anon public (o service_role)'
  );
}

// La anon key y service_role key de Supabase siempre empiezan con "eyJ"
// Si empieza con "sb_secret_" es una Management API key que NO funciona con el cliente JS
if (!supabaseKey.startsWith('eyJ')) {
  console.warn(
    '⚠️  SUPABASE_KEY parece incorrecta.\n' +
    '   La clave debe ser la "anon public" o "service_role" key del proyecto,\n' +
    '   que siempre empieza con "eyJ..." (JWT).\n' +
    '   Encuéntrala en Supabase → Settings → API → Project API keys.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
