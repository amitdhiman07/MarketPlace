const express = require('express');
const router = express.Router();
const handleMethodRouting = require('../handle-method-routings');
const isAuth = require('../../middleware/auth');

const mappings = {};

router.put('/', isAuth, (req, res) => {
    handleMethodRouting(req, res, mappings);
});

module.exports = router;