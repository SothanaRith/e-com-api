const Content = require("../models/Content");

// Add new content
exports.addContent = async (req, res) => {
  try {
    const { userId, type, title, file, ownerName, releaseDate, status } = req.body;

    if (!["Music", "Sport", "Favorite"].includes(type)) {
      return res.status(400).json({ error: "Invalid content type" });
    }

    const newContent = await Content.create({ userId, type, title, file, ownerName, releaseDate, status });
    res.status(201).json(newContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Edit existing content
exports.editContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, file, ownerName, releaseDate, status } = req.body;

    const content = await Content.findByPk(id);
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    content.title = title || content.title;
    content.file = file || content.file;
    content.ownerName = ownerName || content.ownerName;
    content.releaseDate = releaseDate || content.releaseDate;
    content.status = status || content.status;

    await content.save();
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete content
exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.findByPk(id);
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    await content.destroy();
    res.json({ message: "Content deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all contents with optional filters
exports.getAllContents = async (req, res) => {
  try {
    const { userId, type } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (type && ["Music", "Sport", "Favorite"].includes(type)) filter.type = type;

    const contents = await Content.findAll({ where: filter });
    res.json(contents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
