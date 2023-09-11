const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  caseNumber: { type: String, required: true, unique: true },
  partiesInvolved: [String],
  caseType: String,
  caseStatus: String,
  hearingDates: [Date],
  caseDescription: String,
  caseDocuments: [{ title: String, link: String }],
  assignedJudge: String,
  caseHistory: [{ timestamp: Date, event: String }],
  assignedLawyer: String,
});

module.exports = mongoose.model('Case', caseSchema);
