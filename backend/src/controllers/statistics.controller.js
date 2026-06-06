import { supabase } from '../config/supabase.js';

export async function getStatisticCategories(_req, res, next) {
  try {
    const { data, error } = await supabase
      .from('statistic_categories')
      .select('*')
      .order('nombre');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getTeamStatisticsByCategory(req, res, next) {
  try {
    const { team_id, category_id } = req.query;
    let query = supabase
      .from('team_statistics')
      .select('id, nombre, valor, teams(id, nombre, grupo), statistic_categories(id, nombre)')
      .order('nombre');

    if (team_id) {
      query = query.eq('team_id', team_id);
    }

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}
