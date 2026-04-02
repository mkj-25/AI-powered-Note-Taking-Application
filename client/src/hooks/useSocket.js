import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../stores/useAuthStore';

let socketInstance = null;

function useSocket() {
  const { token, user } = useAuthStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
        autoConnect: true,
      });
    }
    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on component unmount — keep alive globally
    };
  }, [token]);

  const joinRoom = (noteId) => {
    socketRef.current?.emit('join-note', {
      noteId,
      userId: user?._id,
      userName: user?.name || 'Anonymous',
    });
  };

  const leaveRoom = (noteId) => {
    socketRef.current?.emit('leave-note', { noteId });
  };

  // Server expects: { noteId, changes, userId }
  const sendChange = (noteId, blocks) => {
    socketRef.current?.emit('note-change', {
      noteId,
      changes: blocks,
      userId: user?._id,
    });
  };

  // Server emits: note-updated with { changes, userId, socketId }
  const onNoteChange = (cb) => {
    socketRef.current?.on('note-updated', cb);
    return () => socketRef.current?.off('note-updated', cb);
  };

  const onUserJoined = (cb) => {
    socketRef.current?.on('user-joined', cb);
    return () => socketRef.current?.off('user-joined', cb);
  };

  const onUserLeft = (cb) => {
    socketRef.current?.on('user-left', cb);
    return () => socketRef.current?.off('user-left', cb);
  };

  return {
    socket: socketRef.current,
    joinRoom,
    leaveRoom,
    sendChange,
    onNoteChange,
    onUserJoined,
    onUserLeft,
  };
}

export default useSocket;
