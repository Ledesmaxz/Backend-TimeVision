const express = require("express");
const user_routes_access = require("./userRoutes");
const auth_routes_access = require("./authRoutes");
const request_routes_access = require("./requestRoutes");
const shift_routes_access = require("./shiftRoutes");
const assignment_routes_access = require("./assignmentRoutes");
const deparment_routes_access = require("./departamentRoutes");
const company_routes_access = require("./companyRoutes")

const routes = express.Router();

const routes_system = (app) => {

    /* http://localhost:3001/api/v1 */
    
    routes.use("/user", user_routes_access);  
    routes.use("/request", request_routes_access);  
    routes.use("/", auth_routes_access);      
    routes.use("/shift", shift_routes_access);  
    routes.use("/assignment", assignment_routes_access);      
    routes.use("/deparment", deparment_routes_access);  
    routes.use("/company", company_routes_access);  

    app.use("/api/v1", routes);
};

module.exports = routes_system;
