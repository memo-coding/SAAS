const express = require('express');
const Class = require('../models/Class');
const User = require('../models/User'); // ضيفنا استيراد الـ User
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all classes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific class
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create class (Admin/SuperAdmin only)
router.post('/', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const { name } = req.body;

    const classData = new Class({
      name,
    });

    await classData.save();
    
    const populatedClass = await Class.findById(classData._id);
    res.status(201).json(populatedClass);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update class (Admin/Manager only)
router.put('/:id', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const { name } = req.body;

    const classData = await Class.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(classData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete class (Admin/Manager only)
router.delete('/:id', authenticateToken, authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const classData = await Class.findByIdAndDelete(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users by class name - ضيفنا route جديد
router.get('/:id/users', authenticateToken, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    
    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // جلب اليوزرز اللي عندهم نفس اسم الكلاس
    const users = await User.find({ class: classData.name });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;