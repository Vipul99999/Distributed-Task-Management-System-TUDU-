import { Router } from 'express';
import * as improveController from '../controllers/improveController';
// import { isAuthenticated } from '../middlewares/isAuthenticated';

const router = Router();

// router.use(isAuthenticated);

// CRUD routes
router.post('/', improveController.createImprove);
router.get('/', improveController.getImproves);

// Static routes before dynamic
router.get('/stats', improveController.getStreaks);
router.get("/categories", improveController.getCategories);
router.post("/categories", improveController.setCategories);

// Dynamic routes
router.put('/:id', improveController.updateImprove);

export default router;
