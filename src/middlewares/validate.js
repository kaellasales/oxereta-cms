const { body, validationResult } = require('express-validator');

exports.validateArticle = [
  body('title')
    .trim()
    .notEmpty().withMessage('Título é obrigatório')
    .isLength({ max: 255 }).withMessage('Título muito longo'),
  body('content')
    .trim()
    .notEmpty().withMessage('Conteúdo é obrigatório'),
  body('status')
    .isIn(['draft', 'scheduled', 'published']).withMessage('Status inválido'),
  body('publishedAt')
    .if(body('status').equals('scheduled'))
    .notEmpty().withMessage('Data é obrigatória para artigos agendados')
    .isISO8601().withMessage('Data inválida')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('A data de agendamento deve ser no futuro');
      }
      return true;
    }),
  body('coverImage')
    .optional({ nullable: true, checkFalsy: true })
    .isURL().withMessage('URL da imagem inválida'),
];

exports.validateLogin = [
  body('email').trim().isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};