const express = require('express');
const router = express.Router();
const Validator = require('../Validator/Validator.js');
const UserController = require('../controllers/UserController.js');

const { validatePositiveNumber, validateNotEmpty, validatePhone, validateEmail } = require('../utility/validate.js');
const {
  autenticated,
  hasAccess,
  accessRightRole,
  accessRightUser
} = require("../middleware/middleware.js");

router.post('/', autenticated, async (req, res, next) => {
    const data = req.body;
    
    const {valid, errors} = Validator.validate(data, {userId: validatePositiveNumber});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
    }
  
    const {status, message, data: contrData} = await UserController.getUserProfile(data);

    res.status(status).json({ message: message, data: contrData});
    return;
})

router.post('/get', autenticated, accessRightUser, hasAccess, async (req, res, next) => {
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {});
  
    if (!valid) {
      res.status(404).json({ message: "Resource not found" });
      return;
  }
  
  const {status, message, data: contrData} = await UserController.getUsers();

  res.status(status).json({ message: message, data: contrData});
  return;
})

router.post('/password', autenticated, async (req, res, next) => {
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {
    username:validateNotEmpty,
    oldpass:validateNotEmpty,
    newpass:validateNotEmpty
  });
  
  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await UserController.changePassword(data);

  res.status(status).json({ message: message, data: contrData});
  return;
});

router.post('/password/reset',  autenticated, accessRightRole, hasAccess, async (req, res, next) => {

  const data = req.body;

  const {valid, errors} = Validator.validate(data, {
    username:validateNotEmpty,
    id:validatePositiveNumber,
  });

  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await UserController.resetPassword(data);

  res.status(status).json({ message: message, data: contrData});
  return;
})

router.post('/login', async (req, res, next) => {
    
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {
    username:validateNotEmpty,
    password:validateNotEmpty,
  });

  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }
    
  const {status, message, data: contrData} = await UserController.login(data);

  res.status(status).json({ message: message, data: contrData});
  return;
});

router.post('/logout', async (req, res, next) => {
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {
    username:validateNotEmpty,
  });

  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await UserController.logout(data);

  res.status(status).json({ message: message, data: contrData});
  return;
  
});

router.post('/register', autenticated, accessRightUser, hasAccess, async (req, res, next) => {
  
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {
    email:validateEmail,
    firstName:validateNotEmpty,
    lastName:validateNotEmpty,
    phone:validatePhone,
    role:validatePositiveNumber,
  });

  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await UserController.register(data);

  res.status(status).json({ message: message, data: contrData});
  return;   
});

router.delete('/', autenticated, accessRightUser, hasAccess, async (req, res, next) => {
  
  const data = req.body;

  const {valid, errors} = Validator.validate(data, {
    id: validatePositiveNumber
  });

  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await UserController.deleteUser(data);

  res.status(status).json({ message: message, data: contrData});
  return;
});

router.patch('/', autenticated, accessRightUser, hasAccess, async (req, res, next) => {
  
  const data = req.body;

const {valid, errors} = Validator.validate(data, {
    id: validatePositiveNumber,
    email:validateEmail,
    firstName:validateNotEmpty,
    lastName:validateNotEmpty,
    phone:validatePhone,
    role:validatePositiveNumber,
  });

  if (!valid) {
    res.status(404).json({ message: "Resource not found" });
    return;
  }

  const {status, message, data: contrData} = await UserController.editUser(data);

  res.status(status).json({ message: message, data: contrData});
  return;
});

module.exports = router;