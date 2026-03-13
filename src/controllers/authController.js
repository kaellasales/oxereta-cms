const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.showLogin = (req, res) => {
  res.render('login', { error: null });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.render('login', { error: 'E-mail ou senha incorretos.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.render('login', { error: 'E-mail ou senha incorretos.' });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, { httpOnly: true });
    res.redirect('/admin/articles');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Erro interno. Tente novamente.' });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};