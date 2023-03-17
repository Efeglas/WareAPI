const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const { config } = require('../config/config.js');
const router = express.Router();
const bcrypt = require('bcrypt');

router.post('/login', async (req, res, next) => {
    const data = req.body;

    jwt.sign({
        data: 'foobar'
      }, config.jwtKey, { expiresIn: '1h' });

    try {
        init();
          
    } catch (error) {
      next(error);
    }
});

router.post('/register', async (req, res, next) => {
    const data = req.body;

    try {
        
          
    } catch (error) {
      next(error);
    }
});

router.get('/test', async (req, res, next) => {
    
    bcrypt.hash("admin", config.bcrypt.saltRounds, function(err, hash) {
        //console.log(hash);
        bcrypt.compare("admin", hash, function(err1, result) {
            
            res.json({ hash: hash, compare: result });
        });
    });

});

const init = async () => {

    try {     
      setTimeout(async () => {

        const UserModel = Database.models.UserModel;
        const user = await UserModel.create({ 
          firstName: "Attila", 
          lastName: "Gábor", 
          username: "asdf",
          phone: "06305867770",
          password: "12345",
        });
        console.log(user.id);
      }, 3000);

    } catch (error) {
      console.error("Cannot create user:", error.message);
    } 
}

module.exports = router;