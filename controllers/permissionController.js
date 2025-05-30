// controllers/permissionController.js

const Permission = require('../models/PermissionModel');
const Role = require('../models/Role');  // Assuming you have a Role model
const { Op } = require('sequelize');

// Create a new permission
// controllers/permissionController.js

exports.createPermission = async (req, res) => {
  const { name, description } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }
  
  try {
    // Check if permission already exists
    const existingPermission = await Permission.findOne({ where: { name } });
    
    if (existingPermission) {
      return res.status(400).json({ message: 'Permission already exists' });
    }
    
    // Create new permission
    const permission = await Permission.create({ name, description });
    
    return res.status(201).json({
      message: 'Permission created successfully',
      permission,
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    return res.status(500).json({ message: 'Error creating permission', error: error.message });
  }
};


// Get all permissions
exports.getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      attributes: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
      order: [['id', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Permissions fetched successfully',
      data: permissions,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message,
    });
  }
};

// Get permission by ID
exports.getPermissionById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const permission = await Permission.findByPk(id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    return res.status(200).json(permission);
  } catch (error) {
    console.error('Error fetching permission:', error);
    return res.status(500).json({ message: 'Error fetching permission' });
  }
};

// Update permission by ID
exports.updatePermission = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  
  try {
    const permission = await Permission.findByPk(id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    permission.name = name || permission.name;
    permission.description = description || permission.description;
    await permission.save();
    
    return res.status(200).json({ message: 'Permission updated successfully', permission });
  } catch (error) {
    console.error('Error updating permission:', error);
    return res.status(500).json({ message: 'Error updating permission' });
  }
};

// Delete permission by ID
exports.deletePermission = async (req, res) => {
  const { id } = req.params;
  
  try {
    const permission = await Permission.findByPk(id);
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    await permission.destroy();
    
    return res.status(200).json({ message: 'Permission deleted successfully' });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return res.status(500).json({ message: 'Error deleting permission' });
  }
};

// Assign permission to role
exports.assignPermissionToRole = async (req, res) => {
  const { roleId, permissionId } = req.body;
  
  try {
    const role = await Role.findByPk(roleId);
    const permission = await Permission.findByPk(permissionId);
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    if (!permission) {
      return res.status(404).json({ message: 'Permission not found' });
    }
    
    // Add permission to role
    await role.addPermission(permission);
    
    return res.status(200).json({
      message: 'Permission successfully assigned to role',
      role,
      permission,
    });
  } catch (error) {
    console.error('Error assigning permission:', error);
    return res.status(500).json({ message: 'Error assigning permission to role' });
  }
};

// Get all permissions of a role
exports.getPermissionsForRole = async (req, res) => {
  const { roleId } = req.params;
  
  try {
    const role = await Role.findByPk(roleId, {
      include: {
        model: Permission,
        as: 'permissions',
      },
    });
    
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    return res.status(200).json(role.permissions);
  } catch (error) {
    console.error('Error fetching permissions for role:', error);
    return res.status(500).json({ message: 'Error fetching permissions for role' });
  }
};
