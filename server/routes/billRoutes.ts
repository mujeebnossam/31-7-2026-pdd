import { Router } from 'express';
import { getBills, createBill, updateBill, deleteBill, payBill } from '../controllers/billController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.get('/', getBills);
router.post('/', createBill);
router.put('/:id', updateBill);
router.post('/:id/pay', payBill);
router.delete('/:id', deleteBill);

export default router;
