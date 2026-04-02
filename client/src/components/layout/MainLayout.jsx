import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightPanel from './RightPanel';
import useUIStore from '../../stores/useUIStore';
import useWorkspaceStore from '../../stores/useWorkspaceStore';
import useNoteStore from '../../stores/useNoteStore';

function MainLayout({ children }) {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { fetchWorkspaces, activeWorkspace } = useWorkspaceStore();
  const { fetchNotes } = useNoteStore();

  // Fetch workspaces on mount
  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Fetch notes when active workspace changes
  useEffect(() => {
    if (activeWorkspace?._id) {
      fetchNotes(activeWorkspace._id);
    }
  }, [activeWorkspace?._id]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',        // clip the app shell — landing page scrolls independently
      background: 'var(--bg-primary)',
    }}>
      <Navbar />

      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <Sidebar />

        {/* Main content */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--bg-primary)',
          position: 'relative',
        }}>
          {children}
        </main>

        <RightPanel />
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
          },
          success: {
            iconTheme: { primary: 'var(--green)', secondary: 'var(--bg-elevated)' },
          },
          error: {
            iconTheme: { primary: 'var(--red)', secondary: 'var(--bg-elevated)' },
          },
        }}
      />
    </div>
  );
}

export default MainLayout;
