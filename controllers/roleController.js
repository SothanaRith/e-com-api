const Role = require('../models/Role');

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json(roles);
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get a role by ID
exports.getRoleById = async (req, res) => {
  const roleId = req.params.id;
  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new role
exports.createRole = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newRole = await Role.create({ name, description });
    res.status(201).json(newRole);
  } catch (error) {
    console.error("Error creating role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing role
exports.updateRole = async (req, res) => {
  const roleId = req.params.id;
  const { name, description } = req.body;
  try {
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    role.name = name || role.name;
    role.description = description || role.description;
    await role.save();
    res.json(role);
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a role
exports.deleteRole = async (req, res) => {
  const roleId = req.params.id;
  try {
    const deletedCount = await Role.destroy({ where: { id: roleId } });
    if (deletedCount === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Error deleting role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
