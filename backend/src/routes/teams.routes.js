import { Router } from 'express';
import {
  createTeam,
  getTeamById,
  getTeamStatistics,
  getTeams
} from '../controllers/teams.controller.js';

export const teamsRouter = Router();

teamsRouter.get('/', getTeams);
teamsRouter.post('/', createTeam);
teamsRouter.get('/:id', getTeamById);
teamsRouter.get('/:id/statistics', getTeamStatistics);
