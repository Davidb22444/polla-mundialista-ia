import { supabase } from '../config/supabase.js';
import { httpError } from '../utils/httpError.js';
import crypto from 'crypto';

// Utilidad para generar código de sala
function generateCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 caracteres
}

async function ensureProfile(userId, nombre = 'Jugador') {
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (findError) throw findError;
  if (profile) return;

  const { error: insertError } = await supabase
    .from('profiles')
    .insert({ id: userId, nombre });

  if (insertError) throw insertError;
}

export async function getRooms(req, res, next) {
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select(`id, name, code, creator_id, room_members(user_id)`);

    if (error) throw error;

    // Fetch all profiles to map IDs to names
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, nombre');

    if (profError) throw profError;

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.id] = p.nombre;
    });

    // Transformar para el frontend
    const formatted = rooms.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      creator: profileMap[r.creator_id] || 'Desconocido',
      members: r.room_members.map(m => profileMap[m.user_id]).filter(Boolean)
    }));

    res.json(formatted);
  } catch (error) {
    next(error);
  }
}

export async function createRoom(req, res, next) {
  try {
    const { name, userName } = req.body;
    // FIXME: El backend deberia saber el user_id autenticado.
    // Como no tenemos middleware de auth que pase user_id todavia (frontend no manda token),
    // asumiremos que el frontend mandará el userId por el body por ahora.
    const { userId } = req.body; 

    if (!name || !userId) throw httpError(400, 'Faltan datos (name, userId)');

    await ensureProfile(userId, userName);

    const code = generateCode();

    const { data: room, error } = await supabase
      .from('rooms')
      .insert({ name, code, creator_id: userId })
      .select()
      .single();

    if (error) throw error;

    // Agregar creador como miembro
    const { error: memberError } = await supabase
      .from('room_members')
      .insert({ room_id: room.id, user_id: userId });

    if (memberError) {
      await supabase.from('rooms').delete().eq('id', room.id);
      throw memberError;
    }

    res.status(201).json(room);
  } catch (error) {
    next(error);
  }
}

export async function joinRoom(req, res, next) {
  try {
    const { code, userId, userName } = req.body;
    if (!code || !userId) throw httpError(400, 'Faltan datos (code, userId)');

    await ensureProfile(userId, userName);

    // Buscar sala
    const { data: room, error: findError } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (findError) throw findError;
    if (!room) throw httpError(404, 'Sala no encontrada');

    // Unirse
    const { error: joinError } = await supabase
      .from('room_members')
      .insert({ room_id: room.id, user_id: userId });

    if (joinError && joinError.code !== '23505') throw joinError;

    res.json(room);
  } catch (error) {
    next(error);
  }
}

export async function leaveRoom(req, res, next) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) throw httpError(400, 'Falta userId');

    const { error } = await supabase
      .from('room_members')
      .delete()
      .eq('room_id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Saliste de la sala' });
  } catch (error) {
    next(error);
  }
}
