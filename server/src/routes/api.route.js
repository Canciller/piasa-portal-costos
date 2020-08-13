import jsonwebtoken from 'jsonwebtoken';

import NotFound from '../util/error/NotFound';
import error from '../middleware/error';

import userRouter from './user.route';
import authRouter from './auth.route';

import checkPermissions from '../middleware/checkPermissions';

const router = require('express').Router();

router.use('/auth', authRouter);
router.use('/users', checkPermissions('users'), userRouter);

router.use('*', (res, req, next) =>
  next(new NotFound('API Route not implemented'))
);
router.use(error);

export default router;
