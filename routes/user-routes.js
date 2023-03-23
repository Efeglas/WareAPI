const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const { config } = require('../config/config.js');
const router = express.Router();
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { generateRefreshToken, getCorrectedDate, toNormalForm, generate2Char, generateTemporaryPass } = require('../utility/utility.js');


router.post('/', async (req, res, next) => {
    const data = req.body;
    //data.token
    //data.userId

    let decodedToken = null;
    try {      
      decodedToken = jwToken.verify(data.token, config.jwtKey);
    } catch (error) {      
      res.status(406).json({ message: "Wrong token", error: error.message });
      return;
    }

    if (decodedToken !== null) {
      
      let resultUser = await Database.models.UserModel.findOne({
        attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'phone'], 
        include: [{model: Database.models.RoleModel, attributes: ['name']}],     
        where: {id: data.userId}
      });
  
      if (resultUser !== null) {
        const plainResultUser = resultUser.get({ plain: true });
        res.json({ message: "User data found", data: plainResultUser });
      } else {
        res.status(406).json({ message: "User data not found" });
      }
    } 

})

router.post('/get', async (req, res, next) => {
  const data = req.body;
  
  let decodedToken = null;
  try {      
    decodedToken = jwToken.verify(data.token, config.jwtKey);
  } catch (error) {      
    res.status(406).json({ message: "Wrong token", error: error.message });
    return;
  }

  if (decodedToken !== null) {
      
      const permissions = await Database.models.RolePermissionModel.findAll({raw: true, nest: true, attributes: ['PermissionId'], where: {RoleId: decodedToken.role, visible: 1}});
      const permissionArray = permissions.map((permNumber) => {
          return permNumber.PermissionId;
      });

      const accessRight = 2;
      
      if (permissionArray.includes(accessRight)) {

          const users = await Database.models.UserModel.findAll({                
              attributes: ['id', "username", "email", "firstName", "lastName", "phone"], 
              where: {visible: 1}, 
              include: [{model: Database.models.RoleModel}]             
          });                  

          res.json({ message: "Users accessed", data: users});
          return

      } else {
          res.status(401).json({ message: "Access denied"});
          return;
      }

  }
})

router.post('/password', async (req, res, next) => {
  const data = req.body;

  //data.username
  //data.oldpass
  //data.newpass

  let resultUser = await Database.models.UserModel.findOne({
    attributes: ['id', 'username', 'firstName', 'lastName'], 
    include: [
      {model: Database.models.PasswordModel, attributes: ['password']},      
    ], 
    where: {username: data.username}
  });

  if (resultUser !== null) {

    if (data.oldpass === data.newpass) {
      res.status(406).json({ message: "Old password can't match new password" });     
    } else {
      
      const plainResultUser = resultUser.get({ plain: true });
      bcrypt.compare(data.oldpass, plainResultUser.Passwords[0].password, async (err, result) => {
        
        if (err) {
          res.status(500).json({ message: "Something went wrong" });
        } else { 
  
          if (result) {
            
            bcrypt.hash(data.newpass, config.bcrypt.saltRounds, async (errHash, hash) => {
              
              if (errHash) {
                res.status(500).json({ message: "Something went wrong" });
              } else { 
                let password = await Database.models.PasswordModel.update({password: hash, ownPw: 1}, {where: {UserId: plainResultUser.id}});
                res.json({ message: "Password changed" });     
              }
            });
          } else {
            res.status(406).json({ message: "Old password is invalid" });           
          }
        }       
      })    
    }
    
  } else {
    res.status(500).json({ message: "Something went wrong" });
  }

});

router.post('/login', async (req, res, next) => {
    const data = req.body;

    //TODO JSON validálás
    //TODO ADAT VALIDÁLÁS

    let resultUser = await Database.models.UserModel.findOne({
      attributes: ['id', 'username', 'firstName', 'lastName'], 
      include: [
        {model: Database.models.PasswordModel, attributes: ['password', 'ownPw']}, 
        {model: Database.models.RoleModel, attributes: ['id', 'name'], include: [{model: Database.models.PermissionModel, attributes: ['id', 'name'], where: {visible: 1}}]}
      ], 
      where: {username: data.username}
    });
    
    if (resultUser === null) {
      res.json({ message: "Invalid username or password" });
    } else {

      const planResultUser = resultUser.get({ plain: true });
      console.log();
      const permissionArray = planResultUser.Role.Permissions.map((perm) =>{
        return perm.id;
      });
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
            }, config.jwtKey, { expiresIn: `${config.jwtTokenExpMinutes}m` });
      
            const refToken = generateRefreshToken();
  
            //let refreshTokenValidDate = getCorrectedDate(1);    
            let refreshTokenValidDate = new Date();                 
            refreshTokenValidDate.setDate(refreshTokenValidDate.getDate() + config.refreshTokenValidDay);
      
            let invalidateDate = new Date();
            invalidateDate.setSeconds(invalidateDate.getSeconds() - 5);
      
            const updatedRefTokens = await Database.models.RefreshTokenModel.update({valid: invalidateDate}, {where: {UserId: planResultUser.id, valid: {[Op.gt]: getCorrectedDate(1)}}});
            const savedRefToken = await Database.models.RefreshTokenModel.create({ token: refToken, valid: refreshTokenValidDate, UserId: planResultUser.id });
      
            let tokenExpireTime = new Date();
            tokenExpireTime.setMinutes(tokenExpireTime.getMinutes() + config.jwtTokenExpMinutes);
            
            res.json({ message: "Successful login", data: {
              token: token, 
              refreshToken: refToken, 
              username: planResultUser.username, 
              roleName: planResultUser.Role.name, 
              ownPw: planResultUser["Passwords"][0].ownPw, 
              fullName: `${planResultUser.lastName} ${planResultUser.firstName}`,
              permissions: permissionArray,
              tokenExpire: tokenExpireTime.getTime(),
              userId: planResultUser.id
            } });
          } else {
            res.status(406).json({ message: "Invalid username or password" });
          }
        }
      });
    }
});

router.post('/logout', async (req, res, next) => {
  const data = req.body;

  //TODO validate JSON
  //TODO validate data

  let resultUser = await Database.models.UserModel.findOne({
    attributes: ['id'], where: {username: data.username}
  });
  const plainResultUser = resultUser.get({ plain: true });

  let invalidateDate = getCorrectedDate(1);
  invalidateDate.setSeconds(invalidateDate.getSeconds() - 5);
    
  const updatedRefTokens = await Database.models.RefreshTokenModel.update({valid: invalidateDate}, {where: {UserId: plainResultUser.id, valid: {[Op.gt]: getCorrectedDate(1)}}});
  res.json({ message: "Logged out successfully" });
});

router.post('/register', async (req, res, next) => {
    const data = req.body;
    
    let user = await generateUsername(data.lastname);

    let tempPassword = generateTemporaryPass();

    let newUser = await Database.models.UserModel.create({
      username: user,
      email: data.email,
      ownPW: 0,
      firstName: data.firstname,
      lastName: data.lastname,
      phone: data.phone,
      RoleId: data.role
    });

    bcrypt.hash(tempPassword, config.bcrypt.saltRounds, async (err, hash) => {
        
      let password = await Database.models.PasswordModel.create({password: hash, ownPw: 0, UserId: newUser.id});     
    });

    console.log(`SMTP: user: ${user} tempPass: ${tempPassword}`);

    res.json({ message: "User created", user: user,  tempPassword: tempPassword}); 
});

router.post('/delete', async (req, res, next) => {
  //TODO
});

router.post('/edit', async (req, res, next) => {
  //TODO
});

router.get('/test', async (req, res, next) => {
    
    bcrypt.hash("admin", config.bcrypt.saltRounds, function(err, hash) {
        //console.log(hash);
        bcrypt.compare("admin", hash, function(err1, result) {
            
            res.json({ hash: hash, compare: result });
        });
    }); 

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

  /* let data = await Database.models.RefreshTokenModel.findOne({where: {id: 72}});
  let valami = data.get({ plain: true });
  
  res.json({ token: valami }); */
});

const generateUsername = async (lastName) => {

  let number = 1;     
  let userBegining = toNormalForm(lastName.substring(0, 2));
  let randomChars = generate2Char();
  let userFix = "hrt";
  
  let userExists = null;

  do {
    
    let builtUsername = `${userBegining}${randomChars}${number}${userFix}`;

    userExists = await Database.models.UserModel.findOne({where: {username: builtUsername}});

    if (userExists === null) {         
      return builtUsername.toLowerCase();       
    } else {
      number++;
      if (number > 9) {
        number = 1;
        randomChars = generate2Char();
      }
    }
  } while (userExists !== null);

}

module.exports = router;