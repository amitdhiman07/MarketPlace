const generateOtp = require('../../utils/common-utility-functions/generate-otp');
const db = require('../../utils/database/db-init').db;
const OtpDetailsService = db.OtpDetails;
const UserMasterService = require('../auth/UserMasterService');
const sendSMS = require('../../utils/twilio-service/sms');

const OtpService = {

    async generateOtpDetails(phoneNumber) {
        const t = await db.sequelize.transaction();
        try {
            const otp = generateOtp();
            const isPhoneNumberExists = await UserMasterService.getUserDetailsByPhoneNumber(phoneNumber);
            if (!isPhoneNumberExists.success && isPhoneNumberExists.statusCode === 500) return isPhoneNumberExists;
            const createNewUser = await UserMasterService.createUser({ phoneNumber }, t);
            if (!createNewUser.success) return createNewUser;
            const userId = createNewUser.message.userId;
            // const sentMessage = await sendSMS(`Your generated OTP for entering in market-place is ${otp}.`, phoneNumber);
            const sentMessage = await sendSMS(`Your generated OTP for entering in Market-place is ${otp}.`);
            if (!sentMessage.success) return sentMessage;
            const messageSid = sentMessage.message;
            const otpData = {
                userId: userId,
                otp: otp,
                messageSid: messageSid
            };
            await OtpDetailsService.create(otpData, { transaction: t });
            await t.commit();
            return { success: true, message: `OTP has been generated and has been sent to your number successfully.`, statusCode: 201 };
        } catch (e) {
            await t.rollback();
            return { success: false, message: `Error occurred while generating OTP details: ${e.message || e}`, statusCode: 500 };
        }
    }

};

module.exports = OtpService;