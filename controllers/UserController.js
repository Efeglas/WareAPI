const Database = require('../database/database.js');
const bcrypt = require('bcrypt');
const { config } = require('../config/config.js');
const jwToken = require('jsonwebtoken');
const { Op } = require('sequelize');
const { 
    generateRefreshToken, 
    getCorrectedDate, 
    toNormalForm, 
    generate2Char, 
    generateTemporaryPass,
    generateUsername
  } = require('../utility/utility.js');

class UserController {
    
    static async getUserProfile (data) {

        try {
            let resultUser = await Database.models.UserModel.findOne({
                attributes: ['id', 'username', 'firstName', 'lastName', 'email', 'phone'], 
                include: [{model: Database.models.RoleModel, attributes: ['name']}],     
                where: {id: data.userId}
              });
          
              if (resultUser !== null) {
                const plainResultUser = resultUser.get({ plain: true });               
                return {status: 200, message: `User data found`, data: plainResultUser};
              } else {                
                return {status: 406, message: `User data not found`, data: []};
              }
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'getUserProfile()'}]`, data: []};
        }       
    }

    static async getUsers () {

        try {
            const users = await Database.models.UserModel.findAll({                
                attributes: ['id', "username", "email", "firstName", "lastName", "phone"], 
                where: {visible: 1}, 
                include: [{model: Database.models.RoleModel}]             
            });                  
                    
            return {status: 200, message: `Users accessed`, data: users};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'getUsers()'}]`, data: []};
        }
    }

    static async changePassword (data) {

        try {

            let resultUser = await Database.models.UserModel.findOne({
                attributes: ['id', 'username', 'firstName', 'lastName'], 
                include: [
                  {model: Database.models.PasswordModel, attributes: ['password']},      
                ], 
                where: {username: data.username}
            });
            
            if (resultUser !== null) {
          
              if (data.oldpass === data.newpass) {   

                return {status: 406, message: `Old password can't match new password`, data: []};     
              } else {

                const plainResultUser = resultUser.get({ plain: true });
                const compare = await bcrypt.compare(data.oldpass, plainResultUser.Passwords[0].password);

                if (compare) {

                  const hash = await bcrypt.hash(data.newpass, config.bcrypt.saltRounds);
                  let password = await Database.models.PasswordModel.update({password: hash, ownPw: 1}, {where: {UserId: plainResultUser.id}});                          
                  return {status: 200, message: `Password changed`, data: []}; 
                } else {

                  return {status: 406, message: `Old password is invalid`, data: []}; 
                }                                              
              }
              
            } else { 

              return {status: 500, message: `Something went wrong`, data: []};
            }

        } catch (error) {
            return {status: 500, message: `Unexpected error [${'changePassword()'}]`, data: []};
        }
    }

    static async resetPassword (data) {

        try {
            
            let tempPassword = generateTemporaryPass();
      
            const hash = await bcrypt.hash(tempPassword, config.bcrypt.saltRounds);
            let password = await Database.models.PasswordModel.update({password: hash, ownPw: 0}, {where: {UserId: data.id}}); 
    
            console.log(`SMTP: username: ${data.username}, pass: ${tempPassword}`);
            return {status: 200, message: `Password restored`, data: []};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'resetPassword()'}]`, data: []};
        }
    }

    static async login (data) {

        try {

            let resultUser = await Database.models.UserModel.findOne({
                attributes: ['id', 'username', 'firstName', 'lastName'], 
                include: [
                  {model: Database.models.PasswordModel, attributes: ['password', 'ownPw']}, 
                  {model: Database.models.RoleModel, attributes: ['id', 'name'], include: [{model: Database.models.PermissionModel, required:false, attributes: ['id', 'name']}]}
                ], 
                where: {username: data.username, visible: 1}
              });
    
              if (resultUser === null) {
                return {status: 406, message: `Invalid username or password`, data: []}; 
              } else {
    
                const planResultUser = resultUser.get({ plain: true });
                const permissionArray = planResultUser.Role.Permissions.map((perm) =>{
                    return perm.id;
                  });
                const passwordHash = planResultUser["Passwords"][0].password;
    
                const compare = bcrypt.compare(data.password, passwordHash);
    
                if (compare) {
                    
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
                
                      const updatedRefTokens = await Database.models.RefreshTokenModel.update({valid: invalidateDate}, {where: {UserId: planResultUser.id, valid: {[Op.gt]: refreshTokenValidDate}}});
                      const savedRefToken = await Database.models.RefreshTokenModel.create({ token: refToken, valid: refreshTokenValidDate, UserId: planResultUser.id });
                
                      let tokenExpireTime = new Date();
                      tokenExpireTime.setMinutes(tokenExpireTime.getMinutes() + config.jwtTokenExpMinutes);
                                    
                      return {status: 200, message: `Successful login`, data: {
                        token: token, 
                        refreshToken: refToken, 
                        username: planResultUser.username, 
                        roleName: planResultUser.Role.name, 
                        ownPw: planResultUser["Passwords"][0].ownPw, 
                        fullName: `${planResultUser.lastName} ${planResultUser.firstName}`,
                        firstName: planResultUser.firstName,
                        permissions: permissionArray,
                        tokenExpire: tokenExpireTime.getTime(),
                        userId: planResultUser.id
                      }};
    
                } else {
                    return {status: 406, message: `Invalid username or password`, data: []}; 
                }
              }
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'login()'}]`, data: []};
        }      
    }

    static async logout (data) {

        try {

            let resultUser = await Database.models.UserModel.findOne({
                attributes: ['id'], where: {username: data.username}
              });
              const plainResultUser = resultUser.get({ plain: true });
            
              let invalidateDate = new Date();
              invalidateDate.setSeconds(invalidateDate.getSeconds() - 5);
                
              const updatedRefTokens = await Database.models.RefreshTokenModel.update({valid: invalidateDate}, {where: {UserId: plainResultUser.id, valid: {[Op.gt]: new Date()}}});
              
              return {status: 200, message: `Logged out successfully`, data: []}
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'logout()'}]`, data: []};
        }
    }

    static async register (data) {

        try {
            let user = await generateUsername(data.lastName, Database);
            let tempPassword = generateTemporaryPass();
            console.log(user, tempPassword);
            let newUser = await Database.models.UserModel.create({
              username: user,
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              phone: data.phone,
              RoleId: data.role
            });
        
            const hash = await bcrypt.hash(tempPassword, config.bcrypt.saltRounds);
            let password = await Database.models.PasswordModel.create({password: hash, ownPw: 0, UserId: newUser.id});     
        
            console.log(`SMTP: user: ${user} tempPass: ${tempPassword}`);
                  
            return {status: 200, message: `User created, email sent`, data: []};
    
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'register()'}]`, data: []};
        }
    }

    static async deleteUser (data) {

        try {
            
            let updatedUser = await Database.models.UserModel.update({            
                visible: 0
            }, {where: {id: data.id}});
                       
              return {status: 200, message: `User deleted`, data: []};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'deleteUser()'}]`, data: []};
        }
    }

    static async editUser (data) {

        try {
            let updatedUser = await Database.models.UserModel.update({            
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                RoleId: data.role
              }, {where: {id: data.id}});
                       
              return {status: 200, message: `User updated`, data: []};
        } catch (error) {
            return {status: 500, message: `Unexpected error [${'editUser()'}]`, data: []};
        }
    }
}

module.exports = UserController;