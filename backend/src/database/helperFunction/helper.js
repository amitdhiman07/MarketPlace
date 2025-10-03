const {CreateSchema} = require('../schema/schema');

// For the Schema Creation
const SchemaCreation = async (sequelize) => {
    try{
        await CreateSchema(sequelize, 'auth');
        await CreateSchema(sequelize, 'post');
    }catch (e) {
        console.error(e);
    }
}

module.exports = {SchemaCreation};