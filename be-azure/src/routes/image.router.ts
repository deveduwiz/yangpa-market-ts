import { Router } from 'express';
import * as imageController from '../controllers/image.controller.js';

const router = Router();

router.get('/:filename', imageController.getImage);

export default router;
