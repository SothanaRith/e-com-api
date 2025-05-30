// routes/permissionRoutes.js

const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');  // Import your controller
const {isAdmin, isSuperAdmin} = require('../middleware/roleMiddleware');
const { authenticateToken } = require('../middleware/authenticateToken');
// Create a new permission
router.post('/permissions',authenticateToken, isSuperAdmin ,permissionController.createPermission);

// Get all permissions
router.get('/permissions',authenticateToken, isSuperAdmin,  permissionController.getAllPermissions);

// Get a permission by ID
router.get('/permissions/:id', permissionController.getPermissionById);

// Update a permission by ID
router.put('/permissions/:id', permissionController.updatePermission);

// Delete a permission by ID
router.delete('/permissions/:id', permissionController.deletePermission);

// Assign permission to role
router.post('/roles/assign-permission', authenticateToken, isSuperAdmin, permissionController.assignPermissionToRole);

// Get permissions for a role
router.get('/roles/:roleId/permissions', permissionController.getPermissionsForRole);

module.exports = router;
