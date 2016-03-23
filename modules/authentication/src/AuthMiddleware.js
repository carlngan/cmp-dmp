"use strict";
const environment = process.env.NODE_ENV;

module.exports = class AuthMiddleware {

    constructor() {
    }

    static authenticateApi(){

        return function(req, res, next) {

            res.setHeader("X-Powered-By", "Carl Ngan");

            //if not access token or never logged in
            if(!req.session || !req.session.token){
                return res.status(401).send({code:"CMP-DMP", msg:"Unauthorized"});
            }
            //if access token expired
            else{
                next();
            }
        };
    };

    static authenticate(){

        return function(req, res, next) {

            res.setHeader("X-Powered-By", "Carl Ngan");

            //if not access token or never logged in
            if(!req.session || !req.session.token){
                req.session.redirectUrl = req.url;
                return res.redirect("/login");
            }
            else{
                next();
            }
        };
    };

};