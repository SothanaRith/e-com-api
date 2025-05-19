// controllers/adminController.js
const { User } = require('../models');

// exports.approveVendor = async (req, res) => {
//   try {
//     const { vendorId } = req.params;
//
//     const vendor = await User.findByPk(vendorId);
//
//     if (!vendor || vendor.role !== 'vendor' || vendor.status !== 'pending') {
//       return res.status(404).json({ message: 'No pending vendor found with that ID' });
//     }
//
//     vendor.status = 'approved';
//     await vendor.save();
//
//     return res.json({ message: 'Vendor approved successfully' });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
exports.approveVendor = async (req, res) => {
  const { vendorId } = req.params;
  
  try {
    const vendor = await User.findOne({
      where: { id: vendorId, role: 'vendor', status: 'pending_approval' },  // Ensure the vendor exists and is pending
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

