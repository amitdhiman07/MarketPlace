const amqp = require('amqplib');
const logger = require('../logger');

async function sendEmailToQueue(emailData) {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await connection.createChannel();
        const queue = 'email_queue';

        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(emailData)), { persistent: true });
        logger.info(`Email sent to queue: ${queue}`);
        return { success: true, message: `Email sent to queue: ${queue}`, statusCode: 200 };
    } catch (e) {
        logger.error(`Failed to enqueue email: ${e.message || e}`);
        return { success: false, message: `Failed to enqueue email: ${e.message || e}`, statusCode: 500 }
    }
}

module.exports = sendEmailToQueue;