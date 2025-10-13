const logger = require("../utils/logger");

exports.createFunctionsAndTriggers = async (db) => {
    try {
        const createAuditTriggers = require("./triggers/createAuditTriggers");
        const getLovFunction = require("./functions/getLov");
        const createAuditFunction = require("./functions/auditFn");
        const auditTableReadOnly = require('./functions/audit-table-read-only');
        const auditTrigger = require("./triggers/audit-table-trigger");
        await db.sequelize.query(getLovFunction.getLov);
        await db.sequelize.query(createAuditFunction.auditFn);
        await db.sequelize.query(auditTableReadOnly.auditReadFn);
        await db.sequelize.query(auditTrigger.auditTrigger);
        await createAuditTriggers(db);
        logger.info(`Functions have been created`);
    } catch (error) {
        logger.error(error);
    }
};