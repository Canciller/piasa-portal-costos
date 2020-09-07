import controller from '../controllers/group.controller';
const router = require('express').Router();

router.param('username', controller.load);

router.route('/').get(controller.getAll);

router.route('/link').post(controller.create);
router.route('/unlink').post(controller.remove);

router.route('/:username/linked').get(controller.getLinked);
router.route('/:username/unlinked').get(controller.getUnlinked);
router.route('/:username/all').get(controller.getLinkedAndUnlinked);

router.route('/:username/exists').get(controller.exists);

export default router;
