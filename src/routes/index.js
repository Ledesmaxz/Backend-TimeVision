const express = require("express");
const user_routes_access = require("./userRoutes");
const auth_routes_access = require("./authRoutes");

const routes = express.Router();

const routes_system = (app) => {
    /* http://localhost:5000/api/v1 */
    routes.use("/user", user_routes_access);  
    routes.use("/", auth_routes_access);      
    
    app.use("/api/v1", routes);
};

module.exports = routes_system;
