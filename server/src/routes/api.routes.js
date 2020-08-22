import NotFoundError from '../util/error/NotFoundError';
import errorHandler from '../middleware/errorHandler';

import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import assignmentRoutes from './assignment.routes';
import budgetRoutes from './budget.routes';

import checkPermissions from '../middleware/checkPermissions';

const router = require('express').Router();

router.use('/auth', authRoutes);
router.use('/users', checkPermissions('users'), userRoutes);
router.use('/assignments', checkPermissions('assignments'), assignmentRoutes);
router.use('/budget', checkPermissions('budget'), budgetRoutes);

router.use('*', (res, req, next) => next(new NotFoundError()));
router.use(errorHandler);

export default router;
