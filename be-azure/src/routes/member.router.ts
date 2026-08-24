import { Router } from 'express';
import * as memberController from '../controllers/member.controller.js';
import authorization from '../middleware/authorization.js';

const router = Router();

router.post('/sign-up', memberController.signUp);
router.post('/sign-in', memberController.signIn);
router.get('/me', authorization, memberController.me);

export default router;
