import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// StrictMode removed: causes double-invocation in dev which breaks
// contentEditable cursor position and Socket.io connection lifecycle.
createRoot(document.getElementById('root')).render(<App />);
