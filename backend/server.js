// Import libraries

// Environmental file
require('dotenv').config();

// Express framework
const express = require('express');
const app = express();

// Database files
const sequelize = require('./src/database/config/dbConnection');
const {TableCreation} = require("./src/database/helperFunction/helper");


// Table creation executor
TableCreation(sequelize).then(() => {console.log("successfully created the tabless")}).catch(err => console.log(err));


// Listen
app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
})