const Database = require('../database/database.js');
const { config } = require('../config/config.js');

const express = require('express');
const router = express.Router();

router.get('/', async (req, res, next) => {
    
    res.json({ message: "Admin users", data: config.infoPage });  
});

module.exports = router;