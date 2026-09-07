import { Router } from 'express';
import { getCacheStatusController, getWeatherRankingsController, getCityForecastController } from '../controllers/weather.controller';
import { checkJwt } from '../middleware/auth.middleware';

const router = Router();

router.get('/weather/rankings', checkJwt, getWeatherRankingsController);
router.get('/weather/forecast/:cityCode', checkJwt, getCityForecastController);
router.get('/cache/status', checkJwt, getCacheStatusController);

export default router;

