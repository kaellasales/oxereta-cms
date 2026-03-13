require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './src/views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/',                   require('./src/routes/public'));
app.use('/auth',               require('./src/routes/auth'));
app.use('/api/articles',       require('./src/routes/api/articles'));
app.use('/admin', require('./src/routes/admin'));

const morgan = require('morgan');
app.use(morgan('dev'));

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;