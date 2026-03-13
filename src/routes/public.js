const router = require('express').Router();
const ctrl = require('../controllers/publicController');

router.get('/',              ctrl.home);
router.get('/artigo/:slug',  ctrl.articleDetail);

module.exports = router;