import { supabase } from '../config/supabase.js';
import { httpError } from '../utils/httpError.js';
import {
  calculatePredictionPoints,
  calculateProbabilities,
  simulateScore
} from '../utils/simulator.js';

export async function getMatches(req, res, next) {
  try {
    const { status, group, phase } = req.query;
    let query = supabase
      .from('matches')
      .select(`
        *,
        equipo_local:teams!matches_equipo_local_id_fkey(id, nombre, pais_codigo, grupo),
        equipo_visitante:teams!matches_equipo_visitante_id_fkey(id, nombre, pais_codigo, grupo)
      `)
      .order('fecha');

    if (status) {
      query = query.eq('estado', status);
    }

    if (group) {
      query = query.eq('grupo', group);
    }

    if (phase) {
      query = query.eq('fase', phase);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getMatchById(req, res, next) {
  try {
    const match = await findMatch(req.params.id);
    res.json(match);
  } catch (error) {
    next(error);
  }
}

export async function createMatch(req, res, next) {
  try {
    const { equipo_local_id, equipo_visitante_id, fecha, grupo, fase } = req.body;

    const [localTeam, visitorTeam] = await Promise.all([
      findTeam(equipo_local_id),
      findTeam(equipo_visitante_id)
    ]);

    const probabilities = calculateProbabilities(localTeam, visitorTeam);

    const { data, error } = await supabase
      .from('matches')
      .insert({
        equipo_local_id,
        equipo_visitante_id,
        fecha,
        grupo,
        fase,
        ...probabilities
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function simulateMatch(req, res, next) {
  try {
    const match = await findMatch(req.params.id);

    if (match.estado === 'finalizado') {
      throw httpError(409, 'Este partido ya fue finalizado');
    }

    const localTeam = match.equipo_local;
    const visitorTeam = match.equipo_visitante;
    const score = simulateScore(localTeam, visitorTeam);
    const probabilities = calculateProbabilities(localTeam, visitorTeam);

    const { data: updatedMatch, error } = await supabase
      .from('matches')
      .update({
        ...score,
        ...probabilities,
        estado: 'finalizado'
      })
      .eq('id', match.id)
      .select(`
        *,
        equipo_local:teams!matches_equipo_local_id_fkey(id, nombre, pais_codigo, grupo, ataque, defensa, medio_campo),
        equipo_visitante:teams!matches_equipo_visitante_id_fkey(id, nombre, pais_codigo, grupo, ataque, defensa, medio_campo)
      `)
      .single();

    if (error) throw error;

    await updateStandings(updatedMatch);
    await scorePredictions(updatedMatch);
    await createSimulationLog(updatedMatch);

    res.json(updatedMatch);
  } catch (error) {
    next(error);
  }
}

async function findTeam(id) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw httpError(404, 'Equipo no encontrado');

  return data;
}

async function findMatch(id) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      equipo_local:teams!matches_equipo_local_id_fkey(id, nombre, pais_codigo, grupo, ataque, defensa, medio_campo),
      equipo_visitante:teams!matches_equipo_visitante_id_fkey(id, nombre, pais_codigo, grupo, ataque, defensa, medio_campo)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) throw httpError(404, 'Partido no encontrado');

  return data;
}

async function updateStandings(match) {
  const localGoals = match.goles_local;
  const visitorGoals = match.goles_visitante;
  const localWon = localGoals > visitorGoals;
  const visitorWon = visitorGoals > localGoals;
  const draw = localGoals === visitorGoals;

  await updateTeamStanding({
    teamId: match.equipo_local_id,
    group: match.grupo || match.equipo_local.grupo,
    goalsFor: localGoals,
    goalsAgainst: visitorGoals,
    won: localWon,
    draw,
    lost: visitorWon
  });

  await updateTeamStanding({
    teamId: match.equipo_visitante_id,
    group: match.grupo || match.equipo_visitante.grupo,
    goalsFor: visitorGoals,
    goalsAgainst: localGoals,
    won: visitorWon,
    draw,
    lost: localWon
  });
}

async function updateTeamStanding(result) {
  const { data: current, error: currentError } = await supabase
    .from('group_standings')
    .select('*')
    .eq('team_id', result.teamId)
    .eq('grupo', result.group)
    .maybeSingle();

  if (currentError) throw currentError;

  const next = {
    team_id: result.teamId,
    grupo: result.group,
    partidos_jugados: (current?.partidos_jugados || 0) + 1,
    victorias: (current?.victorias || 0) + (result.won ? 1 : 0),
    empates: (current?.empates || 0) + (result.draw ? 1 : 0),
    derrotas: (current?.derrotas || 0) + (result.lost ? 1 : 0),
    goles_favor: (current?.goles_favor || 0) + result.goalsFor,
    goles_contra: (current?.goles_contra || 0) + result.goalsAgainst
  };

  next.diferencia_gol = next.goles_favor - next.goles_contra;
  next.puntos = next.victorias * 3 + next.empates;

  const { error } = await supabase
    .from('group_standings')
    .upsert(next, { onConflict: 'team_id,grupo' });

  if (error) throw error;
}

async function scorePredictions(match) {
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', match.id);

  if (error) throw error;

  for (const prediction of predictions) {
    const puntos = calculatePredictionPoints(prediction, match);

    const { error: updateError } = await supabase
      .from('predictions')
      .update({
        puntos,
        estado: 'calificada'
      })
      .eq('id', prediction.id);

    if (updateError) throw updateError;

    await refreshUserTotalPoints(prediction.user_id);
  }
}

async function refreshUserTotalPoints(userId) {
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('puntos')
    .eq('user_id', userId);

  if (error) throw error;

  const total = predictions.reduce((sum, prediction) => sum + prediction.puntos, 0);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ puntos_totales: total })
    .eq('id', userId);

  if (updateError) throw updateError;
}

async function createSimulationLog(match) {
  const { error } = await supabase
    .from('simulation_logs')
    .insert({
      match_id: match.id,
      descripcion: `${match.equipo_local.nombre} ${match.goles_local} - ${match.goles_visitante} ${match.equipo_visitante.nombre}`,
      datos: {
        local: match.equipo_local.nombre,
        visitante: match.equipo_visitante.nombre,
        goles_local: match.goles_local,
        goles_visitante: match.goles_visitante,
        prob_local: match.prob_local,
        prob_empate: match.prob_empate,
        prob_visitante: match.prob_visitante
      }
    });

  if (error) throw error;
}
