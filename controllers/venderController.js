const User = require('../models/User');

// Get all vendors
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await User.findAll({ where: { role: 'seller' } });
    res.status(200).json({
      data: vendors,
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get vendor by ID
exports.getVendorById = async (req, res) => {
  const { id } = req.params;
  try {
    const vendor = await User.findOne({ where: { id, role: 'seller' } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new vendor
exports.createVendor = async (req, res) => {
  try {
    const { name, email, password, phone, bio, statusTitle, coverImage, thumbnailImage } = req.body;
    // Additional validation can be added here
    
    const newVendor = await User.create({
      name,
      email,
      password, // hash password before saving in production
      phone,
      bio,
      statusTitle,
      coverImage,
      thumbnailImage,
      role: 'seller',
      status: 'active',
    });
    
    res.status(201).json(newVendor);
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update vendor info
exports.updateVendor = async (req, res) => {
  const { id } = req.params;
  try {
    const vendor = await User.findOne({ where: { id, role: 'seller' } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    const updates = req.body;
    // Optional: prevent role update or sensitive field update here
    
    await vendor.update(updates);
    res.status(200).json(vendor);
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete vendor (soft delete: set status = 'inactive')
exports.deleteVendor = async (req, res) => {
  const { id } = req.params;
  try {
    const vendor = await User.findOne({ where: { id, role: 'seller' } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    
    await vendor.update({ status: 'inactive' });
    res.status(200).json({ message: 'Vendor deactivated' });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
