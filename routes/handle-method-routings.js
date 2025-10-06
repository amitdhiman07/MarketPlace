const logger = require('../utils/logger');

const handleMethodRouting = (req, res, details) => {
    const { type } = req.query;
    const controller = details[type];
    if (controller) return controller(req, res);
    else {
        logger.error(`Controller for ${type} not found`);
        return res.status(404).json({ message: `Invalid method type: ${type}.` });
    }
}

module.exports = handleMethodRouting;