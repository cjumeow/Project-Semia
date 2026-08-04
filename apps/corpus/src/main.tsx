import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DeletePrototypeApp } from './prototype/delete/DeletePrototypeApp';
import { InboxPrototypeApp } from './prototype/inbox/InboxPrototypeApp';
import { LibraryPromotePrototypeApp } from './prototype/library-promote/LibraryPromotePrototypeApp';
import { LogoPrototypeApp } from './prototype/logo/LogoPrototypeApp';
import { LearningCardsPrototypeApp } from './prototype/learning-cards/LearningCardsPrototypeApp';
import { SaasThemePrototypeApp } from './prototype/saas-theme/SaasThemePrototypeApp';
import { YoutubeCaptionsPrototypeApp } from './prototype/youtube-captions/YoutubeCaptionsPrototypeApp';
import './index.css';

function readPrototypeMode():
  | 'inbox'
  | 'library-promote'
  | 'logo'
  | 'delete'
  | 'youtube-captions'
  | 'saas-theme'
  | 'learning-cards'
  | null {
  const value = new URLSearchParams(window.location.search).get('prototype');
  if (value === 'inbox') return 'inbox';
  if (value === 'library-promote') return 'library-promote';
  if (value === 'logo') return 'logo';
  if (value === 'delete') return 'delete';
  if (value === 'youtube-captions') return 'youtube-captions';
  if (value === 'saas-theme') return 'saas-theme';
  if (value === 'learning-cards') return 'learning-cards';
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
    ) : prototypeMode === 'saas-theme' ? (
      <SaasThemePrototypeApp />
    ) : prototypeMode === 'learning-cards' ? (
      <LearningCardsPrototypeApp />
    ) : (
      <App />
    )}
  </StrictMode>,
);
