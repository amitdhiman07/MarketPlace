const OtpService = require('../services/notifications/OtpDetailsService');
const { generateToken } = require('../middleware/generateJwt');

const generateOtp = async (req, res) => {
    try {
        const otpDetails = req.body;
        if (!otpDetails) return res.status(400).json({ message: 'Request body cannot be empty for generating OTP.' });
        const phoneNumber = otpDetails.phoneNumber;
        if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required.' });
        const otpDetailsResponse = await OtpService.generateOtpDetails(phoneNumber);
        if (!otpDetailsResponse.success) return res.status(otpDetailsResponse.statusCode).json({ message: otpDetailsResponse.message });
        return res.status(201).json({ message: otpDetailsResponse.message });
    } catch (e) {
        return res.status(500).json({ message: `Error occurred while generating OTP: ${e.message || e}` });
    }
};

module.exports = {
    generateOtp,
};