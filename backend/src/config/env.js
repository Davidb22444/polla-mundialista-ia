export const env = {
  port: Number(process.env.PORT || 3001),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY
};

if (!env.supabaseUrl || !env.supabaseKey) {
  console.warn('Faltan SUPABASE_URL o SUPABASE_KEY en el archivo .env');
}
