
const {DataTypes, Sequelize} = require("sequelize");

// users table structure
const Users = async (sequelize) => {
    try {
        const users = await sequelize.define('users', {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            fullName: {
                type: DataTypes.STRING(40),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.TEXT,
                allowNull: false,
                unique: true,
            },
            isVerified: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            }
        }, {
            schema: 'auth',
            underscored: true,
            tableName: 'users'
        })
        console.log("successfully created the users table");
        return users;

    }catch (e) {
       console.error('Error while creating the users table' , e);
    }
}

module.exports = {Users};