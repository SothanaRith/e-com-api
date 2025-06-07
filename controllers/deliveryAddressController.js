const DeliveryAddress = require("../models/DeliveryAddress");
exports.createAddress = async (req, res) => {
    try {
        const address = await DeliveryAddress.create(req.body);
        res.status(201).json({ message: 'Address created', address });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create address', error: err.message });
    }
};

exports.getUserAddresses = async (req, res) => {
    try {
        const { userId } = req.params;
        const addresses = await DeliveryAddress.findAll({ where: { userId } });
        res.status(200).json(addresses);
    } catch (err) {
        res.status(500).json({ message: 'Failed to get addresses', error: err.message });
    }
};

exports.getDefaultAddress = async (req, res) => {
    try {
        const { userId } = req.params;

        const address = await DeliveryAddress.findOne({
            where: {
                userId,
                isDefault: true,
            },
        });

        if (!address) {
            return res.status(404).json({ message: "Default address not found" });
        }

        return res.status(200).json(address);
    } catch (error) {
        console.error("Error fetching default address:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await DeliveryAddress.findByPk(id);

        if (!address) return res.status(404).json({ message: 'Address not found' });

        await address.update(req.body);
        res.status(200).json({ message: 'Address updated', address });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update address', error: err.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await DeliveryAddress.findByPk(id);

        if (!address) return res.status(404).json({ message: 'Address not found' });

        await address.destroy();
        res.status(200).json({ message: 'Address deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete address', error: err.message });
    }
};
