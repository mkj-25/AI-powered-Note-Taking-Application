import { create } from 'zustand';
import * as workspaceService from '../services/workspaceService';

const useWorkspaceStore = create((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await workspaceService.getWorkspaces();
      const workspaces = data.workspaces || data;
      set({ workspaces, isLoading: false });
      // Auto-select first workspace if none active
      if (!get().activeWorkspace && workspaces.length > 0) {
        set({ activeWorkspace: workspaces[0] });
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load workspaces', isLoading: false });
    }
  },

  createWorkspace: async (name, description, type = 'personal') => {
    try {
      const res = await workspaceService.createWorkspace({ name, description, type });
      const ws = res.workspace || res;
      set((state) => ({ workspaces: [...state.workspaces, ws] }));
      return ws;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create workspace' });
      throw err;
    }
  },

  updateWorkspace: async (id, updates) => {
    try {
      const res = await workspaceService.updateWorkspace(id, updates);
      const ws = res.workspace || res;
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w._id === id ? ws : w)),
        activeWorkspace: state.activeWorkspace?._id === id ? ws : state.activeWorkspace,
      }));
      return ws;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update workspace' });
    }
  },

  deleteWorkspace: async (id) => {
    try {
      await workspaceService.deleteWorkspace(id);
      set((state) => {
        const remaining = state.workspaces.filter((w) => w._id !== id);
        return {
          workspaces: remaining,
          activeWorkspace:
            state.activeWorkspace?._id === id ? remaining[0] || null : state.activeWorkspace,
        };
      });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete workspace' });
    }
  },

  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  clearError: () => set({ error: null }),
}));

export default useWorkspaceStore;
