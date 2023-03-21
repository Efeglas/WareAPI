const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const { config } = require('../config/config.js');
const router = express.Router();
const { generateRefreshToken, getCorrectedDate } = require('../utility/utility.js');
const { Op } = require('sequelize');

router.post('/', async (req, res, next) => {
    const data = req.body;
    
    //TODO validate JSON
    //TODO validate data

    let resultUser = await Database.models.UserModel.findOne({
        attributes: ['id', 'username'], include: [{model: Database.models.RoleModel, attributes: ['id', 'name']}], where: {username: data.username}
    });

    if (resultUser !== null) {
        
        const planResultUser = resultUser.get({ plain: true });
    
        const validRefToken = await Database.models.RefreshTokenModel.findOne({where: {UserId: planResultUser.id, token: data.refreshToken, valid: {[Op.gt]: getCorrectedDate(1)}}});
    
        if (validRefToken === null) {
    
            res.status(404).json({ message: "Resource not found" });
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
        
              const updatedRefTokens = await Database.models.RefreshTokenModel.update({valid: invalidateDate}, {where: {UserId: planResultUser.id, valid: {[Op.gt]: getCorrectedDate(1)}}});
              const savedRefToken = await Database.models.RefreshTokenModel.create({ token: refToken, valid: refreshTokenValidDate, UserId: planResultUser.id });
    
              res.json({ message: "New token provided", data: {token: token, refreshToken: refToken, tokenExpire: tokenExpireTime.getTime()} });
        }
    } else {
        res.status(404).json({ message: "Resource not found" });
    }
});

module.exports = router;