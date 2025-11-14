// seedUpdateUserSchema.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const seedUpdateUserSchema = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');

    // تحديث كل اليوزرز في دورة واحدة
    const result = await User.updateMany(
      {}, // كل اليوزرز
      {
        $set: {
          class: null // أو يمكنك تعيين قيمة افتراضية
        },
        $unset: {
          assignedClasses: "", // حذف الحقل
          classId: "" // حذف الحقل
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users`);
    console.log('📝 Changes applied:');
    console.log('   - Added "class" field to all users');
    console.log('   - Removed "assignedClasses" field');
    console.log('   - Removed "classId" field');

    // الآن نضيف كلاسات عشوائية
    const availableClasses = [
      'First Grade',
      'Second Grade', 
      'Third Grade',
      'Fourth Grade',
      'Fifth Grade',
      'Sixth Grade'
    ];

    const users = await User.find({});
    let classAddedCount = 0;

    for (const user of users) {
      const randomClass = availableClasses[Math.floor(Math.random() * availableClasses.length)];
      user.class = randomClass;
      await user.save();
      classAddedCount++;
    }

    console.log(`✅ Added classes to ${classAddedCount} users`);
    
  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// تشغيل السكريبت
seedUpdateUserSchema();