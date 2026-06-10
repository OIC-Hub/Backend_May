const express = require("express");
const addUser = require("../controller/userData.controller")

const route = express.Router();

// route.get("/getuser", getUser );
route.post('/adduser', addUser )

module.exports = route;




