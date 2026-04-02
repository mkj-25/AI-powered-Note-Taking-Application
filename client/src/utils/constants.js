// Shared constants used across frontend and backend

export const API_BASE = '/api';

export const NOTE_TYPES = {
  TEXT: 'text',
  HEADING1: 'h1',
  HEADING2: 'h2',
  HEADING3: 'h3',
  BULLET: 'bullet',
  TODO: 'todo',
  CODE: 'code',
  QUOTE: 'quote',
  IMAGE: 'image',
  DIVIDER: 'divider',
  CALLOUT: 'callout',
};

export const WORKSPACE_TYPES = {
  PERSONAL: 'personal',
  TEAM: 'team',
};

export const AI_ACTIONS = {
  SUMMARIZE: 'summarize',
  EXPLAIN: 'explain',
  BULLET_POINTS: 'bullet_points',
  GENERATE_QUESTIONS: 'generate_questions',
  IMPROVE: 'improve',
  TRANSLATE: 'translate',
};

export const SORT_OPTIONS = [
  { value: 'updated', label: 'Last updated' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Alphabetical' },
];

export const TAG_COLORS = ['purple', 'green', 'blue', 'orange', 'red'];

export const SIDEBAR_SECTIONS = [
  { id: 'dashboard', label: 'Dashboard',     icon: 'LayoutDashboard' },
  { id: 'favorites', label: 'Favorites',     icon: 'Star' },
  { id: 'private',   label: 'Private Notes', icon: 'Lock' },
  { id: 'shared',    label: 'Shared Notes',  icon: 'Share2' },
  { id: 'ai',        label: 'AI Notes',      icon: 'Sparkles' },
];

export const SLASH_COMMANDS = [
  { type: 'text', label: 'Text', description: 'Plain text block', icon: '¶' },
  { type: 'h1', label: 'Heading 1', description: 'Large heading', icon: 'H1' },
  { type: 'h2', label: 'Heading 2', description: 'Medium heading', icon: 'H2' },
  { type: 'h3', label: 'Heading 3', description: 'Small heading', icon: 'H3' },
  { type: 'bullet', label: 'Bullet List', description: 'Simple bullet list', icon: '•' },
  { type: 'todo', label: 'To-do', description: 'Checkbox list', icon: '☐' },
  { type: 'code', label: 'Code Block', description: 'Code with syntax highlight', icon: '<>' },
  { type: 'quote', label: 'Quote', description: 'Blockquote text', icon: '"' },
  { type: 'divider', label: 'Divider', description: 'Horizontal separator', icon: '—' },
  { type: 'callout', label: 'Callout', description: 'Highlighted note block', icon: '💡' },
];
