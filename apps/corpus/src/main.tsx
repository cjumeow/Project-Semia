import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DarkModePrototypeApp } from './prototype/dark-mode/DarkModePrototypeApp';
import { DragModeSwitchPrototypeApp } from './prototype/drag-mode-switch/DragModeSwitchPrototypeApp';
import './index.css';
import { bootstrapSemiaThemeFromLocalStorage } from './semiaThemeBootstrap';

bootstrapSemiaThemeFromLocalStorage();

const prototype = new URLSearchParams(window.location.search).get('prototype');
const isDarkModePrototype = prototype === 'dark-mode';
const isDragModeSwitchPrototype = prototype === 'drag-mode-switch';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDragModeSwitchPrototype ? (
      <DragModeSwitchPrototypeApp />
    ) : isDarkModePrototype ? (
      <DarkModePrototypeApp />
    ) : (
      <App />
    )}
  </StrictMode>,
);
