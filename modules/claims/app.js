"use strict";
const express = require('express');
const path = require('path');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use('/pub/claims', express.static(path.join(__dirname, 'public')));

app.use('/templates/claims', require('./routes/templateRoutes.js'));

module.exports = app;
