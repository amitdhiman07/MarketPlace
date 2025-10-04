const logger = require('../logger');

module.exports.createSchema = (sequelize, schemaName) => {
    if (!schemaName) {
        logger.error("Schema name is not provided");
    }
    return sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)
        .then(() => {
            logger.info(`Schema ${schemaName} created or already exists`);
        })
        .catch((err) => {
            logger.error(`Error occurred while creating schema ${schemaName}`, err);
        });
};