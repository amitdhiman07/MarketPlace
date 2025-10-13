require("dotenv").config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const logger = require('../logger');
const OtpService = require('../../services/notifications/OtpDetailsService');
const { db, initializeDb } = require('../database/db-init');

async function consumeQueue() {
    // Initialize the database
    logger.info('Starting database initialization in consumer.js');
    await initializeDb();
    logger.info('Database initialization completed');
    // Verify OtpDetailsModel is defined
    if (!db.OtpDetails) {
        logger.error('OtpDetailsModel is undefined after initialization');
        throw new Error('OtpDetailsModel is undefined');
    }
    logger.info('OtpDetailsModel is defined:', !!db.OtpDetails);

    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'email_queue';

    await channel.assertQueue(queue, { durable: true });
    logger.info('Waiting for email jobs in queue...');

    channel.consume( queue,
        async (msg) => {
            if (msg !== null) {
                let messageSid;
                const emailData = JSON.parse(msg.content.toString());
                try {
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        host: process.env.EMAIL_HOST,
                        port: parseInt(process.env.EMAIL_PORT),
                        secure: false,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS
                        }
                    });
                    const result = await transporter.sendMail(emailData);
                    messageSid = result.messageId;
                    logger.info(`Message ID of email sent to ${emailData.to}: `, messageSid);
                    logger.info('Email sent to: ' + emailData.to);
                } catch (error) {
                    logger.error('Error sending email to:', emailData.to, error);
                } finally {
                    channel.ack(msg);
                    const updateData = {
                        otpId: emailData.otpId,
                        messageSid: messageSid,
                    };
                    await OtpService.updateOtpDetails(updateData, null);
                }
            }
        },
        { noAck: false }
    );
}

module.exports = consumeQueue;