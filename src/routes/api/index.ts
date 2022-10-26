import express from 'express';

import { router as startRouter } from './start';

export const router = express.Router();

router.use('/start', startRouter);
