const logger = require("../utils/logger");

exports.createFunctionsAndTriggers = async (db) => {
    try {
        const createAuditTriggers = require("./triggers/createAuditTriggers");
        const getLovFunction = require("./functions/getLov");
        const createAuditFunction = require("./functions/auditFn");
        const auditTableReadOnly = require('./functions/audit-table-read-only');
        const auditTrigger = require("./triggers/audit-table-trigger");
        await createAuditTriggers(db);
        await db.sequelize.query(getLovFunction.getLov);
        await db.sequelize.query(createAuditFunction.auditFn);
        await db.sequelize.query(auditTableReadOnly.auditReadFn);
        await db.sequelize.query(auditTrigger.auditTrigger);
        logger.info(`Functions have been created`);
    } catch (error) {
        logger.error(error);
    }
};