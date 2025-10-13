const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const AuditMaster = sequelize.define('logged_actions', {
        auditId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV1,
            primaryKey: true,
            unique: true,
        },
        schemaName: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        tableName: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        actionPerformed: {
            type: DataTypes.ENUM('I', 'D', 'U'),
            allowNull: false,
        },
        oldValue: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        newValue: {
            type: DataTypes.JSONB,
        },
        updatedBy: {
            type: DataTypes.UUID,
            references: {
                model: {
                    tableName: 'user_master',
                    schema: 'auth',
                },
                key: 'user_id',
            },
            allowNull: false
        },
        actionTimeStamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        }
    }, {
        schema: 'audit',
        tableName: 'logged_actions',
        timestamps: false,
        comment: 'This table stores audit logs for all tables, tracking changes to old and new data.',
        underscored: true,
        hasTrigger: true,
        freezeTableName: true,
        indexes: [
            {
                fields: ['updated_by'],
                name: 'idx_logged_actions_updated_by'
            },
            {
                fields: ['table_name'],
                name: 'idx_logged_actions_table_name'
            },
            {
                fields: ['schema_name'],
                name: 'idx_logged_actions_schema_name'
            },
            {
                fields: ['table_name', 'action_performed'],
                name: 'idx_logged_actions_table_action'
            }
        ]
    });

    return AuditMaster;
};