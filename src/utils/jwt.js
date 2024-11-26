const jwt = require("jsonwebtoken");
require("dotenv").config({ path: '../../.env' });
const JWT_SECRET_KEY = process.env.JWT_SECRET || 'localjwtexample';

const createAccessToken = (user) => {
    const expToken = new Date();
    expToken.setHours(expToken.getHours() + 2);

    const rol = user.id_boss ? "empleado" : "jefe";

    const payload = {
        token_type: "access",
        _id: user._id,
        rol, 
        iat: Date.now(),
        ep: expToken.getTime(),
    };

    return jwt.sign(payload, JWT_SECRET_KEY);
};

const createRefreshToken = (user) => {
    const expToken = new Date();
    expToken.setMonth(expToken.getMonth() + 1);

    const payload = {
        token_type: "refresh",
        _id: user._id,
        iat: Date.now(),
        ep: expToken.getTime(),
    };

    return jwt.sign(payload, JWT_SECRET_KEY);
};

const decoded = (token) => {
    return jwt.decode(token, JWT_SECRET_KEY);
};

module.exports = {
    createAccessToken,
    createRefreshToken,
    decoded,
};
