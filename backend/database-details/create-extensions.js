const logger = require("../utils/logger");

exports.createExtensions = async (db) => {
    try {
        const extensions = require("./extensions/extensions");

        for (const query of extensions) {
            await db.sequelize.query(query);
        }

        logger.info(`Extensions have been created successfully.`);
    } catch (error) {
        logger.error(`Error occurred while creating extensions: ${error.message || error}`);
    }
};