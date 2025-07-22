const MenuItem = require('../models/MenuItem');
const { uploadImageBuffer, deleteImage } = require('../services/cloudinary.service');

// GET: Lấy tất cả menu item
// exports.getAllMenuItems = async (req, res) => {
//   try {
//     const items = await MenuItem.find().populate('category');
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
exports.getAllMenuItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.needPreOrder) {
      filter.needPreOrder = req.query.needPreOrder;
    }
    if (req.query.isAvailable) {
      filter.isAvailable = req.query.isAvailable;
    }

    const items = await MenuItem.find(filter).populate('category');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Lấy menu item theo ID
exports.getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category');
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST: Tạo menu item mới
exports.createMenuItem = async (req, res) => {
  try {
    console.log('Hello;')
    const { name, description, price, isAvailable, category } = req.body;

    let imageUrl = null;
    console.log(req.file.buffer)
    if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer);
      imageUrl = result.secure_url;
    }
    console.log(imageUrl)

    const newItem = new MenuItem({
      name,
      description,
      image: imageUrl, // store the Cloudinary image URL here
      price,
      isAvailable,
      category
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.log(err)
    res.status(400).json({ error: err.message });
  }
};


// PUT: Cập nhật menu item
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });

    // If there's a new image file, upload it
    let imageUrl = item.image;
    if (req.file) {
      const result = await uploadImageBuffer(req.file.buffer);
      imageUrl = result.secure_url;

      // Delete old image if exists
      if (item.image) {
        const publicId = extractPublicId(item.image);
        if (publicId) await deleteImage(publicId);
      }
    }

    // Update fields
    const updated = await MenuItem.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: imageUrl,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE: Xoá menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    const deleted = await MenuItem.findByIdAndDelete(req.params.id);
    if (deleted.image) {
      const publicId = extractPublicId(deleted.image)
      deleteImage(publicId) //fire and forget, not sure if this's good tho
    }
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to extract public id from cloudinary url
const extractPublicId = (url) => {
  const matches = url.match(/\/upload\/(?:v\d+\/)?([^\.\/]+)(?:\.[a-zA-Z]+)?$/);
  return matches ? matches[1] : null;
}
