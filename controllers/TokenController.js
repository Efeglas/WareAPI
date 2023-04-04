const Database = require('../database/database.js');
const jwToken = require('jsonwebtoken');
const { Op } = require('sequelize');
const { generateRefreshToken, controllerUnexpectedError } = require('../utility/utility.js');
const { config } = require('../config/config.js');

class TokenController {

    static async refreshToken (data) {
        try {
            let resultUser = await Database.models.UserModel.findOne({
                attributes: ['id', 'username'], include: [{model: Database.models.RoleModel, attributes: ['id', 'name']}], where: {username: data.username}
            });
        
            if (resultUser !== null) {
                
                const planResultUser = resultUser.get({ plain: true });
            
                const validRefToken = await Database.models.RefreshTokenModel.findOne({where: {UserId: planResultUser.id, token: data.refreshToken, valid: {[Op.gt]: new Date()}}});
            
                if (validRefToken === null) {
            
                    return {status: 404, message: `Resource not found`, data: []};
                } else {
            
                    let token = jwToken.sign({
                        id: planResultUser.id,
                        username: planResultUser.username,
                        role: planResultUser.Role.id,
                        roleName: planResultUser.Role.name            
                      }, config.jwtKey, { expiresIn: `${config.jwtTokenExpMinutes}m` });
                
                      const refToken = generateRefreshToken();
            
                      let refreshTokenValidDate = new Date();         
                      refreshTokenValidDate.setDate(refreshTokenValidDate.getDate() + config.refreshTokenValidDay);
                
                      let invalidateDate = new Date();
                      invalidateDate.setSeconds(invalidateDate.getSeconds() - 5);
            
                      let tokenExpireTime = new Date();
                      tokenExpireTime.setMinutes(tokenExpireTime.getMinutes() + config.jwtTokenExpMinutes);
                
                      const updatedRefTokens = await Database.models.RefreshTokenModel.update({valid: invalidateDate}, {where: {UserId: planResultUser.id, valid: {[Op.gt]: new Date()}}});
                      const savedRefToken = await Database.models.RefreshTokenModel.create({ token: refToken, valid: refreshTokenValidDate, UserId: planResultUser.id });
                               
                      return {status: 200, message: `New token provided`, data: {token: token, refreshToken: refToken, tokenExpire: tokenExpireTime.getTime()}};
                }
            } else {              
                return {status: 404, message: `Resource not found`, data: []};
            }
        } catch (error) {
            return controllerUnexpectedError(error);
        }
    }
}

module.exports = TokenController;