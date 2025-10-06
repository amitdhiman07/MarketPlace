const OtpService = require('../services/notifications/OtpDetailsService');
const { generateToken } = require('../middleware/generateJwt');
const { isValidPhoneNumber } = require('libphonenumber-js');

const generateOtp = async (req, res) => {
    try {
        const otpDetails = req.body;
        if (!otpDetails) return res.status(400).json({ message: 'Request body cannot be empty for generating OTP.' });
        const phoneNumber = otpDetails.phoneNumber;
        if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required.' });
        if (!isValidPhoneNumber(phoneNumber, 'IN')) return res.status(400).json({ message: 'Invalid Indian phone number.' });
        const otpDetailsResponse = await OtpService.generateOtpDetails(phoneNumber);
        if (!otpDetailsResponse.success) return res.status(otpDetailsResponse.statusCode).json({ success: false, message: otpDetailsResponse.message });
        return res.status(201).json({ success: true, message: otpDetailsResponse.message });
    } catch (e) {
        return res.status(500).json({ message: `Error occurred while generating OTP: ${e.message || e}` });
    }
};

const verifyOtp = async (req, res) => {
    let t;
    try {
        const otpDetails = req.body;
        if (!otpDetails) return res.status(400).json({ message: 'Request body cannot be empty for verifying OTP.' });
        const { otp, phoneNumber } = otpDetails;
        if (!phoneNumber || !otp) return res.status(400).json({ message: 'Phone number and OTP is required.' });
        const otpDetailsResponse = await OtpService.verifyOtp(otp, phoneNumber);
        if (!otpDetailsResponse.success) return res.status(otpDetailsResponse.statusCode).json({ success: false, message: otpDetailsResponse.message });
        t = otpDetailsResponse.transaction;
        const token = generateToken({ userId: otpDetailsResponse.message });
        await t.commit();
        return res.status(200).json({ success: true, phoneNumber: phoneNumber, message: `OTP Verified Successfully.`, token: token });
    } catch (e) {
        if (t) await t.rollback();
        return res.status(500).json({ message: `Error occurred while verifying OTP: ${e.message || e}` });
    }
}

module.exports = {
    generateOtp,
    verifyOtp,
};