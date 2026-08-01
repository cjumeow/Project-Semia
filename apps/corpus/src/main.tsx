import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { InboxPrototypeApp } from './prototype/inbox/InboxPrototypeApp';
import { LibraryPromotePrototypeApp } from './prototype/library-promote/LibraryPromotePrototypeApp';
import './index.css';

function readPrototypeMode():
  | 'inbox'
  | 'library-promote'
  | null {
  const value = new URLSearchParams(window.location.search).get('prototype');
  if (value === 'inbox') return 'inbox';
  if (value === 'library-promote') return 'library-promote';
  return null;
}

const prototypeMode = readPrototypeMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {prototypeMode === 'inbox' ? (
      <InboxPrototypeApp />
    ) : prototypeMode === 'library-promote' ? (
      <LibraryPromotePrototypeApp />
    ) : (
      <App />
    )}
  </StrictMode>,
);
