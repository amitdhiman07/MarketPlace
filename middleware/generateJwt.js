const jwt = require('jsonwebtoken');

/**
 * Generates a JWT token for the user
 * @param {Object} payload - Payload to embed in the token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} - The generated JWT token
 * **/

function generateToken(payload, expiresIn = '1h') {
    if (!process.env.JWT_SIGNING_KEY) {
        throw new Error('No signing key is defined in the environment variables');
    }
    return jwt.sign(payload, process.env.JWT_SIGNING_KEY, { expiresIn });
}

module.exports = {
    generateToken
};