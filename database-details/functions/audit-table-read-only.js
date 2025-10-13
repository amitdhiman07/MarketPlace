module.exports.auditReadFn = `CREATE OR REPLACE FUNCTION audit_logged_actions_read_only()
RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'The audit.logged_actions table is read-only.';
END;
$$ LANGUAGE plpgsql;`;