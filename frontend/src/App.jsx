/**
 * App shell — routes the user through the Chapterly flow:
 *
 *   auth → dashboard → journal OR scrapbook
 *
 * View names match frontend/docs/UX.md. State lives in useChapterlyState.
 */

import { useEffect, useState } from 'react';
import { AuthForm } from './components/AuthForm.jsx';
import { ChapterDashboard } from './components/ChapterDashboard.jsx';
import { JournalEntryForm } from './components/JournalEntryForm.jsx';
import { ScrapbookView } from './components/ScrapbookView.jsx';
import { useChapterlyState } from './hooks/useChapterlyState.js';

export function App() {
  const {
    hydrated,
    user,
    chapters,
    activeChapter,
    login,
    register,
    signOut,
    startChapterFromTemplate,
    openChapter,
    addStory,
    addGoal,
    toggleGoal,
    addPhotos,
  } = useChapterlyState();

  // Simple screen router — no react-router dependency for this milestone.
  const [view, setView] = useStateView(user);

  if (!hydrated) {
    return (
      <main className="app-shell">
        <p className="muted">Loading Chapterly…</p>
      </main>
    );
  }

  // --- Auth gate: everyone starts here until signed in ---
  if (!user) {
    return (
      <main className="app-shell app-shell--auth">
        <AuthForm onLogin={login} onRegister={register} />
      </main>
    );
  }

  // --- Dashboard: pick templates and open existing chapters ---
  if (view === 'dashboard') {
    return (
      <main className="app-shell">
        <ChapterDashboard
          user={user}
          chapters={chapters}
          onSignOut={() => {
            signOut();
            setView('auth');
          }}
          onStartChapter={async (template, customTitle) => {
            await startChapterFromTemplate(template, customTitle);
            setView('journal');
          }}
          onOpenJournal={(chapterId) => {
            openChapter(chapterId);
            setView('journal');
          }}
          onOpenScrapbook={(chapterId) => {
            openChapter(chapterId);
            setView('scrapbook');
          }}
        />
      </main>
    );
  }

  // Journal and scrapbook require an active chapter.
  if (!activeChapter) {
    return (
      <main className="app-shell">
        <ChapterDashboard
          user={user}
          chapters={chapters}
          onSignOut={signOut}
          onStartChapter={async (template, customTitle) => {
            await startChapterFromTemplate(template, customTitle);
            setView('journal');
          }}
          onOpenJournal={(chapterId) => {
            openChapter(chapterId);
            setView('journal');
          }}
          onOpenScrapbook={(chapterId) => {
            openChapter(chapterId);
            setView('scrapbook');
          }}
        />
      </main>
    );
  }

  if (view === 'journal') {
    return (
      <main className="app-shell">
        <JournalEntryForm
          chapter={activeChapter}
          onBack={() => setView('dashboard')}
          onAddStory={(payload) => addStory(activeChapter.id, payload)}
          onAddGoal={(payload) => addGoal(activeChapter.id, payload)}
          onToggleGoal={(goalId) => toggleGoal(activeChapter.id, goalId)}
          onAddPhotos={(entries) => addPhotos(activeChapter.id, entries)}
        />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <ScrapbookView
        chapter={activeChapter}
        onBack={() => setView('dashboard')}
      />
    </main>
  );
}

/**
 * Remembers which screen to show; jumps to dashboard after login.
 */
function useStateView(user) {
  const [view, setView] = useState('auth');

  useEffect(() => {
    setView(user ? 'dashboard' : 'auth');
  }, [user]);

  return [view, setView];
}
