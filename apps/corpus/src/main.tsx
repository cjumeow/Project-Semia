import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DeletePrototypeApp } from './prototype/delete/DeletePrototypeApp';
import { InboxPrototypeApp } from './prototype/inbox/InboxPrototypeApp';
import { LibraryPromotePrototypeApp } from './prototype/library-promote/LibraryPromotePrototypeApp';
import { LogoPrototypeApp } from './prototype/logo/LogoPrototypeApp';
import { SidebarNavPrototypeApp } from './prototype/sidebar-nav/SidebarNavPrototypeApp';
import { SaasThemePrototypeApp } from './prototype/saas-theme/SaasThemePrototypeApp';
import { YoutubeCaptionsPrototypeApp } from './prototype/youtube-captions/YoutubeCaptionsPrototypeApp';
import './index.css';

function readPrototypeMode():
  | 'inbox'
  | 'library-promote'
  | 'logo'
  | 'delete'
  | 'youtube-captions'
  | 'sidebar-nav'
  | 'saas-theme'
  | null {
  const value = new URLSearchParams(window.location.search).get('prototype');
  if (value === 'inbox') return 'inbox';
  if (value === 'library-promote') return 'library-promote';
  if (value === 'logo') return 'logo';
  if (value === 'delete') return 'delete';
  if (value === 'youtube-captions') return 'youtube-captions';
  if (value === 'sidebar-nav') return 'sidebar-nav';
  if (value === 'saas-theme') return 'saas-theme';
  return null;
}

const prototypeMode = readPrototypeMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {prototypeMode === 'inbox' ? (
      <InboxPrototypeApp />
    ) : prototypeMode === 'library-promote' ? (
      <LibraryPromotePrototypeApp />
    ) : prototypeMode === 'logo' ? (
      <LogoPrototypeApp />
    ) : prototypeMode === 'delete' ? (
      <DeletePrototypeApp />
    ) : prototypeMode === 'youtube-captions' ? (
      <YoutubeCaptionsPrototypeApp />
    ) : prototypeMode === 'sidebar-nav' ? (
      <SidebarNavPrototypeApp />
    ) : prototypeMode === 'saas-theme' ? (
      <SaasThemePrototypeApp />
    ) : (
      <App />
    )}
  </StrictMode>,
);
