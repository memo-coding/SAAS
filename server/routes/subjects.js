
const express = require('express');
const Subject = require('../models/Subject');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all subjects
router.get('/', authenticateToken, async (req, res) => {
  try {
    const subjects = await Subject.find()
      // .populate('classId', 'name')
      // .populate('teacher', 'name email');
    
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific subject
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      // .populate('classId', 'name')
      // .populate('teacher', 'name email');
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create subject (Admin/Manager/Supervisor)
router.post('/', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const { name } = req.body;
    // const { name, classId, teacher } = req.body;

    const subject = new Subject({
      name,
      // classId,
      // teacher
    });

    await subject.save();
    
    const populatedSubject = await Subject.findById(subject._id)
      // .populate('classId', 'name')
      // .populate('teacher', 'name email');

    res.status(201).json(populatedSubject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update subject (Admin/Manager/Supervisor)
router.put('/:id', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const { name, classId, teacher } = req.body;

    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      // { name, classId, teacher },
      { name },
      { new: true }
    )
      // .populate('classId', 'name')
      // .populate('teacher', 'name email');

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete subject (Admin/Manager/Supervisor)
router.delete('/:id', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    
    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
