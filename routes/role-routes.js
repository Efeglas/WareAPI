const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const router = express.Router();
const { config } = require('../config/config.js');

router.post('/', async (req, res, next) => {
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

            const roles = await Database.models.RoleModel.findAll({                
                attributes: ['id', "name"], 
                where: {visible: 1}, 
                include: [{model: Database.models.PermissionModel, attributes: ['id', 'name', 'description']}]
            });         

            const convertedRoles = roles.map((role) => {
                return role.get({ plain: true });
            });

            res.json({ message: "Roles accessed", data: convertedRoles});
            return

        } else {
            res.status(401).json({ message: "Access denied"});
            return;
        }

    }
})

router.post('/rename', async (req, res, next) => {
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
            
            const updatedRole = await Database.models.RoleModel.update({name: data.name}, {where: {id: data.id}});
            res.json({ message: "Role renamed", data: updatedRole});
        } else {
            res.status(401).json({ message: "Access denied"});
            return;
        }

    }

})

router.post('/permissions', async (req, res, next) => {

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

            const permissions = await Database.models.PermissionModel.findAll({attributes: ['id', 'name', 'description']});
            res.json({ message: "Permissions accessed", data: permissions});
            return
        } else {
            res.status(401).json({ message: "Access denied"});
            return;
        }
    }

})

module.exports = router;