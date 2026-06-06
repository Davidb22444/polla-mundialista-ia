create type match_status as enum ('pendiente', 'simulado', 'finalizado');
create type prediction_status as enum ('pendiente', 'calificada');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre varchar(100) not null,
  avatar_url text,
  puntos_totales int default 0,
  created_at timestamp default now()
);

create table teams (
  id bigserial primary key,
  nombre varchar(100) not null unique,
  pais_codigo varchar(5),
  grupo varchar(1) not null,
  ranking_fifa int,
  ataque int not null check (ataque between 1 and 100),
  defensa int not null check (defensa between 1 and 100),
  medio_campo int not null check (medio_campo between 1 and 100),
  promedio_goles decimal(4,2) default 0,
  victorias int default 0,
  empates int default 0,
  derrotas int default 0,
  goles_favor int default 0,
  goles_contra int default 0,
  created_at timestamp default now()
);

create table statistic_categories (
  id bigserial primary key,
  nombre varchar(100) not null unique,
  descripcion text
);

create table team_statistics (
  id bigserial primary key,
  team_id bigint not null references teams(id) on delete cascade,
  category_id bigint not null references statistic_categories(id) on delete cascade,
  nombre varchar(100) not null,
  valor decimal(10,2) not null,
  created_at timestamp default now()
);

create table matches (
  id bigserial primary key,
  equipo_local_id bigint not null references teams(id),
  equipo_visitante_id bigint not null references teams(id),
  grupo varchar(1),
  fase varchar(50) default 'Fase de grupos',
  fecha timestamp not null,
  goles_local int,
  goles_visitante int,
  prob_local decimal(5,2),
  prob_empate decimal(5,2),
  prob_visitante decimal(5,2),
  estado match_status default 'pendiente',
  created_at timestamp default now(),
  constraint equipos_diferentes check (equipo_local_id <> equipo_visitante_id)
);

create table predictions (
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  match_id bigint not null references matches(id) on delete cascade,
  pred_goles_local int not null check (pred_goles_local >= 0),
  pred_goles_visitante int not null check (pred_goles_visitante >= 0),
  puntos int default 0,
  estado prediction_status default 'pendiente',
  created_at timestamp default now(),
  constraint prediccion_unica unique (user_id, match_id)
);

create table group_standings (
  id bigserial primary key,
  team_id bigint not null references teams(id) on delete cascade,
  grupo varchar(1) not null,
  partidos_jugados int default 0,
  victorias int default 0,
  empates int default 0,
  derrotas int default 0,
  goles_favor int default 0,
  goles_contra int default 0,
  diferencia_gol int default 0,
  puntos int default 0,
  constraint equipo_grupo_unico unique (team_id, grupo)
);

create table simulation_logs (
  id bigserial primary key,
  match_id bigint not null references matches(id) on delete cascade,
  descripcion text,
  datos jsonb,
  created_at timestamp default now()
);

insert into statistic_categories (nombre, descripcion) values
('Ofensiva', 'Estadisticas relacionadas con goles, tiros y ataque'),
('Defensiva', 'Estadisticas relacionadas con goles recibidos y defensa'),
('Rendimiento', 'Datos generales de victorias, empates y derrotas'),
('Probabilidades', 'Probabilidades simuladas de victoria o clasificacion');

insert into teams
(nombre, pais_codigo, grupo, ranking_fifa, ataque, defensa, medio_campo, promedio_goles)
values
('Argentina', 'ARG', 'A', 1, 92, 88, 90, 2.10),
('Francia', 'FRA', 'A', 2, 94, 86, 89, 2.30),
('Brasil', 'BRA', 'B', 5, 91, 85, 88, 2.00),
('Espana', 'ESP', 'B', 8, 87, 84, 91, 1.90),
('Inglaterra', 'ENG', 'C', 4, 89, 83, 87, 2.00),
('Alemania', 'GER', 'C', 10, 86, 82, 88, 1.80);

insert into group_standings (team_id, grupo)
select id, grupo from teams;
