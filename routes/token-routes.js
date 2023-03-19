const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const { config } = require('../config/config.js');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/', async (req, res, next) => {
    const data = req.body;
    

    res.json({ data: data.refreshToken });
});



module.exports = router;