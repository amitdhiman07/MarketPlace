const initialize = async (sequelize, DataTypes, db) => {
    const UserMaster = require('../../models/auth-models/UserMaster')(sequelize, DataTypes);
    db.UserMaster = UserMaster;

    await UserMaster.sync({ force: false });
};

module.exports = { initialize };
