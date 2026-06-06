import { supabase } from '../config/supabase.js';
import { httpError } from '../utils/httpError.js';

function getResultStats(goalsFor, goalsAgainst) {
  if (goalsFor > goalsAgainst) {
    return { victorias: 1, empates: 0, derrotas: 0, puntos: 3 };
  }

  if (goalsFor === goalsAgainst) {
    return { victorias: 0, empates: 1, derrotas: 0, puntos: 1 };
  }

  return { victorias: 0, empates: 0, derrotas: 1, puntos: 0 };
}

async function upsertTeamStanding(teamId, group, goalsFor, goalsAgainst) {
  const result = getResultStats(goalsFor, goalsAgainst);

  const { data: current, error: currentError } = await supabase
    .from('group_standings')
    .select('*')
    .eq('team_id', teamId)
    .eq('grupo', group)
    .maybeSingle();

  if (currentError) {
    throw httpError(500, 'No se pudo consultar la tabla de posiciones', currentError.message);
  }

  const nextStanding = {
    team_id: teamId,
    grupo: group,
    partidos_jugados: Number(current?.partidos_jugados || 0) + 1,
    victorias: Number(current?.victorias || 0) + result.victorias,
    empates: Number(current?.empates || 0) + result.empates,
    derrotas: Number(current?.derrotas || 0) + result.derrotas,
    goles_favor: Number(current?.goles_favor || 0) + goalsFor,
    goles_contra: Number(current?.goles_contra || 0) + goalsAgainst,
    puntos: Number(current?.puntos || 0) + result.puntos
  };

  nextStanding.diferencia_gol = nextStanding.goles_favor - nextStanding.goles_contra;

  const query = current
    ? supabase.from('group_standings').update(nextStanding).eq('id', current.id)
    : supabase.from('group_standings').insert(nextStanding);

  const { error } = await query;
  if (error) throw httpError(500, 'No se pudo actualizar la tabla de posiciones', error.message);
}

export async function updateStandingsAfterMatch(match) {
  if (!match.grupo) return;

  await upsertTeamStanding(
    match.equipo_local_id,
    match.grupo,
    match.goles_local,
    match.goles_visitante
  );

  await upsertTeamStanding(
    match.equipo_visitante_id,
    match.grupo,
    match.goles_visitante,
    match.goles_local
  );
}
