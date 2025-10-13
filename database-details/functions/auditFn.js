module.exports.auditFn = `
CREATE OR REPLACE FUNCTION audit.auditFn() RETURNS trigger AS $body$
DECLARE
    current_user_id UUID;
BEGIN
    BEGIN
        current_user_id := current_setting('app.current_user_id')::UUID;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'User ID not set in session. Use SET app.current_user_id = ''uuid'' before modifying data.';
    END;

    IF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit.logged_actions(audit_id, schema_name, table_name, action_performed, old_value, new_value, updated_by, action_time_stamp)
        VALUES (uuid_generate_v1(), TG_TABLE_SCHEMA::TEXT, TG_TABLE_NAME::TEXT, 'U', to_jsonb(OLD), to_jsonb(NEW), current_user_id, NOW());
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit.logged_actions(audit_id, schema_name, table_name, action_performed, old_value, new_value, updated_by, action_time_stamp)
        VALUES (uuid_generate_v1(), TG_TABLE_SCHEMA::TEXT, TG_TABLE_NAME::TEXT, 'D', to_jsonb(OLD), to_jsonb(NEW), current_user_id, NOW());
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$body$
LANGUAGE plpgsql VOLATILE;`;