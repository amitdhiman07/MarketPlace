const express = require('express');
const router = express.Router();
const isAuth = require('../../middleware/auth');
const handleMethodRouting = require('../handle-method-routings');

const authenticatedMappings = {};

const unauthenticatedMappings = {};

router.post('/public', (req, res) => {
    handleMethodRouting(req, res, unauthenticatedMappings);
});

router.post('/', isAuth, (req, res) => {
    handleMethodRouting(req, res, authenticatedMappings);
});

module.exports = router;