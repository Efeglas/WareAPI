const jwToken = require('jsonwebtoken');
const { config } = require('../config/config.js');
const Database = require('../database/database.js');

module.exports.autenticated = (req, res, next) => {
    const data = req.body;

    req.midw = {};
    try {      
        req.midw.decodedToken = jwToken.verify(data.token, config.jwtKey);     
        next();
    } catch (error) {      
      res.status(406).json({ message: "Wrong token", error: error.message });
      return;
    }
}


module.exports.hasAccess = async (req, res, next) => {

    if (req.midw.accessRight !== undefined) {
        
        const permissions = await Database.models.RolePermissionModel.findAll({raw: true, nest: true, attributes: ['PermissionId'], where: {RoleId: req.midw.decodedToken.role, visible: 1}});
        const permissionArray = permissions.map((permNumber) => {
            return permNumber.PermissionId;
        });
        
        for (const right of req.midw.accessRight) {  
            console.log()  
            if (permissionArray.includes(right)) {
                  next();
                  return;
            }
        }
    
        res.status(401).json({ message: "Access denied"});
        return;   
    } else {
        next();
    }
}

//? ACCESS RIGHTS -----------------------------------

const accessRightExists = (req) => {
    if (!req.midw.hasOwnProperty("accessRight")) {
        req.midw.accessRight = [];
    }
}

module.exports.accessRightRole = async (req, res, next) => {

    accessRightExists(req);
    req.midw.accessRight.push(1);
    next();
}

module.exports.accessRightUser = async (req, res, next) => {

    accessRightExists(req);
    req.midw.accessRight.push(2);
    next();
}