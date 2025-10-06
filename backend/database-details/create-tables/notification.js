const initialize = async (sequelize, DataTypes, db) => {
    const OtpDetails = require('../../models/notification-models/OtpDetails')(sequelize, DataTypes);
    db.OtpDetails = OtpDetails;

    await OtpDetails.sync({ force: false });
};

module.exports = { initialize };