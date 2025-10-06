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
            let userId = null;
            if (!isPhoneNumberExists.success && isPhoneNumberExists.statusCode === 500) { return isPhoneNumberExists; }
            else if (!isPhoneNumberExists.success && isPhoneNumberExists.statusCode === 404) {
                const createNewUser = await UserMasterService.createUser({ phoneNumber }, t);
                if (!createNewUser.success) return createNewUser;
                userId = createNewUser.message.userId;
            } else {
                userId = isPhoneNumberExists.message.userId;
            }
            // const sentMessage = await sendSMS(`Your generated OTP for entering in market-place is ${otp}.`, phoneNumber);
            // const sentMessage = await sendSMS(`Your generated OTP for entering in Market-place is ${otp}.`);
            // if (!sentMessage.success) return sentMessage;
            // const messageSid = sentMessage.message;
            const messageSid = 'SM166eafa9f2458a9959db4c87582be69a';
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
    },

    async verifyOtp(otp, phoneNumber) {
        const t = await db.sequelize.transaction();
        try {
            const userExistence = await UserMasterService.getUserDetailsByPhoneNumber(phoneNumber);
            if (!userExistence.success) return userExistence;
            const otpExistence = await this.fetchOtpDetailsOnUserId(userExistence.message.userId);
            if (!otpExistence.success) return otpExistence;
            const otpDetails = otpExistence.message;

            if (otpDetails.otp.toString() !== otp.toString()) return { success: false, message: 'Invalid OTP.', statusCode: 400 };
            const currentTime = new Date();

            const expiresAt = new Date(otpDetails.expiresAt);
            if (expiresAt < currentTime) return { success: false, message: 'OTP has expired.', statusCode: 410 };

            const otpData = {};
            otpData.otpId = otpDetails.otpId;
            otpData.isActive = false;
            const updateOtpDetails = await this.updateOtpDetails(otpData, t);
            if (!updateOtpDetails.success) return updateOtpDetails;
            return { success: true, message: otpDetails.userId, statusCode: 200, transaction: t } ;
        } catch (e) {
            await t.rollback();
            return { success: false, message: `Error occurred while verifying OTP: ${e.message || e}`, statusCode: 500 };
        }
    },

    async fetchOtpDetailsOnUserId(userId) {
        try {
            const data = await OtpDetailsService.findOne({
                where: { userId: userId, isActive: true },
                raw: true,
            });

            if (!data) return { success: false, message: 'Please retry sending OTP.', statusCode: 404 };

            return { success: true, message: data, statusCode: 200 };
        } catch (e) {
            return { success: false, message: `Error occurred while fetching OTP details: ${e.message || e}`, statusCode: 500 };
        }
    },

    async updateOtpDetails(otpData, t) {
        try {
            const updatedOtpDetails = await OtpDetailsService.update(otpData, {
                where: {
                    otpId: otpData.otpId,
                },
                transaction: t,
            })
            return { success: true, message: updatedOtpDetails, statusCode: 200}
        } catch (e) {
            return { success: false, message: `Error occurred while updating OTP details: ${e.message || e}`, statusCode: 500 };
        }
    },

};

module.exports = OtpService;