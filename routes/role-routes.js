const Database = require('../database/database.js');
const express = require('express');
const jwToken = require('jsonwebtoken');
const router = express.Router();
const { config } = require('../config/config.js');
const { Op } = require('sequelize');
const RoleController = require('../controllers/RoleController.js');
const Validator = require('../Validator/Validator.js');
const { validatePositiveNumber, validateNotEmpty, validateChecks } = require('../utility/validate.js');
const {
    autenticated,
    hasAccess,
    accessRightRole,
    accessRightUser
} = require("../middleware/middleware.js");

router.post('/', autenticated, accessRightRole, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await RoleController.getRoles();

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/plain', autenticated, accessRightUser, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await RoleController.getPlainRoles();

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.patch('/', autenticated, accessRightRole, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {
        name: validateNotEmpty,
        id: validatePositiveNumber
    });
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }

    const {status, message, data: contrData} = await RoleController.editRole(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.delete('/', autenticated, accessRightRole, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {      
        role: validatePositiveNumber
    });

    if (!valid) {
        res.status(404).json({ message: "Resource not found" });
        return;
    }
    
    const {status, message, data: contrData} = await RoleController.deleteRole(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/add', autenticated, accessRightRole, hasAccess, async (req, res, next) => {
    const data = req.body;

    const {valid, errors} = Validator.validate(data, {      
        name: validateNotEmpty
    });

    if (!valid) {
        res.status(404).json({ message: "Resource not found" });
        return;
    }
    
    const {status, message, data: contrData} = await RoleController.addRole(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/permissions', autenticated, accessRightRole, hasAccess, async (req, res, next) => {

    const data = req.body;

    const {valid, errors} = Validator.validate(data, {});

    if (!valid) {
        res.status(404).json({ message: "Resource not found" });
        return;
    }
    
    const {status, message, data: contrData} = await RoleController.getPermissions();

    res.status(status).json({ message: message, data: contrData});
    return;
})


router.post('/permissions/save', autenticated, accessRightRole, hasAccess, async (req, res, next) => {

    const data = req.body;

    const {valid, errors} = Validator.validate(data, {
        role: validatePositiveNumber,
        checks: validateChecks
    });

    if (!valid) {
        res.status(404).json({ message: "Resource not found" });
        return;
    }
    
    const {status, message, data: contrData} = await RoleController.savePermissions(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

module.exports = router;