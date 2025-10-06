const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const logger = require('../logger');

const sendSMS = async (message, to = process.env.TWILIO_RECEIVE_PHONE_NUMBER) => {
    try {
        const sentMessage = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        return { success: true, message: sentMessage.sid, statusCode: 200 };
    } catch (error) {
        logger.error(`Error occurred while sending SMS: ${error.message || error}`);
        return { success: false, message: `Error occurred while sending SMS: ${error.message || error}`, statusCode: 500 };
    }
};

module.exports = sendSMS;