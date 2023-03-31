const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const router = express.Router();
const { config } = require('../config/config.js');
const { Op } = require('sequelize');
const {
    autenticated,
    hasAccess,
    accessRightRole,
    accessRightUser
} = require("../middleware/middleware.js");

router.post('/', autenticated, accessRightRole, hasAccess, async (req, res, next) => {
    const data = req.body;
   
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
})

router.post('/plain', autenticated, accessRightUser, hasAccess, async (req, res, next) => {
    const data = req.body;
    
    const roles = await Database.models.RoleModel.findAll({                
        attributes: ['id', "name"], 
        where: {visible: 1},              
    });         

    const convertedRoles = roles.map((role) => {
        return role.get({ plain: true });
    });

    res.json({ message: "Roles accessed", data: convertedRoles});
    return
})

router.patch('/rename', autenticated, accessRightRole, hasAccess, async (req, res, next) => {
    const data = req.body;

    const updatedRole = await Database.models.RoleModel.update({name: data.name}, {where: {id: data.id}});
    res.json({ message: "Role renamed", data: updatedRole});
})

router.delete('/delete', autenticated, accessRightRole, hasAccess, async (req, res, next) => {
    const data = req.body;

    const resultUsers = await Database.models.UserModel.findAll({where: {RoleId: data.role}});
            
    if (resultUsers.length > 0) {
        res.status(406).json({ message: "Role attached to user"});
    } else {
        const updatedRole = await Database.models.RoleModel.update({visible: 0}, {where: {id: data.role}});
        const resultConnections = await Database.models.RolePermissionModel.destroy({where: {RoleId: data.role}});
        res.json({ message: "Role deleted"});
    }
})

router.post('/add', autenticated, accessRightRole, hasAccess, async (req, res, next) => {
    const data = req.body;

    await Database.models.RoleModel.create({name: data.name});
    res.json({ message: "Role added"});
})

router.post('/permissions', autenticated, accessRightRole, hasAccess, async (req, res, next) => {

    const data = req.body;

    const permissions = await Database.models.PermissionModel.findAll({attributes: ['id', 'name', 'description']});
    res.json({ message: "Permissions accessed", data: permissions});
})


router.post('/permissions/save', autenticated, accessRightRole, hasAccess, async (req, res, next) => {

    const data = req.body;

    if (data.role === 1) {
        res.status(401).json({ message: "Default user, restricted"});
        return;
    }

    const bulkCreateArray = [];
    for (const key in data.checks) {
        if (data.checks[key].value) {
            bulkCreateArray.push({RoleId: data.role, PermissionId: key});
        }
    }

    await Database.models.RolePermissionModel.destroy({where: { RoleId: data.role }});
    await Database.models.RolePermissionModel.bulkCreate(bulkCreateArray);           

    res.json({ message: "Permissions changed"}); 
})

module.exports = router;