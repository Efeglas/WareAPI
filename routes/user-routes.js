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
    
    /* bcrypt.hash("admin", config.bcrypt.saltRounds, function(err, hash) {
        //console.log(hash);
        bcrypt.compare("admin", hash, function(err1, result) {
            
            res.json({ hash: hash, compare: result });
        });
    }); */

  /* let token = jwToken.sign({
      user: 'Efeglass',
      role: '1'
    }, config.jwtKey, { expiresIn: '1m' }); */

//"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiRWZlZ2xhc3MiLCJyb2xlIjoiMSIsImlhdCI6MTY3OTE1Nzk5MSwiZXhwIjoxNjc5MTU4MDUxfQ.tzGi4LXPaR09-NrSiYRDxlHlpTd4ua6BsYK90c0gPaw"
  //let decoded = jwToken.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiRWZlZ2xhc3MiLCJyb2xlIjoiMSIsImlhdCI6MTY3OTE1Nzk5MSwiZXhwIjoxNjc5MTU4MDUxfQ.tzGi4LXPaR09-NrSiYRDxlHlpTd4ua6BsYK90c0gPaw", config.jwtKey);


  /* jwt.verify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiRWZlZ2xhc3MiLCJyb2xlIjoiMSIsImlhdCI6MTY3OTE1Nzk5MSwiZXhwIjoxNjc5MTU4MDUxfQ.tzGi4LXPaR09-NrSiYRDxlHlpTd4ua6BsYK90c0gPaw", config.jwtKey, (err, decoded) => {
    //TokenExpiredError
    //JsonWebTokenError
    if (err) {
      
        //err = {
        //  name: 'JsonWebTokenError',
        //  message: 'jwt malformed'
        //}
      
    }
  }); */

  const generateRefreshToken = () =>{

    const randBegining = Math.random();
    const randEnd = Math.random();

    const strBegining = randBegining.toString(16);
    const hexBegining = strBegining.substr(2);

    const strEnd = randEnd.toString(16);
    const hexEnd = strEnd.substr(2);

    return `${hexBegining}.${hexEnd}`;
  }

  
  res.json({ token: generateRefreshToken() });
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