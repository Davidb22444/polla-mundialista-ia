import { Router } from 'express';
import {
  createPrediction,
  getLeaderboard,
  getPredictions
} from '../controllers/predictions.controller.js';

export const predictionsRouter = Router();

predictionsRouter.get('/', getPredictions);
predictionsRouter.post('/', createPrediction);
predictionsRouter.get('/leaderboard', getLeaderboard);
