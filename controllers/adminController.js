// controllers/adminController.js
const  User  = require('../models/User');
const Role  = require('../models/Role');

exports.approveVendor = async (req, res) => {
  const { vendorId } = req.params;
  
  try {
    const vendor = await User.findOne({
      where: { id: vendorId, role: 'vendor', status: 'pending' },  // Ensure the vendor exists and is pending
    });
    
    if (!vendor) {
      return res.status(404).json({ message: 'Pending vendor not found' });
    }
    
    // Update the vendor status to approved
    vendor.status = 'approved';
    await vendor.save();
    
    res.json({ message: 'Vendor approved successfully' });
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.assignPermissionsToRole = async (req, res) => {
  const { roleId } = req.params;
  const { permissionIds } = req.body;
  
  if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
    return res.status(400).json({ success: false, message: 'permissionIds must be a non-empty array' });
  }
  
  try {
    // Fetch role
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }
    
    // Fetch all valid permissions
    const permissions = await Permission.findAll({ where: { id: permissionIds } });
    
    if (permissions.length !== permissionIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some permission IDs are invalid',
      });
    }
    
    // Get existing permission IDs already assigned to this role
    const existingPermissions = await role.getPermissions({ attributes: ['id'] });
    const existingIds = existingPermissions.map(p => p.id);
    
    // Filter out duplicates
    const newPermissionIds = permissions
      .map(p => p.id)
      .filter(id => !existingIds.includes(id));
    
    if (newPermissionIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'All permissions already assigned to this role',
      });
    }
    
    // Assign only new permissions
    const newPermissions = permissions.filter(p => newPermissionIds.includes(p.id));
    await role.addPermissions(newPermissions);
    
    return res.status(200).json({
      success: true,
      message: 'Permissions assigned to role successfully',
      assignedPermissions: newPermissions.map(p => ({ id: p.id, name: p.name })),
    });
    
  } catch (error) {
    console.error('Assign Permissions Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
};



