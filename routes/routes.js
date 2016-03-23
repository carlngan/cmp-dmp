var express = require('express');
var router = express.Router();
var request = require("request");
var environment = process.env.NODE_ENV;
var config = require('../config/config.json')[environment];
var API_URL = config.apiUrl;


router.get('/', function(req, res) {
    res.render('login');
});
router.get('/login', function(req, res) {
    res.render('login');
});
router.all('/dashboard', function(req, res) {
    res.render('index');
});
router.get('/providers', function(req, res) {
    request({
            method: "GET",
            uri: API_URL+"/providers"
        },
        function (error, response, body) {
            if (error) {
                return res.status(500).send({_code:"PROVIDER-APP002", _msg:"Connection to API failed. Please try again later."});
            }
            var providers = JSON.parse(body);
            res.render('providers',{
                providers: providers
            });
            //res.status(response.statusCode).send(body);
            /*for(var i = 0; i < providers.length; i++){
                if
            }*/

        });
    //res.render('providers');
});
module.exports = router;
