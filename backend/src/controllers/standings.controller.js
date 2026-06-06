import { supabase } from '../config/supabase.js';

export async function getStandings(req, res, next) {
  try {
    const { group } = req.query;
    let query = supabase
      .from('group_standings')
      .select('*, teams(id, nombre, pais_codigo)')
      .order('grupo')
      .order('puntos', { ascending: false })
      .order('diferencia_gol', { ascending: false })
      .order('goles_favor', { ascending: false });

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
