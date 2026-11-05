(function () {
  const $ = (id) => document.getElementById(id);
  const els = {
    hero: $("chapter-hero"),
    list: $("chapter-list"),
    title: $("hero-title"),
    summary: $("hero-summary"),
    location: $("hero-location"),
    session: $("hero-session"),
    status: $("hero-status"),
    count: $("chapter-count"),
    prev: $("prev-chapter"),
    next: $("next-chapter"),
    mapLink: $("hero-map-link"),
    error: $("load-error"),
    journal: $("journal-panel"),
    quests: $("quest-list"),
    npcs: $("npc-list"),
    notes: $("chapter-notes"),
    partyPanel: $("party-panel"),
    party: $("party-list")
  };

  let campaign = null;
  let activeIndex = 0;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function chapterStatus(index) {
    const current = campaign.chapters.findIndex((chapter) => chapter.id === campaign.currentChapter);
    if (current === -1) return "";
    if (index < current) return "Completed";
    if (index === current) return "Current";
    return "Upcoming";
  }

  function indexFromHash() {
    const id = decodeURIComponent(location.hash.slice(1));
    const index = campaign.chapters.findIndex((chapter) => chapter.id === id);
    if (index !== -1) return index;
    const current = campaign.chapters.findIndex((chapter) => chapter.id === campaign.currentChapter);
    return current === -1 ? 0 : current;
  }

  function selectChapter(index, { updateHash = true, focusTile = false } = {}) {
    activeIndex = Math.min(Math.max(index, 0), campaign.chapters.length - 1);
    if (updateHash) history.replaceState(null, "", `#${campaign.chapters[activeIndex].id}`);
    renderHero();
    renderList();
    renderJournal();
    if (focusTile) els.list.querySelector(".chapter-tile.active")?.focus();
  }

  function renderList() {
    els.list.replaceChildren(
      ...campaign.chapters.map((chapter, index) => {
        const selected = index === activeIndex;
        const button = el("button", `chapter-tile${selected ? " active" : ""}`);
        button.type = "button";
        button.setAttribute("aria-pressed", String(selected));
        button.setAttribute("aria-label", `Chapter ${chapter.number}: ${chapter.title}`);
        button.addEventListener("click", () => selectChapter(index));

        const img = el("img");
        img.src = chapter.image;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.addEventListener("error", () => img.remove());

        const content = el("div", "tile-content");
        const status = chapterStatus(index);
        content.append(
          el("span", "tile-number", `Chapter ${chapter.number}`),
          el("span", "tile-name", chapter.title),
          el("span", "tile-status", status ? `${chapter.session} · ${status}` : chapter.session),
          el("span", "tile-snippet", chapter.snippet)
        );
        button.append(img, el("div", "tile-overlay"), content);
        return button;
      })
    );
  }

  function renderHero() {
    const chapter = campaign.chapters[activeIndex];
    const image = chapter.image ? `, url("${encodeURI(chapter.image)}")` : "";
    els.hero.style.backgroundImage = `linear-gradient(90deg, rgba(9, 12, 14, 0.78), rgba(9, 12, 14, 0.28))${image}`;
    els.title.textContent = chapter.title;
    document.querySelector(".chapter-kicker").textContent =
      chapterStatus(activeIndex) === "Current" ? "Current Chapter" : `Chapter ${chapter.number}`;
    els.summary.textContent = chapter.summary;
    els.location.textContent = chapter.location;
    els.session.textContent = chapter.session;
    const status = chapterStatus(activeIndex);
    els.status.textContent = status;
    els.status.hidden = !status;
    els.prev.disabled = activeIndex === 0;
    els.next.disabled = activeIndex === campaign.chapters.length - 1;
    els.mapLink.href = `map.html#${chapter.id}`;
    document.title = `${chapter.title} | First Light`;
  }

  function renderJournal() {
    const chapter = campaign.chapters[activeIndex];
    els.journal.hidden = false;

    els.quests.replaceChildren(
      ...(chapter.quests.length
        ? chapter.quests.map((quest, index) => {
            const item = el("li");
            const label = el("label", "quest-item");
            const box = el("input");
            box.type = "checkbox";
            box.checked = FirstLight.isQuestDone(chapter, index);
            box.addEventListener("change", () => {
              FirstLight.setQuestDone(chapter, index, box.checked);
              label.classList.toggle("done", box.checked);
            });
            label.classList.toggle("done", box.checked);
            label.append(box, el("span", "", quest.text));
            item.append(label);
            return item;
          })
        : [el("li", "empty", "No objectives recorded yet.")])
    );

    els.npcs.replaceChildren(
      ...(chapter.npcs.length
        ? chapter.npcs.map((npc) => {
            const item = el("li");
            item.append(el("strong", "", npc.name));
            if (npc.note) item.append(document.createTextNode(` — ${npc.note}`));
            return item;
          })
        : [el("li", "empty", "No one of note yet.")])
    );

    els.notes.value = FirstLight.getNotes(chapter.id);
  }

  function renderParty() {
    const party = campaign.party || [];
    els.partyPanel.hidden = !party.length;
    els.party.replaceChildren(
      ...party.map((member) => {
        const item = el("li");
        item.append(el("strong", "", member.name));
        const detail = [member.role, member.note].filter(Boolean).join(" — ");
        if (detail) item.append(document.createTextNode(` — ${detail}`));
        return item;
      })
    );
  }

  function normalize(data) {
    data.chapters.forEach((chapter, index) => {
      chapter.number = chapter.number || index + 1;
      chapter.quests = Array.isArray(chapter.quests) ? chapter.quests : [];
      chapter.npcs = Array.isArray(chapter.npcs) ? chapter.npcs : [];
      chapter.snippet = chapter.snippet || "";
    });
    return data;
  }

  async function init() {
    try {
      campaign = normalize(await FirstLight.fetchPublished());
    } catch (error) {
      console.error(error);
      els.title.textContent = "Journal unavailable";
      els.error.hidden = false;
      els.error.textContent =
        "Could not load campaign-data.json. If you opened this file directly, serve the folder with a local web server (for example: python3 -m http.server).";
      return;
    }

    els.count.textContent = `${campaign.chapters.length} Chapters`;
    els.prev.addEventListener("click", () => selectChapter(activeIndex - 1));
    els.next.addEventListener("click", () => selectChapter(activeIndex + 1));
    els.notes.addEventListener("input", () => {
      FirstLight.setNotes(campaign.chapters[activeIndex].id, els.notes.value.trim() ? els.notes.value : "");
    });
    window.addEventListener("hashchange", () => selectChapter(indexFromHash(), { updateHash: false }));
    els.list.addEventListener("keydown", (event) => {
      const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      selectChapter(activeIndex + step, { focusTile: true });
    });

    renderParty();
    selectChapter(indexFromHash(), { updateHash: Boolean(location.hash) });
  }

  init();
})();
