module.exports.auditTrigger = `CREATE TRIGGER trg_read_only_logged_actions
BEFORE INSERT OR UPDATE OR DELETE ON audit.logged_actions
FOR EACH STATEMENT
EXECUTE FUNCTION audit_logged_actions_read_only();`;