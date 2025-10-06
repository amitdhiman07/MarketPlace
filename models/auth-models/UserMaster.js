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
                validate: {
                    isIn: {
                        args: [['M', 'F', 'P']],
                        msg: 'Gender must be either M, F, or P.',
                    },
                },
            },
            phoneNumber: {
                type: DataTypes.STRING(10),
                allowNull: true,
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
            email: {
                type: DataTypes.STRING(300),
                allowNull: true,
                unique: {
                    msg: 'Email address already exists.',
                },
                validate: {
                    isEmail: {
                        msg: 'Email address must be valid.',
                    },
                    len: {
                        args: [1, 300],
                        msg: 'Email address must be between 1 and 300 characters.',
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
            comment: 'This table will store all the users information along with their phone numbers.',
            underscored: true,
            hasTrigger: true,
            freezeTableName: true,
            indexes: [
                {
                    name: 'idx_user_master_phone_number',
                    unique: true,
                    fields: ['phone_number'],
                },
                {
                    name: 'idx_user_master_email',
                    unique: true,
                    fields: ['email'],
                },
            ],
            validate: {
                phoneOrEmailRequired() {
                    if (!this.phoneNumber && !this.email) {
                        throw new Error('Either phone number or email must be provided.');
                    }
                },
            },
        }
    );

    return UserMaster;
};