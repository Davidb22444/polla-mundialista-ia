import { Router } from 'express';
import { teamsRouter } from './teams.routes.js';
import { matchesRouter } from './matches.routes.js';
import { predictionsRouter } from './predictions.routes.js';
import { statisticsRouter } from './statistics.routes.js';
import { standingsRouter } from './standings.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

apiRouter.use('/teams', teamsRouter);
apiRouter.use('/matches', matchesRouter);
apiRouter.use('/predictions', predictionsRouter);
apiRouter.use('/statistics', statisticsRouter);
apiRouter.use('/standings', standingsRouter);
