import controller from '../controllers/user.controller';
const router = require('express').Router();

router.param('username', controller.load);

router.route('/').get(controller.getAll).post(controller.create);

router
  .route('/:username')
  .get(controller.get)
  .put(controller.update)
  .delete(controller.remove);

router.route('/:username/activate').get(controller.activate);

router.route('/:username/deactivate').get(controller.deactivate);

export default router;
