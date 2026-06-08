import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { supabase } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seed() {
  console.log('Iniciando seed de base de datos...');

  // Leer partidos.json
  const dataPath = path.resolve(__dirname, '../../../frontend/src/data/partidos.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);

  // 1. Limpiar tablas relevantes
  console.log('Limpiando tablas de datos...');
  await supabase.from('predictions').delete().neq('id', 0);
  await supabase.from('group_standings').delete().neq('id', 0);
  await supabase.from('matches').delete().neq('id', 0);
  await supabase.from('teams').delete().neq('id', 0);

  // 2. Insertar equipos
  console.log('Insertando equipos...');
  const equipos = Object.values(data.equipos).map(e => ({
    nombre: e.nombre,
    pais_codigo: e.code,
    grupo: (e.bandera || e.code === null) ? e.nombre.charAt(0) : 'A', // Esto es temporal, se actualizara en el paso de partidos. Wait, it needs a valid group. Let's map it correctly based on matches.
    ataque: e.ataque,
    defensa: e.defensa,
    medio_campo: 75, // Default si no existe
    ranking_fifa: e.ranking
  }));

  // Corregimos los grupos basados en los partidos
  const matchGroups = {};
  data.partidos.forEach(m => {
    const groupLetter = m.grupo.replace('Grupo ', '');
    matchGroups[m.local] = groupLetter;
    matchGroups[m.visitante] = groupLetter;
  });

  const finalEquipos = equipos.map(e => ({
    ...e,
    grupo: matchGroups[e.nombre] || 'A' // A por defecto
  }));

  const { data: insertedTeams, error: teamsError } = await supabase
    .from('teams')
    .insert(finalEquipos)
    .select();

  if (teamsError) {
    console.error('Error insertando equipos:', teamsError);
    return;
  }

  // 3. Crear map de team_id para matches
  const teamIdMap = {};
  insertedTeams.forEach(t => {
    teamIdMap[t.nombre] = t.id;
  });

  // 4. Crear standings iniciales
  console.log('Creando group standings iniciales...');
  const standings = insertedTeams.map(t => ({
    team_id: t.id,
    grupo: t.grupo
  }));

  const { error: standingsError } = await supabase
    .from('group_standings')
    .insert(standings);

  if (standingsError && standingsError.code !== '23505') {
    console.error('Error insertando standings:', standingsError);
  }

  // 5. Insertar Partidos
  console.log('Insertando partidos...');
  const matchesToInsert = data.partidos.map(m => {
    const localId = teamIdMap[m.local];
    const visitanteId = teamIdMap[m.visitante];
    
    if (!localId || !visitanteId) {
      console.warn(`Omitiendo partido ${m.local} vs ${m.visitante} por falta de ID`);
      return null;
    }

    return {
      equipo_local_id: localId,
      equipo_visitante_id: visitanteId,
      grupo: m.grupo.replace('Grupo ', ''),
      fecha: new Date(m.dia).toISOString(),
      estado: 'pendiente'
    };
  }).filter(Boolean);

  const { error: matchesError } = await supabase
    .from('matches')
    .insert(matchesToInsert);

  if (matchesError) {
    console.error('Error insertando partidos:', matchesError);
    return;
  }

  console.log('✅ Seed completado con éxito!');
}

seed().catch(console.error);
