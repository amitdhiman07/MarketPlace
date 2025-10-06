const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserMaster = sequelize.define(
        'user_master',
        {
            userId: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV1,
                primaryKey: true,
                unique: true,
            },
            fullName: {
                type: DataTypes.STRING(300),
                validate: {
                    len: {
                        args: [1, 300],
                        msg: 'Full name must be between 1 and 300 characters.',
                    },
                },
            },
            gender: {
                type: DataTypes.STRING(1),
                allowNull: false,
                validate: {
                    isIn: {
                        args: [['M', 'F', 'P']],
                        msg: 'Gender must be either M, F, or P.',
                    },
                },
            },
            phoneNumber: {
                type: DataTypes.STRING(10),
                allowNull: false,
                unique: {
                    msg: 'Phone number already exists.',
                },
                validate: {
                    isNumeric: {
                        msg: 'Phone number must contain only digits.',
                    },
                    len: {
                        args: [10, 10],
                        msg: 'Phone number must be exactly 10 digits.',
                    },
                },
            },
            createdOn: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            modifiedOn: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            },
        },
        {
            schema: 'auth',
            tableName: 'user_master',
            timestamps: false,
            comment:
                'This table will store all the users information along with their phone numbers.',
            underscored: true,
            hasTrigger: true,
            freezeTableName: true,
            indexes: [
                {
                    name: 'idx_user_master_phone_number',
                    unique: true,
                    fields: ['phone_number'],
                },
            ],
        }
    );

    return UserMaster;
};