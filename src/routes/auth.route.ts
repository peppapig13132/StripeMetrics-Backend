import { Router } from 'express';
import { login, signup, updatePassword } from '../controller/auth.controller';
import { checkDuplicatedEmail } from '../middleware/auth.middleware';

const router: Router = Router();

router.post('/signup', checkDuplicatedEmail, signup);
router.post('/login', login);
router.post('/change-password', updatePassword);

export default router;
