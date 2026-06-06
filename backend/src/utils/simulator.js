function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomGoals(expectedGoals) {
  const base = Math.max(0.2, expectedGoals);
  const value = Math.round((Math.random() * base) + (Math.random() * base * 0.8));
  return clamp(value, 0, 7);
}

export function calculateProbabilities(localTeam, visitorTeam) {
  const localPower = localTeam.ataque * 0.45 + localTeam.defensa * 0.3 + localTeam.medio_campo * 0.25 + 5;
  const visitorPower = visitorTeam.ataque * 0.45 + visitorTeam.defensa * 0.3 + visitorTeam.medio_campo * 0.25;
  const total = localPower + visitorPower;
  const diff = Math.abs(localPower - visitorPower);

  const draw = clamp(30 - diff * 0.18, 14, 30);
  const remaining = 100 - draw;
  const local = (localPower / total) * remaining;
  const visitor = (visitorPower / total) * remaining;

  return {
    prob_local: Number(local.toFixed(2)),
    prob_empate: Number(draw.toFixed(2)),
    prob_visitante: Number(visitor.toFixed(2))
  };
}

export function simulateScore(localTeam, visitorTeam) {
  const localExpected = ((localTeam.ataque / 100) * 2.2) - ((visitorTeam.defensa / 100) * 0.9) + 0.4;
  const visitorExpected = ((visitorTeam.ataque / 100) * 2.0) - ((localTeam.defensa / 100) * 0.9) + 0.25;

  return {
    goles_local: randomGoals(localExpected),
    goles_visitante: randomGoals(visitorExpected)
  };
}

export function calculatePredictionPoints(prediction, match) {
  const exactScore =
    prediction.pred_goles_local === match.goles_local &&
    prediction.pred_goles_visitante === match.goles_visitante;

  if (exactScore) {
    return 5;
  }

  const predictedResult = Math.sign(prediction.pred_goles_local - prediction.pred_goles_visitante);
  const realResult = Math.sign(match.goles_local - match.goles_visitante);

  if (predictedResult === realResult) {
    return 3;
  }

  const guessedOneScore =
    prediction.pred_goles_local === match.goles_local ||
    prediction.pred_goles_visitante === match.goles_visitante;

  return guessedOneScore ? 1 : 0;
}
