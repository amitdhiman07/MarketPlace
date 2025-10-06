const logger = require('../utils/logger');
const creatingSchema = require('./schema-creation');
const { createExtensions } = require('./create-extensions');
const auth = require('./create-tables/auth');
const notification = require('./create-tables/notification');

const initializeDatabase = async (sequelize, DataTypes, db) => {
    try {
        // Creating schemas
        await creatingSchema(sequelize, DataTypes);

        // Creating extensions
        await createExtensions(db);
        await auth.initialize(sequelize, DataTypes, db);
        await notification.initialize(sequelize, DataTypes, db);

        logger.info('Database schemas and models initialized successfully');
    } catch (err) {
        logger.error('Database initialization error', err);
        throw err;
    }
};

module.exports = initializeDatabase;