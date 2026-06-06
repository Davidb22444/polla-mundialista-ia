import { supabase } from '../config/supabase.js';
import { httpError } from '../utils/httpError.js';

export async function findMany(table, options = {}) {
  let query = supabase.from(table).select(options.select || '*');

  for (const [column, value] of Object.entries(options.filters || {})) {
    if (value !== undefined && value !== null && value !== '') {
      query = query.eq(column, value);
    }
  }

  if (options.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
  }

  const { data, error } = await query;
  if (error) throw httpError(500, `Error consultando ${table}`, error.message);

  return data;
}

export async function findById(table, id, select = '*') {
  const { data, error } = await supabase.from(table).select(select).eq('id', id).single();

  if (error) throw httpError(404, `No se encontro el registro en ${table}`, error.message);

  return data;
}

export async function createOne(table, payload) {
  const { data, error } = await supabase.from(table).insert(payload).select().single();

  if (error) throw httpError(400, `No se pudo crear en ${table}`, error.message);

  return data;
}

export async function updateById(table, id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw httpError(400, `No se pudo actualizar ${table}`, error.message);

  return data;
}
