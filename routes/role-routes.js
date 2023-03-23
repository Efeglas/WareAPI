const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const router = express.Router();
const { config } = require('../config/config.js');
const { Op } = require('sequelize');

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

        const accessRight = 1;
        
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

router.post('/plain', async (req, res, next) => {
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

        const accessRight = 1;
        
        if (permissionArray.includes(accessRight)) {
            
            const updatedRole = await Database.models.RoleModel.update({name: data.name}, {where: {id: data.id}});
            res.json({ message: "Role renamed", data: updatedRole});
        } else {
            res.status(401).json({ message: "Access denied"});
            return;
        }

    }

})

router.post('/delete', async (req, res, next) => {
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

        const accessRight = 1;
        
        if (permissionArray.includes(accessRight)) {

            
            const resultUsers = await Database.models.UserModel.findAll({where: {RoleId: data.role}});
            
            if (resultUsers.length > 0) {
                res.status(406).json({ message: "Role attached to user"});
            } else {
                const updatedRole = await Database.models.RoleModel.update({visible: 0}, {where: {id: data.role}});
                const resultConnections = await Database.models.RolePermissionModel.destroy({where: {RoleId: data.role}});
                res.json({ message: "Role deleted"});
            }
                   
        } else {
            res.status(401).json({ message: "Access denied"});
            return;
        }

    }

})

router.post('/add', async (req, res, next) => {
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

        const accessRight = 1;
        
        if (permissionArray.includes(accessRight)) {
         
            await Database.models.RoleModel.create({name: data.name});
            res.json({ message: "Role added"});
                   
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

        const accessRight = 1;
        
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


router.post('/permissions/save', async (req, res, next) => {

    const data = req.body;

    let decodedToken = null;
    try {      
      decodedToken = jwToken.verify(data.token, config.jwtKey);
    } catch (error) {      
      res.status(406).json({ message: "Wrong token", error: error.message });
      return;
    }

    if (decodedToken !== null) {

        if (data.role === 1) {
            res.status(401).json({ message: "Default user, restricted"});
            return;
        }

        const permissions = await Database.models.RolePermissionModel.findAll({raw: true, nest: true, attributes: ['PermissionId'], where: {RoleId: decodedToken.role, visible: 1}});
        const permissionArray = permissions.map((permNumber) => {
            return permNumber.PermissionId;
        });

        const accessRight = 1;
        
        if (permissionArray.includes(accessRight)) {

            console.log(data.checks);

            const bulkCreateArray = [];
            for (const key in data.checks) {
                if (data.checks[key].value) {
                    bulkCreateArray.push({RoleId: data.role, PermissionId: key});
                }
            }

            await Database.models.RolePermissionModel.destroy({where: { RoleId: data.role }});

            await Database.models.RolePermissionModel.bulkCreate(bulkCreateArray);           
 
            res.json({ message: "Permissions changed"});
            return
        } else {
            res.status(401).json({ message: "Access denied"});
            return;
        }
    }

})

module.exports = router;