import { Router } from 'express';
import { getCacheStatusController, getWeatherRankingsController } from '../controllers/weather.controller';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

router.get('/weather/rankings', checkJwt, getWeatherRankingsController);
router.get('/cache/status', checkJwt, getCacheStatusController);

export default router;

