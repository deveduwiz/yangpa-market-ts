import { Router } from 'express';
import * as saleController from '../controllers/sale.controller.js';
import authorization from '../middleware/authorization.js';
import upload from '../middleware/upload.js';

const router = Router();

router.use(authorization);

router.post('/', upload.single('photo'), saleController.createSale);
router.get('/', saleController.getSales);

// '/favorites' 는 '/:id' 보다 먼저 선언해야 한다.
// 아래에 두면 id="favorites" 로 잡혀서 NaN 조회가 된다.
router.get('/favorites', saleController.getFavorites);

router.get('/:id', saleController.getSaleById);
router.delete('/:id', saleController.deleteSale);
router.post('/:id/favorite', saleController.addFavorite);
router.delete('/:id/favorite', saleController.removeFavorite);

export default router;
