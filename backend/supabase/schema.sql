-- ============================================
-- TIPOS ENUM (seguros, no fallan si ya existen)
-- ============================================
DO $$ BEGIN
    CREATE TYPE match_status AS ENUM ('pendiente', 'simulado', 'finalizado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE prediction_status AS ENUM ('pendiente', 'calificada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLA: profiles
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre varchar(100) NOT NULL,
  avatar_url text,
  puntos_totales int DEFAULT 0,
  predicted_champion varchar(100),
  created_at timestamp DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TABLA: teams
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id bigserial PRIMARY KEY,
  nombre varchar(100) NOT NULL UNIQUE,
  pais_codigo varchar(5),
  grupo varchar(1) NOT NULL,
  ranking_fifa int,
  ataque int NOT NULL CHECK (ataque BETWEEN 1 AND 100),
  defensa int NOT NULL CHECK (defensa BETWEEN 1 AND 100),
  medio_campo int NOT NULL CHECK (medio_campo BETWEEN 1 AND 100),
  promedio_goles decimal(4,2) DEFAULT 0,
  victorias int DEFAULT 0,
  empates int DEFAULT 0,
  derrotas int DEFAULT 0,
  goles_favor int DEFAULT 0,
  goles_contra int DEFAULT 0,
  created_at timestamp DEFAULT now()
);

-- ============================================
-- TABLA: statistic_categories
-- ============================================
CREATE TABLE IF NOT EXISTS statistic_categories (
  id bigserial PRIMARY KEY,
  nombre varchar(100) NOT NULL UNIQUE,
  descripcion text
);

-- ============================================
-- TABLA: team_statistics
-- ============================================
CREATE TABLE IF NOT EXISTS team_statistics (
  id bigserial PRIMARY KEY,
  team_id bigint NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  category_id bigint NOT NULL REFERENCES statistic_categories(id) ON DELETE CASCADE,
  nombre varchar(100) NOT NULL,
  valor decimal(10,2) NOT NULL,
  created_at timestamp DEFAULT now()
);

-- ============================================
-- TABLA: matches
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id bigserial PRIMARY KEY,
  equipo_local_id bigint NOT NULL REFERENCES teams(id),
  equipo_visitante_id bigint NOT NULL REFERENCES teams(id),
  grupo varchar(1),
  fase varchar(50) DEFAULT 'Fase de grupos',
  fecha timestamp NOT NULL,
  goles_local int,
  goles_visitante int,
  prob_local decimal(5,2),
  prob_empate decimal(5,2),
  prob_visitante decimal(5,2),
  estado match_status DEFAULT 'pendiente',
  created_at timestamp DEFAULT now(),
  CONSTRAINT equipos_diferentes CHECK (equipo_local_id <> equipo_visitante_id)
);

-- ============================================
-- TABLA: predictions
-- ============================================
CREATE TABLE IF NOT EXISTS predictions (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id bigint NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  pred_goles_local int NOT NULL CHECK (pred_goles_local >= 0),
  pred_goles_visitante int NOT NULL CHECK (pred_goles_visitante >= 0),
  puntos int DEFAULT 0,
  estado prediction_status DEFAULT 'pendiente',
  created_at timestamp DEFAULT now(),
  CONSTRAINT prediccion_unica UNIQUE (user_id, match_id)
);

-- ============================================
-- TABLAS: rooms / room_members
-- ============================================
-- Reparacion para bases donde estas tablas ya existian con user_id/creator_id como bigint.
-- CREATE TABLE IF NOT EXISTS no corrige tipos existentes, por eso se recrean si estan mal.
DO $$ BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'rooms'
      AND column_name = 'creator_id'
      AND data_type <> 'uuid'
  ) OR EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'room_members'
      AND column_name = 'user_id'
      AND data_type <> 'uuid'
  ) THEN
    DROP TABLE IF EXISTS public.room_members;
    DROP TABLE IF EXISTS public.rooms;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS rooms (
  id bigserial PRIMARY KEY,
  name varchar(100) NOT NULL,
  code varchar(6) NOT NULL UNIQUE,
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS room_members (
  room_id bigint NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamp DEFAULT now(),
  PRIMARY KEY (room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id);

-- ============================================
-- TABLA: group_standings
-- ============================================
CREATE TABLE IF NOT EXISTS group_standings (
  id bigserial PRIMARY KEY,
  team_id bigint NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  grupo varchar(1) NOT NULL,
  partidos_jugados int DEFAULT 0,
  victorias int DEFAULT 0,
  empates int DEFAULT 0,
  derrotas int DEFAULT 0,
  goles_favor int DEFAULT 0,
  goles_contra int DEFAULT 0,
  diferencia_gol int DEFAULT 0,
  puntos int DEFAULT 0,
  CONSTRAINT equipo_grupo_unico UNIQUE (team_id, grupo)
);

-- ============================================
-- TABLA: simulation_logs
-- ============================================
CREATE TABLE IF NOT EXISTS simulation_logs (
  id bigserial PRIMARY KEY,
  match_id bigint NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  descripcion text,
  datos jsonb,
  created_at timestamp DEFAULT now()
);

-- ============================================
-- DATOS INICIALES: categorías de estadísticas
-- ============================================
INSERT INTO statistic_categories (nombre, descripcion) VALUES
('Ofensiva', 'Estadísticas relacionadas con goles, tiros y ataque'),
('Defensiva', 'Estadísticas relacionadas con goles recibidos y defensa'),
('Rendimiento', 'Datos generales de victorias, empates y derrotas'),
('Probabilidades', 'Probabilidades simuladas de victoria o clasificación')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- DATOS INICIALES: equipos
-- ============================================
INSERT INTO teams (nombre, pais_codigo, grupo, ranking_fifa, ataque, defensa, medio_campo, promedio_goles) VALUES
('Argentina', 'ARG', 'A', 1, 92, 88, 90, 2.10),
('Francia',   'FRA', 'A', 2, 94, 86, 89, 2.30),
('Brasil',    'BRA', 'B', 5, 91, 85, 88, 2.00),
('España',    'ESP', 'B', 8, 87, 84, 91, 1.90),
('Inglaterra','ENG', 'C', 4, 89, 83, 87, 2.00),
('Alemania',  'GER', 'C', 10, 86, 82, 88, 1.80)
ON CONFLICT (nombre) DO NOTHING;

-- ============================================
-- DATOS INICIALES: standings por grupo
-- ============================================
INSERT INTO group_standings (team_id, grupo)
SELECT id, grupo FROM teams
ON CONFLICT (team_id, grupo) DO NOTHING;

-- Recarga el cache de PostgREST/Supabase para que la API REST vea tablas nuevas.
NOTIFY pgrst, 'reload schema';
