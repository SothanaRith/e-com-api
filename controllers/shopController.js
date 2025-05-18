const Shop = require('../models/Shop');
const User = require('../models/User');

// Create a new shop for a vendor
exports.createShop = async (req, res) => {
  try {
    const { name, description, address, phone, coverImage } = req.body;
    const vendorId = req.user.id; // Assuming you get logged-in user id in req.user
    
    // Optional: Check if user is seller/vendor
    const vendor = await User.findByPk(vendorId);
    if (!vendor || vendor.role !== 'seller') {
      return res.status(403).json({ message: 'Unauthorized to create shop' });
    }
    
    const newShop = await Shop.create({
      name,
      description,
      address,
      phone,
      coverImage,
      vendorId,
    });
    
    res.status(201).json(newShop);
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all shops for a vendor
exports.getVendorShops = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const shops = await Shop.findAll({ where: { vendorId, status: 'active' } });
    res.status(200).json(shops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get shop by id
exports.getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await Shop.findByPk(id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.status(200).json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update shop
exports.updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const vendorId = req.user.id;
    
    const shop = await Shop.findOne({ where: { id, vendorId } });
    if (!shop) return res.status(404).json({ message: 'Shop not found or unauthorized' });
    
    await shop.update(updates);
    res.status(200).json(shop);
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Soft delete shop
exports.deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    
    const shop = await Shop.findOne({ where: { id, vendorId } });
    if (!shop) return res.status(404).json({ message: 'Shop not found or unauthorized' });
    
    await shop.update({ status: 'inactive' });
    res.status(200).json({ message: 'Shop deactivated' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
