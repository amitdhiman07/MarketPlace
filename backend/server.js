// Import libraries

// Environmental file
require('dotenv').config();

// Express framework
const express = require('express');
const app = express();

// Database files
const sequelize = require('./src/database/config/dbConnection');
const {CreateSchema} = require("./src/database/schema/schema");



// Listen
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
})