"use strict";
const express = require('express');
const router = express.Router();
const AuthMiddleware = require('../../authentication/src/AuthMiddleware');

// =========================================================================
// Engine - GET ============================================================
// =========================================================================
router.get('/', AuthMiddleware.authenticate(), function(req, res) {
    res.render('layout');
});

module.exports = router;
