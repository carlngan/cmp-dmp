"use strict";
const dotenv = require('dotenv');
dotenv.load();
const environment = process.env.NODE_ENV;

const express = require('express');
const compression = require('compression');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const morgan = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const request = require('request');

const config = require('./config/config.json')[environment];
const API_URL = config.apiUrl;

const mongoose = require('mongoose');
const configDB = require('./config/database.json')[environment];

const app = express();

mongoose.connect(configDB.host, configDB.db, configDB.port,
    configDB.credentials,
    function(err) {
        if (err) {
            throw err;
        }
    });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(compression());

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(function(req, res, next){
    res.setHeader("X-Powered-By", "Carl Ngan");
    res.setHeader("Connection", "keep-alive");
    next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 604800000 }));
app.use('/bower', express.static(path.join(__dirname, 'bower_components'), { maxAge: 604800000 }));

//Sessions
app.use(session({
    secret: process.env.EXPRESS_SECRET,
    store: new MongoStore({
        db : configDB.db,
        collection: "sessions",
        host: configDB.host,
        port: configDB.port,
        username: configDB.credentials.user,
        password: configDB.credentials.pass,
        autoReconnect: true
    }),
    resave:false,
    saveUninitialized: true
}));


const AuthMiddleware = require("./modules/authentication/src/AuthMiddleware");

const authenticationModule = require('./modules/authentication/app');
app.use(authenticationModule);

const claimsModule = require('./modules/claims/app');
app.use(claimsModule);
/*
app.all("/api/myself", AuthMiddleware.authenticateApi(), function(req, res){
    res.status(200).send({
        provider: req.session.provider,
        employee: req.session.employee
    });
});*/

app.all("/api", AuthMiddleware.authenticateApi(), function(req, res){
    request({
            headers: {
                "Authorization": "Bearer "+req.session.token
            },
            method: req.method,
            uri: API_URL+req.headers.url,
            qs: req.query,
            json: req.body
        },
        function (error, response, body) {
            if (error) {
                console.log(error);
                return res.status(500).send({code:"CMP-DMP", msg:"Connection to API failed. Please try again later."});
            }
            res.status(response.statusCode).send(body);
        });
});

const engine = require('./modules/engine/app');
app.use(engine);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('index', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
