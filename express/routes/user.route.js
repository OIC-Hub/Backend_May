const express = require("express");
const getUser = require("../controller/userData.controller")

const route = express.Router();

route.get("/getuser", getUser );

module.exports = route;




