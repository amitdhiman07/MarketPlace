const { Client } = require('pg');
const logger = require('../logger');

async function createDatabaseIfNotExists(databaseName) {
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
        database: 'postgres',
    });

    try {
        await client.connect();
        const res = await client.query(
            'SELECT 1 FROM pg_database WHERE datname = $1',
            [databaseName]
        );

        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE "${databaseName}"`);
            logger.info(`Database "${databaseName}" created successfully.`);
        } else {
            logger.info(`Database "${databaseName}" already exists.`);
        }
    } catch (error) {
        logger.error('Failed to create database:', error);
        throw error;
    } finally {
        await client.end();
    }
}

module.exports = createDatabaseIfNotExists;