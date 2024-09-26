const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET;

const createAccessToken = (user) => {
    const expToken = new Date();
    expToken.setHours(expToken.getHours()+2);
    const payload = {
        token_type: "access",
        _id : _id,
        iat : Date.now(),
        ep : expToken.getTime(),
    };
    return jwt.sign(payload, JWT_SECRET_KEY);
};

const createRefreshToken = (user) => {
    const expToken = new Date();
    expToken.getMonth(expToken.getMonth()+1);
    const payload = {
        token_type: "refresh",
        _id : _id,
        iat : Date.now(),
        ep : expToken.getTime(),
    };
    return jwt.sign(payload, JWT_SECRET_KEY);
};

const decoded = (token) => {
    return jwt.decode(token, JWT_SECRET_KEY);
}

module.exports = {
    createAccessToken,
    createRefreshToken,
    decoded
};
