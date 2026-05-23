import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';
import './styles/styles.css';
import './styles/hero.css';
import './styles/about-timeline.css';
import './styles/app-overrides.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
