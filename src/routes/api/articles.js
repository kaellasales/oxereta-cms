const router = require('express').Router();
const { authenticate, authorize } = require('../../middlewares/auth');
const { validateArticle, handleValidation } = require('../../middlewares/validate');
const ctrl = require('../../controllers/articleController');

router.get('/',       ctrl.listPublished);
router.get('/all',    authenticate, authorize('editor'), ctrl.listAll);
router.get('/:id',    ctrl.getOne);
router.post('/',      authenticate, validateArticle, handleValidation, ctrl.create);
router.put('/:id',    authenticate, validateArticle, handleValidation, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;