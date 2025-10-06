const { createSchema } = require("../utils/database/schema");
const logger = require('../utils/logger');

const creatingSchema = async (sequelize) => {
    const schemas = ['auth', 'lov', 'notification', 'audit'];

    try {
        const results = await Promise.allSettled(
            schemas.map((schema) => createSchema(sequelize, schema))
        );

        results.forEach((result, index) => {
            const schema = schemas[index];
            if (result.status === 'fulfilled') {
                logger.info(`database -> ${schema} schema created`);
            } else {
                logger.error(`database -> ${schema} schema error`, result.reason);
            }
        });
    } catch (e) {
        logger.error("Unexpected error while creating schemas: " + e);
    }
};

module.exports = creatingSchema;