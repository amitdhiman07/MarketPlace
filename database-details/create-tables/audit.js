const initialize = async (sequelize, DataTypes, db) => {
    const AuditMaster = require('../../models/audit-models/AuditMaster')(sequelize, DataTypes);
    db.AuditMaster = AuditMaster;

    await AuditMaster.sync({ force: false });
};

module.exports = { initialize };