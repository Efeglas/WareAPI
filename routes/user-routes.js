const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const { config } = require('../config/config.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { generateRefreshToken, getCorrectedDate } = require('../utility/utility.js');

router.post('/login', async (req, res, next) => {
    const data = req.body;

    //TODO JSON validálás
    //TODO ADAT VALIDÁLÁS

    let resultUser = await Database.models.UserModel.findOne({
      attributes: ['id', 'username'], include: [{model: Database.models.PasswordModel, attributes: ['password', 'oldPw'], where: {oldPw: 0}}, {model: Database.models.RoleModel, attributes: ['id', 'name']}], where: {username: data.username}
    });

    const planResultUser = resultUser.get({ plain: true });
    const passwordHash = planResultUser["Passwords"][0].password;
    
    bcrypt.compare(data.password, passwordHash, async (err, result) => {
      
      if (err) {
        res.status(500).json({ message: "Something went wrong" });
      } else { 
        if (result) {
              
          let token = jwToken.sign({
            id: planResultUser.id,
            username: planResultUser.username,
            role: planResultUser.Role.id,
            roleName: planResultUser.Role.name            
          }, config.jwtKey, { expiresIn: '15m' });
    
          const refToken = generateRefreshToken();

          let refreshTokenValidDate = getCorrectedDate(1);         
          refreshTokenValidDate.setDate(refreshTokenValidDate.getDate() + 7);
    
          let invalidateDate = getCorrectedDate(1);
          invalidateDate.setSeconds(invalidateDate.getSeconds() - 5);
    
          const updatedRefTokens = await Database.models.RefreshTokenModel.update({valid: invalidateDate}, {where: {UserId: planResultUser.id, valid: {[Op.gt]: getCorrectedDate(1)}}});
          const savedRefToken = await Database.models.RefreshTokenModel.create({ token: refToken, valid: refreshTokenValidDate, UserId: planResultUser.id });
    
          res.json({ message: "Successful login", data: {token: token, refreshToken: refToken, username: planResultUser.username, roleName: planResultUser.Role.name} });
        } else {
          res.json({ message: "Invalid username or password" });
        }
      }
    });
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