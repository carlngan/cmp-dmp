"use strict";
const environment = process.env.NODE_ENV;
const moment = require('moment-timezone');
const request = require('request');

const config = require('../../../config/config.json')[environment];
const API_URL = config.apiUrl;

const express = require('express');
const router = express.Router();

router.get('/login', function (req, res) {
    res.render('login',{
        redirectUrl: req.query.redirectUrl || req.session.redirectUrl
    });
});
router.post('/api/login', function (req, res) {
    request({
            method: "POST",
            uri: API_URL+"/authentication/token",
            form: {
                username: req.body.username,
                password: req.body.password
            }
        },
        function (error, response, body) {
            if (error) {
                return res.status(500).send(error);
            }
            else if(response.statusCode !== 200){
                body = JSON.parse(body);
                return res.status(response.statusCode).send(body);
            }
            else{
                body = JSON.parse(body);
                req.session.token = body.value;
                req.session.save(function(err){
                    if(err){
                        return res.status(500).send(err);
                    }
                    else{
                        return res.status(response.statusCode).send(body.value);
                    }
                });
            }

        });
} );


router.get('/logout',  function (req, res) {
    req.session.token = null;
    res.render('login');
});


module.exports = router;
