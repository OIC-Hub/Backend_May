const express = require('express');
const {Homepage, Adduser, DataPage} = require('../controller/pageController')
const route = express();

route.get('/', Homepage);
route.get('/welcome', DataPage)
route.post('/add', Adduser)

module.exports = route;