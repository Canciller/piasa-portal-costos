import controller from '../controllers/user.controller';
const router = require('express').Router();

router.param('username', controller.load);

router.route('/').get(controller.getAll).post(controller.create);

router
  .route('/:username')
  .get(controller.get)
  .put(controller.update)
  .delete(controller.remove);

/*
router
  .route('/change/username/:username')
  .post(controller.changeUsername);

router
  .route('/change/email/:username')
  .post(controller.changeEmail);

router
  .route('/change/password/:username')
  .post(controller.changePassword);
  */

export default router;
