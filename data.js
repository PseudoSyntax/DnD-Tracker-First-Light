/* Shared data layer: published JSON + per-browser local edits, progress and notes. */
(function () {
  const DATA_URL = "campaign-data.json";
  const KEYS = {
    edits: "firstLightEdits.v2",
    progress: "firstLightProgress.v1",
    notes: "firstLightNotes.v1"
  };
  const EDITABLE = ["title", "location", "session", "summary", "description", "x", "y"];

  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      console.warn(`Unable to read ${key}.`, error);
      return fallback;
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Unable to write ${key}.`, error);
      return false;
    }
  }

  function clampPercent(value, fallback = 50) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(Math.max(number, 0), 100) : fallback;
  }

  function validate(data) {
    if (!data || typeof data !== "object" || !Array.isArray(data.chapters) || !data.chapters.length) {
      throw new Error("Campaign data must contain a non-empty \"chapters\" array.");
    }
    data.chapters.forEach((chapter, index) => {
      if (!chapter.id || !chapter.title) {
        throw new Error(`Chapter ${index + 1} needs an id and a title.`);
      }
    });
    return data;
  }

  async function fetchPublished() {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Could not load ${DATA_URL} (${response.status}).`);
    return validate(await response.json());
  }

  function getEdits() {
    const edits = readStore(KEYS.edits, {});
    return edits && typeof edits === "object" ? edits : {};
  }

  function setChapterEdit(id, patch) {
    const edits = getEdits();
    edits[id] = { ...edits[id], ...patch };
    return writeStore(KEYS.edits, edits);
  }

  function clearEdits() {
    try {
      localStorage.removeItem(KEYS.edits);
    } catch (error) {
      console.warn("Unable to clear edits.", error);
    }
  }

  function hasEdits() {
    return Object.keys(getEdits()).length > 0;
  }

  function applyEdits(data, edits) {
    return {
      ...data,
      chapters: data.chapters.map((chapter) => {
        const patch = edits[chapter.id] || {};
        const merged = { ...chapter };
        EDITABLE.forEach((field) => {
          if (patch[field] !== undefined) merged[field] = patch[field];
        });
        merged.x = clampPercent(merged.x);
        merged.y = clampPercent(merged.y);
        return merged;
      })
    };
  }

  /* Converts an imported campaign file into a set of local edits. */
  function editsFromImport(published, imported) {
    validate(imported);
    const edits = {};
    imported.chapters.forEach((chapter) => {
      if (!published.chapters.some((item) => item.id === chapter.id)) return;
      const patch = {};
      EDITABLE.forEach((field) => {
        if (chapter[field] !== undefined) patch[field] = chapter[field];
      });
      edits[chapter.id] = patch;
    });
    return edits;
  }

  function replaceEdits(edits) {
    return writeStore(KEYS.edits, edits);
  }

  const questKey = (chapterId, index) => `${chapterId}:${index}`;

  function isQuestDone(chapter, index) {
    const progress = readStore(KEYS.progress, {});
    const local = progress[questKey(chapter.id, index)];
    return local === undefined ? Boolean(chapter.quests[index].done) : Boolean(local);
  }

  function setQuestDone(chapter, index, done) {
    const progress = readStore(KEYS.progress, {});
    progress[questKey(chapter.id, index)] = Boolean(done);
    writeStore(KEYS.progress, progress);
  }

  function getNotes(id) {
    return readStore(KEYS.notes, {})[id] || "";
  }

  function setNotes(id, text) {
    const notes = readStore(KEYS.notes, {});
    if (text) notes[id] = text;
    else delete notes[id];
    writeStore(KEYS.notes, notes);
  }

  window.FirstLight = {
    fetchPublished,
    getEdits,
    setChapterEdit,
    clearEdits,
    hasEdits,
    applyEdits,
    editsFromImport,
    replaceEdits,
    clampPercent,
    isQuestDone,
    setQuestDone,
    getNotes,
    setNotes
  };
})();
