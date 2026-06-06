import { Router } from 'express';
import {
  createMatch,
  getMatchById,
  getMatches,
  simulateMatch
} from '../controllers/matches.controller.js';

export const matchesRouter = Router();

matchesRouter.get('/', getMatches);
matchesRouter.post('/', createMatch);
matchesRouter.get('/:id', getMatchById);
matchesRouter.post('/:id/simulate', simulateMatch);
