const mongoose = require('mongoose');
const { users, classes, attendance } = require('../data/seed');
const User = require('../models/User');
const Class = require('../models/Class');
const Attendance = require('../models/Attendance');

async function seedDatabase() {
  try {
    // حذف البيانات الموجودة
    await User.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});

    console.log('تم حذف البيانات القديمة');

    // إضافة المستخدمين
    const createdUsers = await User.create(users);
    console.log('تم إضافة المستخدمين');

    // تحديث معرفات المعلمين في الفصول
    const updatedClasses = classes.map(classData => {
      const teacher = createdUsers.find(user => user.email === classData.teacher);
      return {
        ...classData,
        teacher: teacher._id
      };
    });

    // إضافة الفصول
    const createdClasses = await Class.create(updatedClasses);
    console.log('تم إضافة الفصول');

    // تحديث معرفات المعلمين والطلاب في سجلات الحضور
    const updatedAttendance = attendance.map(record => {
      const teacher = createdUsers.find(user => user.email === record.teacher);
      const student = createdUsers.find(user => user.email === record.student);
      return {
        ...record,
        teacher: teacher._id,
        student: student._id
      };
    });

    // إضافة سجلات الحضور
    await Attendance.create(updatedAttendance);
    console.log('تم إضافة سجلات الحضور');

    console.log('تم إضافة البيانات الأولية بنجاح');
    process.exit(0);
  } catch (error) {
    console.error('حدث خطأ:', error);
    process.exit(1);
  }
}

// الاتصال بقاعدة البيانات وبدء إضافة البيانات
mongoose.connect('mongodb://localhost:27017/school_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('تم الاتصال بقاعدة البيانات');
  seedDatabase();
})
.catch((error) => {
  console.error('خطأ في الاتصال بقاعدة البيانات:', error);
  process.exit(1);
});