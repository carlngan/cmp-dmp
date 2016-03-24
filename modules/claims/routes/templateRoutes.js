"use strict";
const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../../authentication/src/AuthMiddleware');

// =========================================================================
// CLAIMS - GET ============================================================
// =========================================================================
router.get('/', AuthMiddleware.authenticate(), function(req, res) {
    res.render('index');
});

router.get('/create', AuthMiddleware.authenticate(), function(req, res) {
    res.render('modals/create');
});

router.get('/update', AuthMiddleware.authenticate(), function(req, res) {
    res.render('modals/update');
});

router.get('/delete', AuthMiddleware.authenticate(), function(req, res) {
    res.render('modals/delete');
});

router.get('/details', AuthMiddleware.authenticate(), function(req, res) {
    res.render('modals/details');
});

module.exports = router;
