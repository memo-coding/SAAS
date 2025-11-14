const express = require('express');
const Attendance = require('../models/Attendance');
const { authenticateToken, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all attendance records (الآن بيسمح للـ Teachers برضو)
router.get('/', authenticateToken, authorize('Admin', 'Manager', 'SuperAdmin', 'Teacher'), async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate('student', 'name email class')
      .populate('teacher', 'name email')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific attendance record
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student', 'name email class')
      .populate('teacher', 'name email');
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Check permissions
    const canView = ['Admin', 'Manager', 'SuperAdmin'].includes(req.user.role) ||
                    attendance.student._id.toString() === req.user.userId ||
                    attendance.teacher._id.toString() === req.user.userId;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get attendance for specific student
router.get('/student/:studentId', authenticateToken, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // Check permissions
    const canView = ['Admin', 'Manager', 'SuperAdmin', 'Teacher'].includes(req.user.role) ||
                    req.user.userId === studentId;

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attendance = await Attendance.find({ student: studentId })
      .populate('student', 'name email class')
      .populate('teacher', 'name email')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create attendance record (الآن بيسمح للـ Teachers)
// Create attendance record - مع error handling محسن
router.post('/', authenticateToken, authorize('Teacher', 'SuperAdmin', 'Admin', 'Manager'), async (req, res) => {
  try {
    const { date, period, student, teacher, status } = req.body;

    console.log('🎯 RECEIVED ATTENDANCE DATA:', {
      date, period, student, teacher, status
    });

    // validation أساسي
    const missingFields = [];
    if (!date) missingFields.push('date');
    if (!period) missingFields.push('period');
    if (!student) missingFields.push('student');
    if (!teacher) missingFields.push('teacher');
    if (!status) missingFields.push('status');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // التأكد من صحة الـ ObjectIds
    const mongoose = require('mongoose');
    
    if (!mongoose.Types.ObjectId.isValid(student)) {
      return res.status(400).json({ error: `Invalid student ID: ${student}` });
    }

    if (!mongoose.Types.ObjectId.isValid(teacher)) {
      return res.status(400).json({ error: `Invalid teacher ID: ${teacher}` });
    }

    console.log('✅ All IDs are valid');

    // محاولة إنشاء الـ attendance record
    console.log('🔄 Creating attendance document...');
    
    const attendance = new Attendance({
      date: new Date(date),
      period,
      student,
      teacher, 
      status
    });

    console.log('📄 Attendance document created:', attendance);

    // محاولة الحفظ
    console.log('💾 Attempting to save...');
    const savedAttendance = await attendance.save();
    console.log('✅ Attendance saved successfully:', savedAttendance._id);

    // الـ population
    console.log('🔄 Populating attendance data...');
    const populatedAttendance = await Attendance.findById(savedAttendance._id)
      .populate('student', 'name email class')
      .populate('teacher', 'name email');

    console.log('🎉 SUCCESS - Attendance created:', {
      id: populatedAttendance._id,
      student: populatedAttendance.student?.name,
      teacher: populatedAttendance.teacher?.name,
      date: populatedAttendance.date,
      period: populatedAttendance.period,
      status: populatedAttendance.status
    });

    res.status(201).json(populatedAttendance);

  } catch (error) {
    console.error('💥 CATCH BLOCK - Error details:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.error('📋 Validation errors:');
      for (const field in error.errors) {
        console.error(`- ${field}: ${error.errors[field].message}`);
      }
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: `Invalid data format: ${error.message}` 
      });
    }

    // أي error تاني
    console.error('❌ UNHANDLED ERROR:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get attendance records for specific teacher
router.get('/teacher/:teacherId', authenticateToken, authorize('Teacher', 'Admin', 'Manager', 'SuperAdmin'), async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    
    // تحقق من إن التيتشر بيشوف بياناته فقط
    if (req.user.role === 'Teacher' && req.user.userId !== teacherId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attendance = await Attendance.find({ teacher: teacherId })
      .populate('student', 'name email class')
      .populate('teacher', 'name email')
      .sort({ date: -1 });
    
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update attendance record (Teacher/Supervisor)
router.put('/:id', authenticateToken, authorize('Admin', 'Teacher', 'Supervisor'), async (req, res) => {
  try {
    const { date, period, student, status } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { date, period, student, status },
      { new: true }
    )
      .populate('student', 'name email class')
      .populate('teacher', 'name email');

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete attendance record (Admin/Manager/Supervisor)
router.delete('/:id', authenticateToken, authorize('Admin', 'SuperAdmin'), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;