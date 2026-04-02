import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '../services/authService';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.login(email, password);
          set({ user: data.user, token: data.token, isLoading: false });
          localStorage.setItem('notra_token', data.token);
          return data;
        } catch (err) {
          set({ error: err.response?.data?.message || 'Login failed', isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authService.register(name, email, password);
          set({ user: data.user, token: data.token, isLoading: false });
          localStorage.setItem('notra_token', data.token);
          return data;
        } catch (err) {
          set({ error: err.response?.data?.message || 'Registration failed', isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('notra_token');
        localStorage.removeItem('notra_user');
        set({ user: null, token: null });
      },

      updateUser: (updates) => set({ user: { ...get().user, ...updates } }),

      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().token && !!get().user,

      // Convenience getters for streak
      getStreak: () => get().user?.currentStreak || 0,
      getLongestStreak: () => get().user?.longestStreak || 0,
    }),
    {
      name: 'notra-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

export default useAuthStore;
