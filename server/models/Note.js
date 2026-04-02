import mongoose from 'mongoose';

// Block types must match frontend NOTE_TYPES in client/src/utils/constants.js
const ALLOWED_BLOCK_TYPES = [
  'text',
  'h1', 'h2', 'h3',           // headings (frontend uses h1/h2/h3)
  'bullet',                    // bullet list
  'todo',                      // checkbox
  'code',                      // code block
  'quote',                     // blockquote
  'divider',                   // horizontal rule
  'image',                     // image
  'callout',                   // callout/highlight box
  // legacy aliases (in case old data exists)
  'heading_1', 'heading_2', 'heading_3',
  'bullet_list', 'numbered_list',
];

const blockSchema = new mongoose.Schema({
  id: { type: String },
  type: {
    type: String,
    enum: ALLOWED_BLOCK_TYPES,
    default: 'text',
  },
  content: { type: String, default: '' },
  checked: { type: Boolean, default: false },
  codeLang: { type: String, default: 'javascript' },  // renamed from 'language' — MongoDB treats embedded 'language' fields as text index overrides
  imageUrl: { type: String, default: '' },
}, { _id: false });

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled',
    trim: true,
    maxlength: 500,
  },
  content: {
    type: [blockSchema],
    default: [{ id: '1', type: 'text', content: '' }],
  },
  tags: [{ type: String, trim: true }],
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Note',
    default: null,
  },
  isPinned:   { type: Boolean, default: false },
  isFavorite: { type: Boolean, default: false },
  isShared:   { type: Boolean, default: false },
  icon:       { type: String, default: '📄' },
  embedding:  { type: [Number], default: [], select: false },
}, {
  timestamps: true,
});

// Compound indexes for common query patterns
noteSchema.index({ userId: 1, workspaceId: 1, updatedAt: -1 });
noteSchema.index({ userId: 1, isFavorite: 1 });
noteSchema.index({ userId: 1, isPinned: 1 });
noteSchema.index({ tags: 1 });
noteSchema.index({ title: 'text', 'content.content': 'text' });

const Note = mongoose.model('Note', noteSchema);
export default Note;
