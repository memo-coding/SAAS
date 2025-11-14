
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  // classId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Class',
  //   required: true
  // },
  // teacher: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: true
  // }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
