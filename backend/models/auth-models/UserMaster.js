const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserMaster = sequelize.define('user_master', {
            userId: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV1,
                primaryKey: true,
                unique: true,
            },
            fullName: {
                type: DataTypes.STRING(300),
                validate: {
                    len: {
                        args: [1, 300],
                        msg: 'Full name must be between 1 and 300 characters.'
                    }
                }
            },
            phoneNumber: {
                type: DataTypes.STRING(10),
                allowNull: false,
                unique: {
                    msg: 'Phone number already exists.'
                },
                validate: {
                    isNumeric: {
                        msg: 'Phone number must contain only digits.'
                    },
                    len: {
                        args: [10, 10],
                        msg: 'Phone number must be exactly 10 digits.'
                    }
                }
            },
            createdOn: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            modifiedOn: {
                type: DataTypes.DATE,
                allowNull: true,
            },
            isActive: {
                type: DataTypes.BOOLEAN,
                defaultValue: true,
            }
        },
        {
            schema: 'auth',
            tableName: 'user_master',
            timestamps: false,
            comment: 'This table will store all the users information along with their phone numbers.',
            underscored: true,
            hasTrigger: true,
            freezeTableName: true,
        });

    return UserMaster;
};