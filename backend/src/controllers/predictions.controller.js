import { supabase } from '../config/supabase.js';

export async function getPredictions(req, res, next) {
  try {
    const { user_id, match_id } = req.query;
    let query = supabase
      .from('predictions')
      .select(`
        *,
        profiles(id, nombre),
        matches(
          id,
          fecha,
          goles_local,
          goles_visitante,
          estado,
          equipo_local:teams!matches_equipo_local_id_fkey(id, nombre),
          equipo_visitante:teams!matches_equipo_visitante_id_fkey(id, nombre)
        )
      `)
      .order('created_at', { ascending: false });

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (match_id) {
      query = query.eq('match_id', match_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createPrediction(req, res, next) {
  try {
    const { user_id, match_id, pred_goles_local, pred_goles_visitante } = req.body;

    const { data, error } = await supabase
      .from('predictions')
      .upsert({
        user_id,
        match_id,
        pred_goles_local,
        pred_goles_visitante
      }, { onConflict: 'user_id,match_id' })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function getLeaderboard(_req, res, next) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nombre, avatar_url, puntos_totales')
      .order('puntos_totales', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}
