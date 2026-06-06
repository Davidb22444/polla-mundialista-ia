import { supabase } from '../config/supabase.js';
import { httpError } from '../utils/httpError.js';

function calculatePredictionPoints(prediction, match) {
  const exactScore =
    prediction.pred_goles_local === match.goles_local &&
    prediction.pred_goles_visitante === match.goles_visitante;

  if (exactScore) return 5;

  const predictedResult = Math.sign(prediction.pred_goles_local - prediction.pred_goles_visitante);
  const realResult = Math.sign(match.goles_local - match.goles_visitante);

  if (predictedResult === realResult) return 3;

  return 0;
}

export async function scorePredictionsForMatch(match) {
  const { data: predictions, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', match.id);

  if (error) throw httpError(500, 'No se pudieron consultar las predicciones', error.message);

  for (const prediction of predictions) {
    const puntos = calculatePredictionPoints(prediction, match);

    const { error: predictionError } = await supabase
      .from('predictions')
      .update({ puntos, estado: 'calificada' })
      .eq('id', prediction.id);

    if (predictionError) {
      throw httpError(500, 'No se pudo calificar una prediccion', predictionError.message);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('puntos_totales')
      .eq('id', prediction.user_id)
      .single();

    if (profileError) {
      throw httpError(500, 'No se pudo consultar el usuario', profileError.message);
    }

    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ puntos_totales: Number(profile.puntos_totales || 0) + puntos })
      .eq('id', prediction.user_id);

    if (updateProfileError) {
      throw httpError(500, 'No se pudo actualizar el puntaje del usuario', updateProfileError.message);
    }
  }
}
