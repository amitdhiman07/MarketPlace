async function CreateSchema(sequelize , schemaName) {
    try{
        const newSchema = await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        console.log(`${schemaName} schema successfully created.`);
        return newSchema;
    }catch(err){
        console.error(`Error while creating ${schemaName} schema`,err);
    }
}

module.exports = {CreateSchema};