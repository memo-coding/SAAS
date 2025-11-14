const express = require('express');
const User = require('../models/User');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin/SuperAdmin only) - مع دعم الفلتر بالكلاس
router.get('/', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const { class: className } = req.query;
    
    let filter = {};
    if (className) {
      filter.class = className;
    }

    const users = await User.find(filter)
      .select('-password');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Users can only view their own data unless they're Admin/SuperAdmin
    if (req.user.role !== 'Admin' && req.user.role !== 'SuperAdmin' && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user with detailed attendance stats
router.get('/:id/attendance-stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check permissions
    const canView = ['Admin', 'SuperAdmin', 'Manager', 'Supervisor'].includes(req.user.role) ||
                    req.user.userId === userId;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // حساب النسبة المئوية
    const totalDays = user.totalPresentDays + user.totalAbsentDays;
    const attendanceRate = totalDays > 0 ? ((user.totalPresentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      ...user.toObject(),
      attendanceStats: {
        totalDays,
        presentDays: user.totalPresentDays,
        absentDays: user.totalAbsentDays,
        attendanceRate: `${attendanceRate}%`
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, address, subscriptionStatus, role, class: classField } = req.body;

    // Check permissions
    const canEditAll = ['Admin', 'SuperAdmin'].includes(req.user.role);
    const canEditSelf = req.user.userId === userId;

    if (!canEditAll && !canEditSelf) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};
    
    // Basic fields everyone can update for themselves
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    // Admin/Manager only fields
    if (canEditAll) {
      if (subscriptionStatus) updateData.subscriptionStatus = subscriptionStatus;
      if (role) updateData.role = role;
      
      // إذا غيرنا الـ role لـ Admin أو SuperAdmin، نشيل الـ class
      if (role && (role === 'Admin' || role === 'SuperAdmin')) {
        updateData.class = null;
      } else if (classField !== undefined) {
        updateData.class = classField;
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh attendance counts for a user (Admin only)
router.post('/:id/refresh-attendance', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.updateAttendanceCounts();

    const updatedUser = await User.findById(req.params.id)
      .select('-password');

    res.json({
      message: 'Attendance counts refreshed successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (Admin/Manager only)
router.delete('/:id', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users by class name - route معدل
router.get('/class/:className', authenticateToken, async (req, res) => {
  try {
    const { className } = req.params;
    
    // Decode URL parameter (للاستفادة من المسافات وغيرها)
    const decodedClassName = decodeURIComponent(className);
    
    console.log(`🔍 Fetching users for class: "${decodedClassName}"`);
    
    const users = await User.find({ class: decodedClassName })
      .select('-password');

    console.log(`✅ Found ${users.length} users in class "${decodedClassName}"`);
    
    // عرض الأدوار علشان نتأكد من الفلتر
    const roleCounts = {};
    users.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    console.log(`👥 Role distribution:`, roleCounts);
    
    res.json(users);
  } catch (error) {
    console.error('❌ Error fetching users by class:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all unique classes from users - endpoint جديد
router.get('/classes/unique', authenticateToken, async (req, res) => {
  try {
    const uniqueClasses = await User.distinct('class', { 
      class: { $exists: true, $ne: null, $ne: '' } 
    });
    
    console.log("📚 Unique classes from users:", uniqueClasses);
    
    res.json(uniqueClasses);
  } catch (error) {
    console.error('❌ Error fetching unique classes:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;