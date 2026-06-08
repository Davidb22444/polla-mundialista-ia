import { supabase } from '../config/supabase.js';
import { httpError } from '../utils/httpError.js';

export async function getTeams(req, res, next) {
  try {
    const { group } = req.query;
    let query = supabase.from('teams').select('*').order('grupo').order('nombre');

    if (group) {
      query = query.eq('grupo', group);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getTeamById(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw httpError(404, 'Equipo no encontrado');

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function createTeam(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;

    // Crear fila en standings; si ya existe (unique constraint), se ignora
    const { error: standingsError } = await supabase
      .from('group_standings')
      .insert({
        team_id: data.id,
        grupo: data.grupo
      });

    if (standingsError && standingsError.code !== '23505') {
      // 23505 = unique_violation (la fila ya existe, no es un error real)
      console.warn('Advertencia al crear standings para equipo:', standingsError.message);
    }

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}

export async function getTeamStatistics(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('team_statistics')
      .select('id, nombre, valor, statistic_categories(nombre, descripcion)')
      .eq('team_id', req.params.id)
      .order('nombre');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}
