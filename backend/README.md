# Backend - Polla Mundialista IA

Backend en Node.js + Express conectado a Supabase.

## 1. Instalar dependencias

```bash
cd backend
npm install
```

## 2. Configurar variables

Copia `.env.example` como `.env` y cambia los datos:

```env
PORT=3001
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu-service-role-key-o-anon-key
FRONTEND_URL=http://localhost:5173
```

Para pruebas del backend es mas facil usar la `service_role key`. No la subas a GitHub.

## 3. Crear tablas en Supabase

Copia el contenido de `supabase/schema.sql` en el SQL Editor de Supabase y ejecutalo.

## 4. Ejecutar

```bash
npm run dev
```

Desde la raiz del proyecto tambien puedes usar:

```bash
npm run backend:dev
```

## Endpoints principales

- `GET /api/health`
- `GET /api/teams`
- `GET /api/teams/:id`
- `GET /api/teams/:id/statistics`
- `POST /api/teams`
- `GET /api/statistics/categories`
- `GET /api/statistics/teams`
- `GET /api/matches`
- `GET /api/matches/:id`
- `POST /api/matches`
- `POST /api/matches/:id/simulate`
- `GET /api/predictions`
- `POST /api/predictions`
- `GET /api/predictions/leaderboard`
- `GET /api/standings`

## Ejemplo para crear partido

```json
{
  "equipo_local_id": 1,
  "equipo_visitante_id": 2,
  "grupo": "A",
  "fase": "Fase de grupos",
  "fecha": "2026-06-15T20:00:00"
}
```

## Ejemplo para crear prediccion

```json
{
  "user_id": "uuid-del-usuario",
  "match_id": 1,
  "pred_goles_local": 2,
  "pred_goles_visitante": 1
}
```

## Sistema de puntos

- Marcador exacto: 5 puntos.
- Resultado correcto: 3 puntos.
- Un marcador parcial correcto: 1 punto.
- Fallo total: 0 puntos.
