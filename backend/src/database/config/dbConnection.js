// Import ORM
const {Sequelize} = require('sequelize');
const {SchemaCreation} = require('../helperFunction/helper');

// Configuration
const sequelize = new Sequelize(process.env.DB_NAME , process.env.DB_USER, process.env.DB_PASSWORD ,{
    host : process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT,
})

// Testing the database connection
sequelize.authenticate()
    .then(() => console.log("Successfully connected to database"))
    .catch(err => console.log(err));

// Schema creation
SchemaCreation(sequelize).then(() => {console.log("Schema has been created successfully")}).catch(err => console.log(err));

// Synchronization with the database
sequelize.sync({force: true});

module.exports = sequelize;