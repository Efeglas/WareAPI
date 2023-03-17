const Database = require('../database/database.js');

const express = require('express');
const router = express.Router();

router.post('/', async (req, res, next) => {
    const data = req.body;

    try {
        init();
          
    } catch (error) {
      next(error);
    }
});

module.exports = router;