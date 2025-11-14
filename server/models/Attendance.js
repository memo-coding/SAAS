const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  period: {
    type: String,
    required: true,
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent'],
    required: true
  }
}, {
  timestamps: true
});

// تحديث عدد أيام الحضور والغياب في User بعد الحفظ
attendanceSchema.post('save', async function() {
  const User = mongoose.model('User');
  const student = await User.findById(this.student);
  
  if (student) {
    await student.updateAttendanceCounts();
  }
});

// تحديث عدد أيام الحضور والغياب في User بعد التعديل
attendanceSchema.post('findOneAndUpdate', async function(doc) {
  if (doc) {
    const User = mongoose.model('User');
    const student = await User.findById(doc.student);
    
    if (student) {
      await student.updateAttendanceCounts();
    }
  }
});

// تحديث عدد أيام الحضور والغياب في User بعد الحذف
attendanceSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const User = mongoose.model('User');
    const student = await User.findById(doc.student);
    
    if (student) {
      await student.updateAttendanceCounts();
    }
  }
});

module.exports = mongoose.model('Attendance', attendanceSchema);