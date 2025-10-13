const logger = require('../../utils/logger');

/**
 * Auto-generates and runs audit trigger creation SQL for all user-defined tables,
 * excluding specific tables.
 */
async function createAuditTriggers(db) {
    // List of tables to exclude from trigger creation
    const excludeTables = [
        { schema: 'audit', table: 'logged_actions' },
        { schema: 'notification', table: 'otp_master' }
    ];

    // Convert exclusions into a SQL condition string to filter out in query
    const exclusionCondition = excludeTables
        .map(t => `(table_schema = '${t.schema}' AND table_name = '${t.table}')`)
        .join(' OR ');

    const [results] = await db.sequelize.query(`
        SELECT
            table_schema,
            table_name,
            'CREATE OR REPLACE TRIGGER '
            || quote_ident(table_name || '_tgr')
            || ' BEFORE UPDATE OR DELETE ON '
            || quote_ident(table_schema) || '.' || quote_ident(table_name)
            || ' FOR EACH ROW EXECUTE FUNCTION audit.auditFn();' AS trigger_creation_query
        FROM information_schema.tables
        WHERE
            table_schema NOT IN ('pg_catalog', 'information_schema')
            AND table_schema NOT LIKE 'pg_toast%'
            AND table_type = 'BASE TABLE'
            ${exclusionCondition ? `AND NOT (${exclusionCondition})` : ''}
    `);

    for (const row of results) {
        try {
            await db.sequelize.query(row.trigger_creation_query);
            logger.info(`Trigger has been created successfully: ${row.trigger_creation_query}`);
        } catch (err) {
            // PostgreSQL error code is '42710' for already existing
            if (err.original && err.original.code === '42710') {
                logger.info(`Trigger already exists: skipping`);
            } else {
                logger.error(`Failed to create trigger:\n${row.trigger_creation_query}\nError: ${err.message}`);
            }
        }
    }
}

module.exports = createAuditTriggers;