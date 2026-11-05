(function () {
  const $ = (id) => document.getElementById(id);
  const mapApp = $("mapApp");
  const mapDetails = $("mapDetails");
  const helpPanel = $("helpPanel");
  const helpBtn = $("helpBtn");
  const fullscreenBtn = $("fullscreenBtn");
  const mapStage = $("mapStage");
  const mapViewport = $("mapViewport");
  const mapImage = $("mapImage");
  const routeLine = $("routeLine");
  const mapTitle = $("map-title");
  const mapSummary = $("map-summary");
  const mapLocation = $("map-location");
  const mapSession = $("map-session");
  const panelKicker = $("panelKicker");
  const viewPanel = $("viewPanel");
  const editorForm = $("editorForm");
  const editTools = $("editTools");
  const savePanel = $("savePanel");
  const saveBtn = $("saveBtn");
  const locationDescription = $("locationDescription");
  const statusLine = $("statusLine");
  const journalLink = $("journalLink");
  const editModeBtn = $("editModeBtn");
  const panelToggleBtn = $("panelToggleBtn");
  const routeBtn = $("routeBtn");
  const labelsBtn = $("labelsBtn");
  const zoomInBtn = $("zoomInBtn");
  const zoomOutBtn = $("zoomOutBtn");
  const importFile = $("importFile");

  const URL_PREFIX = "map:";
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 1.35;
  const EDGE_PADDING = 1;
  const DRAG_THRESHOLD = 4;

  let published = null;
  let campaign = null;
  let pins = [];
  let selectedIndex = null;
  let zoom = 1;
  let panX = 0;
  let panY = 0;
  let size = { w: 0, h: 0 };
  let editMode = false;
  let dragIndex = null;
  let moved = false;
  const pointers = new Map();
  let gesture = null;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const round1 = (value) => Math.round(value * 10) / 10;
  const round2 = (value) => Math.round(value * 100) / 100;

  function setStatusLink(message, url) {
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "View pull request";
    statusLine.replaceChildren(document.createTextNode(`${message} `), link);
  }

  function setStatus(message) {
    queueMicrotask(() => saveBtn.classList.toggle("has-edits", FirstLight.hasEdits()));
    statusLine.textContent = message || (FirstLight.hasEdits() ? "Local edits active in this browser." : "");
  }

  /* ---------- Viewport geometry ---------- */

  function layoutViewport() {
    const w = mapStage.clientWidth;
    const h = mapStage.clientHeight;
    if (!w || !h) return;
    const iw = mapImage.naturalWidth || 2048;
    const ih = mapImage.naturalHeight || 1536;
    const scale = Math.min(w / iw, h / ih);
    size = { w: iw * scale, h: ih * scale };
    Object.assign(mapViewport.style, {
      width: `${size.w}px`,
      height: `${size.h}px`,
      left: `${(w - size.w) / 2}px`,
      top: `${(h - size.h) / 2}px`
    });
    applyTransform();
  }

  /* Keeps ?map:center=x,y&map:zoom=z (and #chapter-id) in the address bar so views can be shared. */
  let urlTimer = null;
  function syncUrl() {
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      if (!campaign || !size.w) return;
      const params = new URLSearchParams(location.search);
      const cx = 50 - (panX / (size.w * zoom)) * 100;
      const cy = 50 - (panY / (size.h * zoom)) * 100;
      if (zoom <= MIN_ZOOM + 0.001 && Math.abs(panX) < 1 && Math.abs(panY) < 1) {
        params.delete(`${URL_PREFIX}center`);
        params.delete(`${URL_PREFIX}zoom`);
      } else {
        params.set(`${URL_PREFIX}center`, `${round2(cx)},${round2(cy)}`);
        params.set(`${URL_PREFIX}zoom`, String(round2(Math.log2(zoom))));
      }
      const query = params.toString().replace(/%3A/gi, ":").replace(/%2C/gi, ",");
      history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
    }, 150);
  }

  function readUrlView() {
    const params = new URLSearchParams(location.search);
    const zoomParam = parseFloat(params.get(`${URL_PREFIX}zoom`));
    const [cx, cy] = (params.get(`${URL_PREFIX}center`) || "").split(",").map(parseFloat);
    if (!Number.isFinite(zoomParam) && !(Number.isFinite(cx) && Number.isFinite(cy))) return false;
    zoom = clamp(Number.isFinite(zoomParam) ? 2 ** zoomParam : 1, MIN_ZOOM, MAX_ZOOM);
    if (Number.isFinite(cx) && Number.isFinite(cy)) {
      panX = -((cx - 50) / 100) * size.w * zoom;
      panY = -((cy - 50) / 100) * size.h * zoom;
    }
    applyTransform();
    return true;
  }

  function applyTransform() {
    const w = mapStage.clientWidth;
    const h = mapStage.clientHeight;
    const maxX = Math.max(0, (size.w * zoom - w) / 2);
    const maxY = Math.max(0, (size.h * zoom - h) / 2);
    panX = clamp(panX, -maxX, maxX);
    panY = clamp(panY, -maxY, maxY);
    mapViewport.style.setProperty("--inv", String(1 / zoom));
    mapViewport.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    zoomInBtn.disabled = zoom >= MAX_ZOOM - 0.001;
    zoomOutBtn.disabled = zoom <= MIN_ZOOM + 0.001;
    syncUrl();
  }

  /* Zooms while keeping the point under (cx, cy) — offsets from the stage centre — fixed. */
  function zoomAt(nextZoom, cx = 0, cy = 0) {
    const next = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const ratio = next / zoom;
    panX = cx - (cx - panX) * ratio;
    panY = cy - (cy - panY) * ratio;
    zoom = next;
    applyTransform();
  }

  function stageOffset(clientX, clientY) {
    const rect = mapStage.getBoundingClientRect();
    return { x: clientX - (rect.left + rect.width / 2), y: clientY - (rect.top + rect.height / 2) };
  }

  function resetView() {
    zoom = 1;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  function centerOn(index) {
    if (zoom <= 1) return;
    const chapter = campaign.chapters[index];
    panX = -((chapter.x - 50) / 100) * size.w * zoom;
    panY = -((chapter.y - 50) / 100) * size.h * zoom;
    applyTransform();
  }

  function pointToPercent(clientX, clientY) {
    const rect = mapViewport.getBoundingClientRect();
    return {
      x: clamp(round1(((clientX - rect.left) / rect.width) * 100), EDGE_PADDING, 100 - EDGE_PADDING),
      y: clamp(round1(((clientY - rect.top) / rect.height) * 100), EDGE_PADDING, 100 - EDGE_PADDING)
    };
  }

  /* ---------- Pins and route ---------- */

  function currentIndex() {
    return campaign.chapters.findIndex((chapter) => chapter.id === campaign.currentChapter);
  }

  function buildPins() {
    pins.forEach((pin) => pin.remove());
    pins = campaign.chapters.map((chapter, index) => {
      const pin = document.createElement("button");
      pin.type = "button";
      pin.className = "map-pin";
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.textContent = chapter.number;
      const label = document.createElement("span");
      label.className = "label";
      pin.append(dot, label);

      pin.addEventListener("click", (event) => {
        event.stopPropagation();
        select(index);
      });
      pin.addEventListener("pointerdown", (event) => {
        event.stopPropagation();
        if (!editMode) return;
        event.preventDefault();
        dragIndex = index;
        moved = false;
        pin.setPointerCapture?.(event.pointerId);
        select(index, { keepView: true });
      });
      pin.addEventListener("keydown", (event) => onPinKey(event, index));
      mapViewport.appendChild(pin);
      return pin;
    });
    updatePins();
  }

  function updatePins() {
    const current = currentIndex();
    campaign.chapters.forEach((chapter, index) => {
      const pin = pins[index];
      pin.style.left = `${chapter.x}%`;
      pin.style.top = `${chapter.y}%`;
      pin.title = `${chapter.title} — ${chapter.location}`;
      pin.setAttribute("aria-label", `Chapter ${chapter.number}: ${chapter.title}`);
      pin.setAttribute("aria-pressed", String(index === selectedIndex));
      pin.classList.toggle("selected", index === selectedIndex);
      pin.classList.toggle("current", index === current);
      pin.classList.toggle("past", current !== -1 && index < current);
      pin.querySelector(".label").textContent = chapter.title;
    });
    routeLine.setAttribute("points", campaign.chapters.map((chapter) => `${chapter.x},${chapter.y}`).join(" "));
  }

  function movePin(index, x, y) {
    const chapter = campaign.chapters[index];
    chapter.x = x;
    chapter.y = y;
    pins[index].style.left = `${x}%`;
    pins[index].style.top = `${y}%`;
    routeLine.setAttribute("points", campaign.chapters.map((item) => `${item.x},${item.y}`).join(" "));
    if (selectedIndex === index) syncCoordInputs(chapter);
  }

  function commitPin(index) {
    const chapter = campaign.chapters[index];
    FirstLight.setChapterEdit(chapter.id, { x: chapter.x, y: chapter.y });
    setStatus("Position saved locally. Export to publish.");
  }

  function onPinKey(event, index) {
    event.stopPropagation();
    if (event.key === "Escape") {
      select(null);
      mapStage.focus();
      return;
    }
    if (!editMode) return;
    const step = event.shiftKey ? 2 : 0.5;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (!delta) return;
    event.preventDefault();
    const chapter = campaign.chapters[index];
    movePin(
      index,
      clamp(round1(chapter.x + delta[0]), EDGE_PADDING, 100 - EDGE_PADDING),
      clamp(round1(chapter.y + delta[1]), EDGE_PADDING, 100 - EDGE_PADDING)
    );
    commitPin(index);
  }

  /* ---------- Details panel ---------- */

  function select(index, { keepView = false, center = false } = {}) {
    selectedIndex = index;
    history.replaceState(null, "", `${location.pathname}${location.search}${index === null ? "" : `#${campaign.chapters[index].id}`}`);
    updatePins();
    renderPanel();
    if (center && index !== null && !keepView) centerOn(index);
  }

  function syncCoordInputs(chapter) {
    editorForm.elements.x.value = chapter.x;
    editorForm.elements.y.value = chapter.y;
  }

  function renderPanel() {
    const chapter = selectedIndex !== null ? campaign.chapters[selectedIndex] : null;
    const showEditor = editMode && chapter;
    viewPanel.hidden = Boolean(showEditor);
    editorForm.hidden = !showEditor;
    editTools.hidden = !editMode;
    journalLink.hidden = !chapter;
    panelKicker.textContent = chapter ? `Waypoint ${chapter.number} of ${campaign.chapters.length}` : "Waypoint";

    if (chapter) {
      journalLink.href = `index.html#${chapter.id}`;
      for (const name of ["title", "location", "session", "summary", "description", "x", "y"]) {
        editorForm.elements[name].value = chapter[name] ?? "";
      }
    }

    const detail = chapter || campaign.world;
    mapTitle.textContent = detail.title;
    mapSummary.textContent = detail.summary;
    mapLocation.textContent = detail.location;
    mapSession.textContent = detail.session;

    if (editMode && !chapter) {
      locationDescription.textContent = "Select a marker to edit its details.";
    } else if (showEditor) {
      locationDescription.textContent = "";
    } else {
      const strong = document.createElement("strong");
      strong.textContent = `${chapter ? chapter.location : "World overview"}: `;
      locationDescription.replaceChildren(
        strong,
        document.createTextNode(chapter ? chapter.description || chapter.summary : campaign.world.description)
      );
    }
  }

  function step(direction) {
    const count = campaign.chapters.length;
    const next = selectedIndex === null ? (direction > 0 ? 0 : count - 1) : (selectedIndex + direction + count) % count;
    select(next, { center: true });
    pins[next].focus({ preventScroll: true });
  }

  /* ---------- Modes ---------- */

  function setPanelVisible(visible) {
    mapDetails.hidden = !visible;
    panelToggleBtn.setAttribute("aria-expanded", String(visible));
    panelToggleBtn.title = visible ? "Hide map details" : "Show map details";
  }

  function setEditMode(enabled) {
    editMode = Boolean(enabled);
    editModeBtn.setAttribute("aria-pressed", String(editMode));
    mapStage.classList.toggle("editing", editMode);
    $("mapHint").textContent = editMode
      ? "Edit mode: drag markers, or select one and use arrow keys"
      : "Drag to pan · scroll or pinch to zoom";
    if (editMode) setPanelVisible(true);
    renderPanel();
  }

  function toggleOption(button) {
    const on = button.getAttribute("aria-pressed") !== "true";
    button.setAttribute("aria-pressed", String(on));
    return on;
  }

  /* ---------- Pointer, wheel and keyboard input ---------- */

  function pinchState() {
    const [a, b] = [...pointers.values()];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  }

  mapStage.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".map-pin, .zoom-controls")) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    mapStage.setPointerCapture?.(event.pointerId);
    moved = false;
    gesture = pointers.size >= 2 ? { type: "pinch", ...pinchState() } : { type: "pan", x: event.clientX, y: event.clientY };
    if (gesture.type === "pan") mapStage.classList.add("dragging");
  });

  mapStage.addEventListener("pointermove", (event) => {
    if (dragIndex !== null && editMode) {
      moved = true;
      const point = pointToPercent(event.clientX, event.clientY);
      movePin(dragIndex, point.x, point.y);
      return;
    }
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (gesture?.type === "pinch" && pointers.size >= 2) {
      const next = pinchState();
      const center = stageOffset(next.x, next.y);
      panX += next.x - gesture.x;
      panY += next.y - gesture.y;
      zoomAt(zoom * (next.dist / gesture.dist), center.x, center.y);
      gesture = { type: "pinch", ...next };
      moved = true;
    } else if (gesture?.type === "pan") {
      const dx = event.clientX - gesture.x;
      const dy = event.clientY - gesture.y;
      if (Math.abs(dx) + Math.abs(dy) > 0) moved = moved || Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD;
      gesture.x = event.clientX;
      gesture.y = event.clientY;
      panX += dx;
      panY += dy;
      applyTransform();
    }
  });

  function finishPointer(event) {
    if (dragIndex !== null) {
      if (moved) commitPin(dragIndex);
      dragIndex = null;
    }
    pointers.delete(event.pointerId);
    if (pointers.size === 1) {
      const [rest] = pointers.values();
      gesture = { type: "pan", x: rest.x, y: rest.y };
    } else if (!pointers.size) {
      gesture = null;
      mapStage.classList.remove("dragging");
    }
  }
  mapStage.addEventListener("pointerup", finishPointer);
  mapStage.addEventListener("pointercancel", finishPointer);

  mapStage.addEventListener("click", (event) => {
    if (event.target.closest(".map-pin, .zoom-controls")) return;
    if (moved) {
      moved = false;
      return;
    }
    if (selectedIndex !== null) select(null);
  });

  mapStage.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      const center = stageOffset(event.clientX, event.clientY);
      zoomAt(zoom * Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0015)), center.x, center.y);
    },
    { passive: false }
  );

  mapStage.addEventListener("keydown", (event) => {
    if (event.target !== mapStage) return;
    const pan = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[event.key];
    if (pan) {
      event.preventDefault();
      panX += pan[0];
      panY += pan[1];
      applyTransform();
    } else if (event.key === "+" || event.key === "=") {
      zoomAt(zoom * ZOOM_STEP);
    } else if (event.key === "-" || event.key === "_") {
      zoomAt(zoom / ZOOM_STEP);
    } else if (event.key === "?") {
      setHelpVisible(true);
    } else if (event.key === "0") {
      resetView();
    } else if (event.key === "Escape") {
      select(null);
    }
  });

  /* ---------- Editing, import and export ---------- */

  editorForm.addEventListener("input", (event) => {
    if (selectedIndex === null) return;
    const chapter = campaign.chapters[selectedIndex];
    const { name, value } = event.target;
    if (name === "x" || name === "y") {
      if (value === "") return;
      chapter[name] = clamp(FirstLight.clampPercent(value, chapter[name]), 0, 100);
      updatePins();
    } else {
      chapter[name] = value;
      if (name === "title" || name === "location") updatePins();
    }
    FirstLight.setChapterEdit(chapter.id, { [name]: chapter[name] });
    setStatus("Saved locally. Export to publish.");
  });
  editorForm.addEventListener("submit", (event) => event.preventDefault());

  $("exportBtn").addEventListener("click", () => {
    const blob = new Blob([`${JSON.stringify(campaign, null, 2)}\n`], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "campaign-data.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus("Exported. Replace campaign-data.json in the repo and commit it.");
  });

  /* ---------- Save for review ---------- */

  const REPO = "PseudoSyntax/DnD-Tracker-First-Light";
  const BASE_BRANCH = "main";
  const DATA_PATH = "campaign-data.json";

  async function github(token, path, options = {}) {
    const response = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || `GitHub returned ${response.status}`);
    return body;
  }

  const toBase64 = (text) => {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
    return btoa(binary);
  };

  async function publishWithToken(token, content) {
    const base = await github(token, `/git/ref/heads/${BASE_BRANCH}`);
    const branch = `map-edit-${new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14)}`;
    await github(token, "/git/refs", { method: "POST", body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha }) });
    const file = await github(token, `/contents/${DATA_PATH}?ref=${BASE_BRANCH}`);
    await github(token, `/contents/${DATA_PATH}`, {
      method: "PUT",
      body: JSON.stringify({ message: "Update campaign data from map editor", content: toBase64(content), sha: file.sha, branch })
    });
    const pr = await github(token, "/pulls", {
      method: "POST",
      body: JSON.stringify({ title: "Update campaign data from map editor", head: branch, base: BASE_BRANCH, body: "Edits made in the interactive map editor." })
    });
    return pr.html_url;
  }

  function updateSaveIndicator() {
    saveBtn.classList.toggle("has-edits", FirstLight.hasEdits());
  }

  saveBtn.addEventListener("click", () => {
    const open = savePanel.hidden;
    savePanel.hidden = !open;
    saveBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      setPanelVisible(true);
      $("tokenInput").focus();
    }
  });

  $("publishBtn").addEventListener("click", async () => {
    const content = `${JSON.stringify(campaign, null, 2)}\n`;
    const tokenInput = $("tokenInput");
    const token = tokenInput.value.trim();
    const button = $("publishBtn");
    if (!token) {
      try {
        await navigator.clipboard.writeText(content);
        setStatus("JSON copied. Paste it into the GitHub editor that just opened, then commit.");
      } catch (error) {
        setStatus("Could not copy automatically; use Export JSON instead.");
      }
      window.open(`https://github.com/${REPO}/edit/${BASE_BRANCH}/${DATA_PATH}`, "_blank", "noopener");
      return;
    }
    button.disabled = true;
    setStatus("Saving…");
    try {
      const url = await publishWithToken(token, content);
      tokenInput.value = "";
      setStatusLink("Saved. A pull request is waiting for approval.", url);
    } catch (error) {
      setStatus(`Save failed: ${error.message}`);
    } finally {
      button.disabled = false;
    }
  });

  $("importBtn").addEventListener("click", () => importFile.click());
  importFile.addEventListener("change", async () => {
    const file = importFile.files[0];
    importFile.value = "";
    if (!file) return;
    try {
      const edits = FirstLight.editsFromImport(published, JSON.parse(await file.text()));
      FirstLight.replaceEdits(edits);
      rebuild();
      setStatus("Imported as local edits.");
    } catch (error) {
      setStatus(`Import failed: ${error.message}`);
    }
  });

  $("resetBtn").addEventListener("click", () => {
    if (!FirstLight.hasEdits()) return setStatus("No local edits to discard.");
    if (!confirm("Discard all local map edits in this browser?")) return;
    FirstLight.clearEdits();
    rebuild();
    setStatus("Local edits discarded.");
  });

  /* ---------- Wiring ---------- */

  routeBtn.addEventListener("click", () => {
    $("mapRoute").style.display = toggleOption(routeBtn) ? "" : "none";
  });
  labelsBtn.addEventListener("click", () => {
    mapViewport.classList.toggle("no-labels", !toggleOption(labelsBtn));
  });
  panelToggleBtn.addEventListener("click", () => setPanelVisible(mapDetails.hidden));
  $("panelCloseBtn").addEventListener("click", () => {
    setPanelVisible(false);
    panelToggleBtn.focus();
  });

  function setHelpVisible(visible) {
    helpPanel.hidden = !visible;
    helpBtn.setAttribute("aria-expanded", String(visible));
    if (visible) $("helpCloseBtn").focus();
  }
  helpBtn.addEventListener("click", () => setHelpVisible(helpPanel.hidden));
  $("helpCloseBtn").addEventListener("click", () => {
    setHelpVisible(false);
    helpBtn.focus();
  });
  helpPanel.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    setHelpVisible(false);
    helpBtn.focus();
  });

  if (!document.fullscreenEnabled) fullscreenBtn.hidden = true;
  fullscreenBtn.addEventListener("click", () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else mapApp.requestFullscreen?.().catch(() => setStatus("Full screen is not available here."));
  });
  document.addEventListener("fullscreenchange", () => {
    const on = document.fullscreenElement === mapApp;
    fullscreenBtn.setAttribute("aria-label", on ? "Exit full screen" : "Enter full screen");
    fullscreenBtn.title = on ? "Exit full screen" : "Full screen";
  });
  editModeBtn.addEventListener("click", () => setEditMode(!editMode));
  zoomInBtn.addEventListener("click", () => zoomAt(zoom * ZOOM_STEP));
  zoomOutBtn.addEventListener("click", () => zoomAt(zoom / ZOOM_STEP));
  $("fitBtn").addEventListener("click", resetView);
  $("prevBtn").addEventListener("click", () => step(-1));
  $("nextBtn").addEventListener("click", () => step(1));
  new ResizeObserver(layoutViewport).observe(mapStage);
  mapImage.addEventListener("load", layoutViewport);

  function indexFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const index = campaign.chapters.findIndex((chapter) => chapter.id === id);
    return index === -1 ? null : index;
  }
  window.addEventListener("hashchange", () => {
    const index = indexFromHash();
    if (index !== selectedIndex) select(index, { center: true });
  });

  function rebuild() {
    campaign = FirstLight.applyEdits(published, FirstLight.getEdits());
    if (selectedIndex !== null && selectedIndex >= campaign.chapters.length) selectedIndex = null;
    buildPins();
    renderPanel();
  }

  async function init() {
    try {
      published = await FirstLight.fetchPublished();
    } catch (error) {
      console.error(error);
      mapTitle.textContent = "Map data unavailable";
      mapSummary.textContent =
        "Could not load campaign-data.json. If you opened this file directly, serve the folder with a local web server (for example: python3 -m http.server).";
      return;
    }
    published.world = published.world || {
      title: "The Known World", location: "", session: "", summary: "", description: ""
    };
    published.chapters.forEach((chapter, index) => {
      chapter.number = chapter.number || index + 1;
    });
    rebuild();
    layoutViewport();
    setPanelVisible(true);
    setEditMode(false);
    const hasUrlView = readUrlView();
    const initial = indexFromHash();
    if (initial !== null) select(initial, { center: !hasUrlView });
    setStatus();
  }

  init();
})();
