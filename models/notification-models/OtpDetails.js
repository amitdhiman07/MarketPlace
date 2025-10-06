const { DataTypes, fn, literal } = require('sequelize');

module.exports = (sequelize) => {
    const NotificationMaster = sequelize.define(
        'otp_master',
        {
            otpId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true,
                unique: true,
            },
            otp: {
                type: DataTypes.STRING(4),
                allowNull: false,
            },
            messageSid: {
                type: DataTypes.TEXT,
                allowNull: false,
                // unique: true,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            expiresAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: literal(`NOW() + INTERVAL '15 minutes'`)
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: {
                        tableName: 'user_master',
                        schema: 'auth',
                    },
                    key: 'user_id',
                },
            },
        },
        {
            schema: 'notification',
            tableName: 'otp_master',
            timestamps: false,
            comment: 'This table stores OTPs generated for users. Valid for 15 minutes, used once.',
            underscored: true,
            hasTrigger: true,
            freezeTableName: true,
            indexes: [
                {
                    name: 'idx_otp_master_user_id',
                    fields: ['user_id'],
                },
                {
                    name: 'idx_otp_master_is_active',
                    fields: ['is_active'],
                },
                {
                    name: 'idx_otp_master_otp',
                    fields: ['otp'],
                },
                {
                    name: 'uniq_user_active_otp',
                    unique: true,
                    fields: ['user_id', 'is_active'],
                },
            ],
        }
    );

    return NotificationMaster;
};