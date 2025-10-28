import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import 'katex/dist/katex.min.css';
import { Provider } from 'react-redux';
import store from './app/store';

// Theme initialization - Yeh add karo
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('sdeverse-theme');
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Initialize theme before rendering
initializeTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);