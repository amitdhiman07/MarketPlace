const db = require('../../utils/database/db-init').db;
const { filterData } = require('../../utils/data-filteration/filter-data');
const UserMaster = db.UserMaster;

const UserMasterService = {

    async createUser(userDetails, t) {
        try {
            const createdUser = await UserMaster.create(userDetails, { transaction: t });
            const plainUserData = createdUser.get({ plain: true });
            return { success: true, message: filterData([plainUserData])[0], statusCode: 201 };
        } catch (e) {
            return { success: false, message: `Error occurred while creating user: ${e.message || e}`, statusCode: 500 };
        }
    },

    async getUserDetails(userId) {
        try {
            const userDetails = await UserMaster.findOne({ where: { userId: userId }, raw: true });
            if (!userDetails) return { success: false, message: 'User not found', statusCode: 404 };
            return { success: true, message: userDetails, statusCode: 200 };
        } catch (e) {
            return { success: false, message: `Error occurred while getting user details on the basis of user id: ${e.message || e}`, statusCode: 500 };
        }
    },

    async getUserDetailsByPhoneNumber(phoneNumber) {
        try {
            const userDetails = await UserMaster.findOne({ where: { phoneNumber: phoneNumber }, raw: true });
            if (!userDetails) return { success: false, message: 'User not found', statusCode: 404 };
            return { success: true, message: userDetails, statusCode: 200 };
        } catch (e) {
            return { success: false, message: `Error occurred while getting user details on the basis of phone number: ${e.message || e}`, statusCode: 500 };
        }
    }

};

module.exports = UserMasterService;