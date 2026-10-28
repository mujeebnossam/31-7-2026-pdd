import { Router } from 'express';
import { getGoals, getGoalById, createGoal, updateGoal, deleteGoal, contributeToGoal } from '../controllers/goalController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getGoals);
router.get('/:id', getGoalById);
router.post('/', createGoal);
router.post('/:id/contribute', contributeToGoal);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
