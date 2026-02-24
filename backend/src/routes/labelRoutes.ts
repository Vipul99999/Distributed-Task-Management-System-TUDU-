import { Router } from 'express';
import * as labelController from '../controllers/labelController';
import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = Router();

router.use(isAuthenticated);

router.post('/', labelController.createLabel);
router.get('/', labelController.getLabels);
router.put('/:id', labelController.updateLabel);
router.delete('/:id', labelController.deleteLabel);

export default router;
