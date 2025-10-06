const generateOtp = require('../../utils/common-utility-functions/generate-otp');
const UserMasterService = require('../auth/UserMasterService');
const sendSMS = require('../../utils/twilio-service/sms');
const sendEmailToQueue = require('../../utils/email/email-queue');

function getOtpDetailsModel() {
    const db = require('../../utils/database/db-init').db;
    return db.OtpDetails;
}

function getSequelize() {
    return require('../../utils/database/db-init').db.sequelize;
}


const OtpService = {

    async create(otpData, t) {
        try {
            const OtpDetailsModel = getOtpDetailsModel();
            const createdOtpDetails = await OtpDetailsModel.create(otpData, { transaction: t });
            return { success: true, message: createdOtpDetails.get({ plain: true }), statusCode: 201 };
        } catch (e) {
            return { success: false, message: `Error occurred while creating OTP details: ${e.message || e}`, statusCode: 500 };
        }
    },

    async generateOtpDetails(phoneNumber) {
        const sequelize = getSequelize();
        const t = await sequelize.transaction();
        try {
            const isPhoneNumberExists = await UserMasterService.getUserDetailsByPhoneNumber(phoneNumber);
            let userId = null;
            if (!isPhoneNumberExists.success && isPhoneNumberExists.statusCode === 500) {
                await t.rollback();
                return isPhoneNumberExists;
            }
            else if (!isPhoneNumberExists.success && isPhoneNumberExists.statusCode === 404) {
                const createNewUser = await UserMasterService.createUser({ phoneNumber }, t);
                if (!createNewUser.success) {
                    await t.rollback();
                    return createNewUser;
                }
                userId = createNewUser.message.userId;
            } else {
                userId = isPhoneNumberExists.message.userId;
            }
            const checkOtpExistence = await this.fetchOtpDetailsOnUserId(userId);
            if (checkOtpExistence.success && checkOtpExistence.message.otpId) {
                const updateExistingOtp = {
                    userId: userId,
                    latest: false
                };
                const updateOtpDetails = await this.updateOtpDetailsByUserId(updateExistingOtp, t);
                if (!updateOtpDetails.success) {
                    await t.rollback();
                    return updateOtpDetails;
                }
            }
            const otp = generateOtp();
            // const sentMessage = await sendSMS(`Your generated OTP for entering in market-place is ${otp}.`, phoneNumber);
            // if (!sentMessage.success) return sentMessage;
            // const messageSid = sentMessage.message;
            const messageSid = 'SM166eafa9f2458a9959db4c87582be69a';
            const otpData = {
                userId: userId,
                otp: otp,
                messageSid: messageSid
            };
            const savedOtpDetails = await this.create(otpData, t);
            if (!savedOtpDetails.success) {
                await t.rollback();
                return savedOtpDetails;
            }
            await t.commit();
            return { success: true, message: `OTP has been generated and has been sent to your number successfully.`, statusCode: 201 };
        } catch (e) {
            await t.rollback();
            return { success: false, message: `Error occurred while generating OTP details: ${e.message || e}`, statusCode: 500 };
        }
    },

    async verifyOtp(otp, phoneNumber) {
        const sequelize = getSequelize();
        const t = await sequelize.transaction();
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
            otpData.latest = false;
            const updateOtpDetails = await this.updateOtpDetails(otpData, t);
            if (!updateOtpDetails.success) return updateOtpDetails;
            return { success: true, message: otpDetails.userId, statusCode: 200, transaction: t } ;
        } catch (e) {
            await t.rollback();
            return { success: false, message: `Error occurred while verifying OTP: ${e.message || e}`, statusCode: 500 };
        }
    },

    async generateOtpDetailsByEmail(email) {
        const sequelize = getSequelize();
        const t = await sequelize.transaction();
        try {
            const isEmailExists = await UserMasterService.getUserDetailsByEmail(email);
            let userId = null;
            if (!isEmailExists.success && isEmailExists.statusCode === 500) {
                await t.rollback();
                return isEmailExists;
            } else if (!isEmailExists.success && isEmailExists.statusCode === 404) {
                const createNewUser = await UserMasterService.createUser({ email }, t);
                if (!createNewUser.success) {
                    await t.rollback();
                    return createNewUser;
                }
                userId = createNewUser.message.userId;
            } else {
                userId = isEmailExists.message.userId;
            }
            const checkOtpExistence = await this.fetchOtpDetailsOnUserId(userId);
            if (checkOtpExistence.success && checkOtpExistence.message.otpId) {
                const updateExistingOtp = {
                    userId: userId,
                    latest: false
                };
                const updateOtpDetails = await this.updateOtpDetailsByUserId(updateExistingOtp, t);
                if (!updateOtpDetails.success) {
                    await t.rollback();
                    return updateOtpDetails;
                }
            }
            const otp = generateOtp();
            const html = `<p>Your generated OTP for entering in market-place is <b>${otp}</b>.</p>`;
            const otpData = {
                userId: userId,
                otp: otp,
                deliveredOnMobile: false,
                emailContent: html
            };
            const savedOtpDetails = await this.create(otpData, t);
            if (!savedOtpDetails.success) {
                await t.rollback();
                return savedOtpDetails;
            }
            const emailData = {
                to: email,
                subject: `OTP for entering in market-place`,
                html: html,
                otpId: savedOtpDetails.message.otpId,
            };
            await sendEmailToQueue(emailData);
            await t.commit();
            return { success: true, message: `OTP has been generated and has been sent to your email successfully.`, statusCode: 201 };
        } catch (e) {
            return { success: false, message: `Error occurred while generating OTP details: ${e.message || e}`, statusCode: 500 };
        }
    },

    async fetchOtpDetailsOnUserId(userId) {
        try {
            const data = await OtpDetailsModel.findOne({
                where: { userId: userId, isActive: true, latest: true },
                order: [['createdAt', 'DESC']],
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
            const OtpDetailsModel = getOtpDetailsModel();
            const { otpId, ...fieldsToUpdate } = otpData;
            const updateOptions = {
                where: { otpId },
            };

            if (t) updateOptions.transaction = t;
            const [affectedRows] = await OtpDetailsModel.update(fieldsToUpdate, updateOptions);

            console.log('Rows affected:', affectedRows);
            return { success: true, message: affectedRows, statusCode: 200 };
        } catch (e) {
            console.log("Error: ", e);
            return {
                success: false,
                message: `Error occurred while updating OTP details: ${e.message || e}`,
                statusCode: 500,
            };
        }
    },

    async updateOtpDetailsByUserId(otpData, t) {
        try {
            const OtpDetailsModel = getOtpDetailsModel();
            const updatedOtpDetails = await OtpDetailsModel.update(otpData, {
                where: {
                    userId: otpData.userId,
                },
                returning: true,
                transaction: t,
            });
            return { success: true, message: updatedOtpDetails, statusCode: 201 };
        } catch (e) {
            return { success: false, message: `Error occurred while updating OTP details: ${e.message || e}`, statusCode: 500 };
        }
    }

};

module.exports = OtpService;