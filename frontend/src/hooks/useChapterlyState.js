/**
 * Central client-side state for the Chapterly UI.
 *
 * Flow: auth → pick chapter on dashboard → journal → scrapbook reads the same data.
 * Data is stored in localStorage so refreshes keep your demo entries.
 * When the Express API adds routes, replace the localStorage helpers with fetch calls.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'chapterly-app-state-v1';

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadPersistedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { user: null, chapters: [], activeChapterId: null };
    }
    return JSON.parse(raw);
  } catch {
    return { user: null, chapters: [], activeChapterId: null };
  }
}

function savePersistedState(snapshot) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function useChapterlyState() {
  const [user, setUser] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  // Restore saved session once when the app mounts in the browser.
  useEffect(() => {
    const saved = loadPersistedState();
    setUser(saved.user);
    setChapters(saved.chapters ?? []);
    setActiveChapterId(saved.activeChapterId);
    setHydrated(true);
  }, []);

  // Keep localStorage in sync whenever core data changes.
  useEffect(() => {
    if (!hydrated) {
      return;
    }
    savePersistedState({ user, chapters, activeChapterId });
  }, [user, chapters, activeChapterId, hydrated]);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? null;

  const signIn = useCallback(({ email, displayName }) => {
    setUser({
      email: email.trim().toLowerCase(),
      displayName: displayName?.trim() || email.split('@')[0],
    });
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    setActiveChapterId(null);
  }, []);

  const startChapterFromTemplate = useCallback((template, customTitle) => {
    const title =
      template.id === 'custom'
        ? customTitle?.trim() || 'My Chapter'
        : template.title;

    const chapter = {
      id: createId(),
      templateId: template.id,
      title,
      emoji: template.emoji,
      stories: [],
      goals: [],
      photos: [],
      createdAt: new Date().toISOString(),
    };

    setChapters((prev) => [...prev, chapter]);
    setActiveChapterId(chapter.id);
    return chapter.id;
  }, []);

  const openChapter = useCallback((chapterId) => {
    setActiveChapterId(chapterId);
  }, []);

  const addStory = useCallback((chapterId, { title, body }) => {
    const story = {
      id: createId(),
      title: title.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    };

    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, stories: [story, ...chapter.stories] }
          : chapter,
      ),
    );
  }, []);

  const addGoal = useCallback((chapterId, { title, notes }) => {
    const goal = {
      id: createId(),
      title: title.trim(),
      notes: notes?.trim() ?? '',
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, goals: [...chapter.goals, goal] }
          : chapter,
      ),
    );
  }, []);

  const toggleGoal = useCallback((chapterId, goalId) => {
    setChapters((prev) =>
      prev.map((chapter) => {
        if (chapter.id !== chapterId) {
          return chapter;
        }

        return {
          ...chapter,
          goals: chapter.goals.map((goal) =>
            goal.id === goalId
              ? { ...goal, isCompleted: !goal.isCompleted }
              : goal,
          ),
        };
      }),
    );
  }, []);

  const addPhotos = useCallback((chapterId, photoEntries) => {
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, photos: [...chapter.photos, ...photoEntries] }
          : chapter,
      ),
    );
  }, []);

  return {
    hydrated,
    user,
    chapters,
    activeChapter,
    activeChapterId,
    signIn,
    signOut,
    startChapterFromTemplate,
    openChapter,
    addStory,
    addGoal,
    toggleGoal,
    addPhotos,
  };
}
