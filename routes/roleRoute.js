const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');
const {isAdmin, isSuperAdmin} = require("../middleware/roleMiddleware");
const {authenticateToken} = require("../middleware/authenticateToken");
// GET all roles
router.get('/roles', RoleController.getAllRoles);

// GET role by ID
router.get('/role/:id', RoleController.getRoleById);

// POST create new role
router.post('/creat-role', RoleController.createRole);

// PUT update role by ID
router.put('/:id', RoleController.updateRole);

// DELETE role by ID
router.delete('/:id', RoleController.deleteRole);

module.exports = router;
