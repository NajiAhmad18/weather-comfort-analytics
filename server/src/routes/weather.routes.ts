import { Router } from 'express';
import { getCacheStatusController, getWeatherRankingsController } from '../controllers/weather.controller';

const router = Router();

router.get('/weather/rankings', getWeatherRankingsController);
router.get('/cache/status', getCacheStatusController);

export default router;
