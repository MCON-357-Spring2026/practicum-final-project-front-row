/**
 * Central client-side state for the Chapterly UI, backed by the Express API.
 *
 * Flow: auth → pick chapter on dashboard → journal → scrapbook reads the same data.
 * Chapters, journal entries (stories), and goals are persisted in PostgreSQL via
 * the API. Photos remain in-browser only (the upload endpoint needs Cloudinary
 * credentials that are not configured for local development).
 */

import { useCallback, useEffect, useState } from 'react';
import { api, setToken, getToken } from '../api/client.js';

/**
 * Folds the flat API responses (chapters + entries + goals + photos) into the
 * nested shape the UI components expect: chapter.stories / .goals / .photos.
 */
function composeChapters(chapters, entries, goals, photos) {
  const entriesByChapter = groupBy(entries, 'chapterId');
  const goalsByChapter = groupBy(goals, 'chapterId');
  const photosByChapter = groupBy(photos.map(normalizePhoto), 'chapterId');

  return chapters.map((chapter) => ({
    ...chapter,
    stories: entriesByChapter[chapter.id] ?? [],
    goals: goalsByChapter[chapter.id] ?? [],
    photos: photosByChapter[chapter.id] ?? [],
  }));
}

/**
 * Maps an API photo (Cloudinary `url`) onto the field names the UI renders.
 */
function normalizePhoto(photo) {
  return {
    id: photo.id,
    chapterId: photo.chapterId,
    previewUrl: photo.url,
    caption: photo.caption ?? '',
    name: photo.caption || 'Photo',
    createdAt: photo.createdAt,
  };
}

function groupBy(rows, key) {
  return rows.reduce((acc, row) => {
    (acc[row[key]] ??= []).push(row);
    return acc;
  }, {});
}

export function useChapterlyState() {
  const [user, setUser] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState('');

  const loadEverything = useCallback(async () => {
    const [{ chapters: rawChapters }, { entries }, { goals }, { photos }] =
      await Promise.all([
        api.listChapters(),
        api.listJournalEntries(),
        api.listGoals(),
        api.listPhotos(),
      ]);
    setChapters(composeChapters(rawChapters, entries, goals, photos));
  }, []);

  // On first mount, restore the session from a saved token (if any).
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      const token = getToken();
      if (!token) {
        if (!cancelled) setHydrated(true);
        return;
      }

      try {
        const { user: me } = await api.me();
        if (cancelled) return;
        setUser(me);
        await loadEverything();
      } catch {
        // Token expired or invalid — drop it and start at the auth screen.
        setToken(null);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, [loadEverything]);

  const register = useCallback(
    async ({ email, password, displayName }) => {
      setError('');
      const { token, user: created } = await api.register({
        email,
        password,
        displayName,
      });
      setToken(token);
      setUser(created);
      await loadEverything();
    },
    [loadEverything],
  );

  const login = useCallback(
    async ({ email, password }) => {
      setError('');
      const { token, user: signedIn } = await api.login({ email, password });
      setToken(token);
      setUser(signedIn);
      await loadEverything();
    },
    [loadEverything],
  );

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
    setChapters([]);
    setActiveChapterId(null);
  }, []);

  const activeChapter = chapters.find((c) => c.id === activeChapterId) ?? null;

  const startChapterFromTemplate = useCallback(async (template, customTitle) => {
    const title =
      template.id === 'custom'
        ? customTitle?.trim() || 'My Chapter'
        : template.title;

    const { chapter } = await api.createChapter({
      title,
      emoji: template.emoji,
      templateId: template.id,
    });

    const composed = { ...chapter, stories: [], goals: [], photos: [] };
    setChapters((prev) => [composed, ...prev]);
    setActiveChapterId(chapter.id);
    return chapter.id;
  }, []);

  const openChapter = useCallback((chapterId) => {
    setActiveChapterId(chapterId);
  }, []);

  // Renames a chapter, then updates it in state (keeps its stories/goals/photos).
  const renameChapter = useCallback(async (chapterId, title) => {
    const { chapter } = await api.updateChapter(chapterId, { title });
    setChapters((prev) =>
      prev.map((c) => (c.id === chapterId ? { ...c, title: chapter.title } : c)),
    );
  }, []);

  // Deletes a chapter (and its stories/goals/photos via cascade), then drops it
  // from state. If the deleted chapter was open, return to the dashboard.
  const deleteChapter = useCallback(async (chapterId) => {
    await api.deleteChapter(chapterId);
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
    setActiveChapterId((current) => (current === chapterId ? null : current));
  }, []);

  const addStory = useCallback(
    async (chapterId, { title, body, entryDate, details, mood }) => {
      const { entry } = await api.createJournalEntry({
        chapterId,
        title,
        body,
        entryDate,
        details,
        mood,
      });
      setChapters((prev) =>
        prev.map((chapter) =>
          chapter.id === chapterId
            ? { ...chapter, stories: [entry, ...chapter.stories] }
            : chapter,
        ),
      );
    },
    [],
  );

  // Saves edits to an existing story, then swaps it in chapter state.
  const editStory = useCallback(async (chapterId, entryId, { title, body }) => {
    const { entry } = await api.updateJournalEntry(entryId, { title, body });
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? {
              ...chapter,
              stories: chapter.stories.map((s) => (s.id === entryId ? entry : s)),
            }
          : chapter,
      ),
    );
  }, []);

  // Deletes a story, then removes it from chapter state.
  const deleteStory = useCallback(async (chapterId, entryId) => {
    await api.deleteJournalEntry(entryId);
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, stories: chapter.stories.filter((s) => s.id !== entryId) }
          : chapter,
      ),
    );
  }, []);

  const addGoal = useCallback(async (chapterId, { title, notes }) => {
    const { goal } = await api.createGoal({ chapterId, title, notes });
    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, goals: [...chapter.goals, goal] }
          : chapter,
      ),
    );
  }, []);

  const toggleGoal = useCallback(
    async (chapterId, goalId) => {
      const chapter = chapters.find((c) => c.id === chapterId);
      const current = chapter?.goals.find((g) => g.id === goalId);
      if (!current) return;

      const { goal } = await api.updateGoal(goalId, {
        isCompleted: !current.isCompleted,
      });

      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId
            ? { ...c, goals: c.goals.map((g) => (g.id === goalId ? goal : g)) }
            : c,
        ),
      );
    },
    [chapters],
  );

  // Uploads each selected file to Cloudinary via the API, then appends the saved
  // photos (with permanent URLs) to the chapter.
  const addPhotos = useCallback(async (chapterId, { files, caption }) => {
    const uploaded = [];
    for (const file of files) {
      const { photo } = await api.uploadPhoto({ chapterId, caption, file });
      uploaded.push(normalizePhoto(photo));
    }

    setChapters((prev) =>
      prev.map((chapter) =>
        chapter.id === chapterId
          ? { ...chapter, photos: [...chapter.photos, ...uploaded] }
          : chapter,
      ),
    );

    return uploaded.length;
  }, []);

  return {
    hydrated,
    user,
    error,
    chapters,
    activeChapter,
    activeChapterId,
    register,
    login,
    signOut,
    startChapterFromTemplate,
    openChapter,
    renameChapter,
    deleteChapter,
    addStory,
    editStory,
    deleteStory,
    addGoal,
    toggleGoal,
    addPhotos,
  };
}
