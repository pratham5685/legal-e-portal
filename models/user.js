const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // User role (Court Staff, Parties Involved, Lawyer, Judge)
});

module.exports = mongoose.model('User', userSchema);
