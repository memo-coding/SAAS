const users = [
  {
    name: "المدير الأعلى",
    email: "superadmin@school.com",
    password: "12345678",
    role: "SuperAdmin",
    subscriptionStatus: "paid",
    phone: "0500000000",
    address: "الرياض"
  },
  {
    name: "مدير النظام",
    email: "admin@school.com",
    password: "12345678",
    role: "Admin",
    subscriptionStatus: "paid",
    phone: "0500000001",
    address: "الرياض"
  },
  {
    name: "أحمد المعلم",
    email: "teacher1@school.com",
    password: "12345678",
    role: "Teacher",
    subscriptionStatus: "paid",
    phone: "0500000002",
    address: "الرياض"
  },
  {
    name: "محمد المعلم",
    email: "teacher2@school.com",
    password: "12345678",
    role: "Teacher",
    subscriptionStatus: "paid",
    phone: "0500000003",
    address: "الرياض"
  },
  {
    name: "عبدالله المستخدم",
    email: "user1@school.com",
    password: "12345678",
    role: "User",
    subscriptionStatus: "paid",
    phone: "0500000004",
    address: "الرياض"
  },
  {
    name: "خالد المستخدم",
    email: "user2@school.com",
    password: "12345678",
    role: "User",
    subscriptionStatus: "unpaid",
    phone: "0500000005",
    address: "الرياض"
  }
];

const classes = [
  {
    name: "الصف الأول أ",
    // teacher: "teacher1@school.com" // سيتم استبداله بمعرف المعلم
  },
  {
    name: "الصف الثاني أ",
    // teacher: "teacher2@school.com" // سيتم استبداله بمعرف المعلم
  }
];

const attendance = [
  {
    date: new Date(),
    period: "1",
    teacher: "teacher1@school.com", // سيتم استبداله بمعرف المعلم
    student: "user1@school.com", // سيتم استبداله بمعرف الطالب
    status: "present"
  },
  {
    date: new Date(),
    period: "2",
    teacher: "teacher2@school.com",
    student: "user2@school.com",
    status: "absent"
  }
];

module.exports = {
  users,
  classes,
  attendance
};