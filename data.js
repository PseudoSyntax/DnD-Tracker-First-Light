/* Shared data layer: published JSON + per-browser local edits, progress and notes. */
(function () {
  const DATA_URL = "campaign-data.json";
  const KEYS = {
    points: "firstLightPoints.v3",
    progress: "firstLightProgress.v1",
    notes: "firstLightNotes.v1"
  };
  const POINT_FIELDS = ["id", "title", "location", "summary", "description", "x", "y", "chapter"];

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
    if (!Array.isArray(data.points)) throw new Error("Campaign data must contain a \"points\" array.");
    const ids = new Set();
    data.points.forEach((point, index) => {
      if (!point.id || !point.title) throw new Error(`Point ${index + 1} needs an id and a title.`);
      if (ids.has(point.id)) throw new Error(`Point id "${point.id}" is duplicated.`);
      ids.add(point.id);
    });
    return data;
  }

  async function fetchPublished() {
    const response = await fetch(DATA_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Could not load ${DATA_URL} (${response.status}).`);
    return validate(await response.json());
  }

  /* Normalises a point; a link to a chapter that does not exist is dropped. */
  function cleanPoint(point, chapters) {
    const clean = {};
    POINT_FIELDS.forEach((field) => {
      clean[field] = point[field] ?? "";
    });
    clean.x = clampPercent(point.x);
    clean.y = clampPercent(point.y);
    clean.chapter = chapters.some((chapter) => chapter.id === point.chapter) ? point.chapter : "";
    return clean;
  }

  function getPointsOverride() {
    const saved = readStore(KEYS.points, null);
    return Array.isArray(saved) ? saved : null;
  }

  function setPoints(points) {
    return writeStore(KEYS.points, points.map((point) => ({ ...point })));
  }

  function clearEdits() {
    try {
      localStorage.removeItem(KEYS.points);
    } catch (error) {
      console.warn("Unable to clear edits.", error);
    }
  }

  function hasEdits() {
    return getPointsOverride() !== null;
  }

  function applyEdits(data) {
    const source = getPointsOverride() || data.points;
    return { ...data, points: source.map((point) => cleanPoint(point, data.chapters)) };
  }

  /* Returns the points from an imported campaign file. */
  function pointsFromImport(published, imported) {
    validate(imported);
    return imported.points.map((point) => cleanPoint(point, published.chapters));
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
    getPointsOverride,
    setPoints,
    clearEdits,
    hasEdits,
    applyEdits,
    pointsFromImport,
    clampPercent,
    isQuestDone,
    setQuestDone,
    getNotes,
    setNotes
  };
})();
