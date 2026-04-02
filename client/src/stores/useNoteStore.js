import { create } from 'zustand';
import * as notesService from '../services/notesService';

// Backend stores blocks as `content`, we surface them as `blocks`
const toFrontend = (note) => note ? { ...note, blocks: note.content || note.blocks || [] } : null;
const toBackend = (updates) => {
  const u = { ...updates };
  if (u.blocks !== undefined) { u.content = u.blocks; delete u.blocks; }
  return u;
};

const useNoteStore = create((set, get) => ({
  notes: [],
  activeNote: null,
  isLoading: false,
  isSaving: false,
  error: null,

  // Fetch notes — workspaceId optional; if omitted fetches all user notes
  fetchNotes: async (workspaceId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await notesService.getNotes(workspaceId);
      const notes = (data.notes || data).map(toFrontend);
      set({ notes, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load notes', isLoading: false });
    }
  },

  // Fetch notes for ALL workspaces (used by dashboard tabs)
  fetchAllNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await notesService.getNotes(); // no workspaceId
      const notes = (data.notes || data).map(toFrontend);
      set({ notes, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load notes', isLoading: false });
    }
  },

  fetchNote: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await notesService.getNote(id);
      const note = toFrontend(data.note || data);
      set({ activeNote: note, isLoading: false });
      return note;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load note', isLoading: false });
    }
  },

  createNote: async (workspaceId, title = 'Untitled') => {
    try {
      const data = await notesService.createNote({ workspaceId, title, content: [] });
      const note = toFrontend(data.note || data);
      set((state) => ({ notes: [note, ...state.notes], activeNote: note }));
      return note;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create note' });
      throw err;
    }
  },

  updateNote: async (id, updates) => {
    set({ isSaving: true });
    try {
      const data = await notesService.updateNote(id, toBackend(updates));
      const note = toFrontend(data.note || data);
      set((state) => ({
        notes: state.notes.map((n) => (n._id === id ? note : n)),
        activeNote: state.activeNote?._id === id ? note : state.activeNote,
        isSaving: false,
      }));
      return note;
    } catch (err) {
      set({ isSaving: false, error: err.response?.data?.message || 'Failed to save note' });
    }
  },

  toggleFavorite: async (id) => {
    try {
      const data = await notesService.toggleFavorite(id);
      const note = toFrontend(data.note || data);
      set((state) => ({
        notes: state.notes.map((n) => (n._id === id ? note : n)),
        activeNote: state.activeNote?._id === id ? note : state.activeNote,
      }));
      return note;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to toggle favorite' });
    }
  },

  togglePin: async (id) => {
    try {
      const data = await notesService.togglePin(id);
      const note = toFrontend(data.note || data);
      set((state) => ({
        notes: state.notes.map((n) => (n._id === id ? note : n)),
        activeNote: state.activeNote?._id === id ? note : state.activeNote,
      }));
      return note;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to toggle pin' });
    }
  },

  deleteNote: async (id) => {
    try {
      await notesService.deleteNote(id);
      set((state) => ({
        notes: state.notes.filter((n) => n._id !== id),
        activeNote: state.activeNote?._id === id ? null : state.activeNote,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete note' });
    }
  },

  setActiveNote: (note) => set({ activeNote: note }),

  updateActiveNoteLocally: (updates) =>
    set((state) => ({
      activeNote: state.activeNote ? { ...state.activeNote, ...updates } : null,
      // Also update in the notes list for immediate reactivity
      notes: state.activeNote
        ? state.notes.map((n) => n._id === state.activeNote._id ? { ...n, ...updates } : n)
        : state.notes,
    })),

  clearError: () => set({ error: null }),
}));

export default useNoteStore;
