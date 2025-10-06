const express = require('express');
const router = express.Router();
const handleMethodRouting = require('../handle-method-routings');

const mappings = {};

router.get('/public', (req, res) => {
    handleMethodRouting(req, res, mappings);
});

module.exports = router;