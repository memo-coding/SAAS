const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['paid', 'unpaid', 'pending'],
    default: 'unpaid'
  },
  role: {
    type: String,
    enum: ['User', 'Teacher', 'Admin', 'SuperAdmin'],
    default: 'User',
    required: true
  },
  class: { 
    type: String,
    trim: true,
    validate: {
      validator: function(classField) {
        // الكلاس مسموح فقط للـ User والـ Teacher
        if (this.role === 'Admin' || this.role === 'SuperAdmin') {
          return !classField; // الأدمن والسوبر أدمن ميكونش عندهم كلاس
        }
        return true; // المستخدمين العاديين والطلاب مسموح لهم بالكلاس
      },
      message: 'Class is not allowed for Admin and SuperAdmin users'
    }
  },
  totalPresentDays: {
    type: Number,
    default: 0
  },
  totalAbsentDays: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    console.log('🔑 Comparing password for user:', this.email);
    console.log('📝 Candidate password length:', candidatePassword.length);
    console.log('💾 Stored hash exists:', !!this.password);
    
    const result = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔑 Comparison result:', result);
    
    return result;
  } catch (error) {
    console.error('💥 Password comparison error:', error);
    throw error;
  }
};

// Method to update attendance counts
userSchema.methods.updateAttendanceCounts = async function() {
  const Attendance = mongoose.model('Attendance');
  
  const presentCount = await Attendance.countDocuments({
    student: this._id,
    status: 'present'
  });
  
  const absentCount = await Attendance.countDocuments({
    student: this._id,
    status: 'absent'
  });
  
  this.totalPresentDays = presentCount;
  this.totalAbsentDays = absentCount;
  
  await this.save();
  return this;
};

// Index for better performance
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);