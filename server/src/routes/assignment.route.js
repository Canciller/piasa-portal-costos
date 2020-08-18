import controller from '../controllers/assignment.controller';
const router = require('express').Router();

router.param('username', controller.load);

router.route('/').get(controller.getAll);

router.route('/link').post(controller.create);
router.route('/unlink').post(controller.remove);

router.route('/:username').get(controller.get);

router.route('/:username/exists').get(controller.exists);

export default router;
