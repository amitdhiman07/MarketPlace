const express = require('express');
const saveData = require('./crud-operations/save-data');
const fetchData = require('./crud-operations/fetch-data');
const fetchOne = require('./crud-operations/fetch-one');
const updateData = require('./crud-operations/update-data');
const { generateMobileOtp, verifyMobileOtp, generateEmailOtp } = require('../controller/generate-verify-otp');

const registerRoutes = (app) => {
    const apiRouter = express.Router();

    // Mounting specific route modules under their respective paths
    apiRouter.use('/create-data', saveData);
    apiRouter.use('/fetch-data', fetchData);
    apiRouter.use('/single-record', fetchOne);
    apiRouter.use('/update-data', updateData);
    apiRouter.use("/public/login/generate-mobile-otp", generateMobileOtp);
    apiRouter.use("/public/login/verify-mobile-otp", verifyMobileOtp);
    apiRouter.use("/public/login/generate-email-otp", generateEmailOtp);

    app.use('/api/market-place', apiRouter);
};

module.exports = { registerRoutes };