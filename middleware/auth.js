const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let decodedToken;
    const header = req.get('Authorization');
    if (!header) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = header.split(' ')[1];
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SIGNING_KEY);
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed: token expired.' });
    }
    if (!decodedToken) {
        return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
    }
    req.userId = decodedToken.userId;
    next();
}