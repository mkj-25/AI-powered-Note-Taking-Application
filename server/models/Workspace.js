import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workspace name is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['personal', 'team'],
    default: 'personal',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'viewer'],
      default: 'editor',
    },
  }],
  icon: {
    type: String,
    default: '🏠',
  },
}, {
  timestamps: true,
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;
