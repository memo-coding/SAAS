const mongoose = require('mongoose');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
require('dotenv').config();

// الاتصال بـ MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdbname', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
  console.log('❌ MongoDB Error:', err);
  process.exit(1);
});

// دالة تحديث جميع المستخدمين
const migrateAttendanceData = async () => {
  try {
    console.log('🔄 Starting migration...\n');

    // جلب جميع المستخدمين
    const users = await User.find();
    console.log(`📊 Found ${users.length} users\n`);

    let updatedCount = 0;

    // تحديث كل مستخدم
    for (const user of users) {
      console.log(`Processing user: ${user.name} (${user.email})`);

      // حساب عدد أيام الحضور
      const presentCount = await Attendance.countDocuments({
        student: user._id,
        status: 'present'
      });

      // حساب عدد أيام الغياب
      const absentCount = await Attendance.countDocuments({
        student: user._id,
        status: 'absent'
      });

      // تحديث البيانات
      user.totalPresentDays = presentCount;
      user.totalAbsentDays = absentCount;
      await user.save();

      console.log(`  ✅ Present: ${presentCount}, Absent: ${absentCount}\n`);
      updatedCount++;
    }

    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`📊 Updated ${updatedCount} users`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
};

// تشغيل المايجريشن
migrateAttendanceData();