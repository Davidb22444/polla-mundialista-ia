import { Router } from 'express';
import { getStandings } from '../controllers/standings.controller.js';

export const standingsRouter = Router();

standingsRouter.get('/', getStandings);
