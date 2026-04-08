const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, default: '' },
  language: { type: String, required: true },
});

const workspaceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  files: [fileSchema],
  activeFileId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Workspace', workspaceSchema);
