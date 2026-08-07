import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DarkModePrototypeApp } from './prototype/dark-mode/DarkModePrototypeApp';
import './index.css';
import { bootstrapSemiaThemeFromLocalStorage } from './semiaThemeBootstrap';

bootstrapSemiaThemeFromLocalStorage();

const isDarkModePrototype =
  new URLSearchParams(window.location.search).get('prototype') === 'dark-mode';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isDarkModePrototype ? <DarkModePrototypeApp /> : <App />}
  </StrictMode>,
);
