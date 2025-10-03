const {CreateSchema} = require('../schema/schema');
const {Users} = require('../model/auth/user');

// For the Schema Creation
const SchemaCreation = async (sequelize) => {
    try{
        await CreateSchema(sequelize, 'auth');
        await CreateSchema(sequelize, 'post');
    }catch (e) {
        console.error(e);
    }
}

// For the Table Creation
const TableCreation = async (sequelize) => {
    try{
        await Users(sequelize);
    }catch (e) {
        console.error(e);
    }
}

module.exports = {SchemaCreation , TableCreation};