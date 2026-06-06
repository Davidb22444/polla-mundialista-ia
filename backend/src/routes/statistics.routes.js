import { Router } from 'express';
import {
  getStatisticCategories,
  getTeamStatisticsByCategory
} from '../controllers/statistics.controller.js';

export const statisticsRouter = Router();

statisticsRouter.get('/categories', getStatisticCategories);
statisticsRouter.get('/teams', getTeamStatisticsByCategory);
