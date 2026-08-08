import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ContextBarSlimPrototypeApp } from './prototype/context-bar-slim/ContextBarSlimPrototypeApp';
import { ContextTabsPrototypeApp } from './prototype/context-tabs/ContextTabsPrototypeApp';
import { DarkModePrototypeApp } from './prototype/dark-mode/DarkModePrototypeApp';
import { DragModeSwitchPrototypeApp } from './prototype/drag-mode-switch/DragModeSwitchPrototypeApp';
import { FocusPickPrototypeApp } from './prototype/focus-pick/FocusPickPrototypeApp';
import { SettingsPagePrototypeApp } from './prototype/settings-page/SettingsPagePrototypeApp';
import './index.css';
import { bootstrapSemiaThemeFromLocalStorage } from './semiaThemeBootstrap';

bootstrapSemiaThemeFromLocalStorage();

const prototype = new URLSearchParams(window.location.search).get('prototype');
const isContextBarSlimPrototype = prototype === 'context-bar-slim';
const isContextTabsPrototype = prototype === 'context-tabs';
const isDarkModePrototype = prototype === 'dark-mode';
const isDragModeSwitchPrototype = prototype === 'drag-mode-switch';
const isFocusPickPrototype = prototype === 'focus-pick';
const isSettingsPagePrototype = prototype === 'settings-page';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isContextBarSlimPrototype ? (
      <ContextBarSlimPrototypeApp />
    ) : isContextTabsPrototype ? (
      <ContextTabsPrototypeApp />
    ) : isDragModeSwitchPrototype ? (
      <DragModeSwitchPrototypeApp />
    ) : isFocusPickPrototype ? (
      <FocusPickPrototypeApp />
    ) : isSettingsPagePrototype ? (
      <SettingsPagePrototypeApp />
    ) : isDarkModePrototype ? (
      <DarkModePrototypeApp />
    ) : (
      <App />
    )}
  </StrictMode>,
);
