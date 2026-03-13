const router = require('express').Router();
const { authenticate } = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const ctrl = require('../controllers/adminController');

router.use(authenticate);

router.get('/articles',             ctrl.listArticles);
router.get('/articles/new',         ctrl.showCreate);
router.post('/articles',            upload.single('coverImage'), ctrl.create);
router.get('/articles/:id/edit',    ctrl.showEdit);
router.post('/articles/:id',        upload.single('coverImage'), ctrl.update);
router.post('/articles/:id/delete', ctrl.delete);

module.exports = router;