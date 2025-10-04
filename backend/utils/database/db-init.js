const db = require('./db');
const createDatabaseIfNotExists = require('./create-db');
const logger = require('../logger');
const initializeDatabase = require('../../database-details/initialize-database');

async function initializeDb() {
    await createDatabaseIfNotExists(process.env.DB_DATABASE);

    try {
        await db.sequelize.authenticate();
        logger.info('Database connection established successfully.');

        await db.sequelize.sync({ force: false });
        await initializeDatabase(db.sequelize, db.Sequelize, db);
        logger.info('Database initialization completed.');
    } catch (error) {
        logger.error('Database initialization failed:', error);
        throw error;
    }
}

module.exports = {
    db,
    initializeDb,
};