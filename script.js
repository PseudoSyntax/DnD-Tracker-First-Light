const sessions = [
  {
    number: "Session 01",
    date: "Moon 3, 1177",
    title: "The Lantern in the Ashes",
    summary:
      "The party followed a broken trail of lantern light into a forgotten watchtower, where the first hint of the Black Lantern’s purpose was etched into the stone walls. The keepers of Emberfall bowed to the old oath and invited the heroes into their fading story.",
    tags: ["Watchtower", "Oath", "Mystery"],
    image:
      "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=900&q=80"
  },
  {
    number: "Session 02",
    date: "Moon 14, 1177",
    title: "Whispers Beneath the Bridge",
    summary:
      "The road to Briar Creek narrowed into a ruined stone bridge haunted by voices trapped in the river. A fallen trader’s ledger led the party to a hidden smuggling route and the first confirmed link to the cult’s supply chain.",
    tags: ["Bridge", "Smugglers", "Investigation"],
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80"
  },
  {
    number: "Session 03",
    date: "Moon 26, 1177",
    title: "Ashes of the Orchard",
    summary:
      "A once-proud orchard became a field of charred roots and ghostly fruit. The group uncovered a ritual site beneath the soil, preserving the memory of a ritual that drained life from the land and left behind a sealed sigil carved into the earth.",
    tags: ["Ritual", "Forest", "Tragedy"],
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80"
  },
  {
    number: "Session 04",
    date: "Moon 8, 1178",
    title: "The Bell in the Hollow",
    summary:
      "At the edge of the moor, a cracked bell tolled from beneath a collapsed shrine. A lone survivor revealed that the cult had stolen the last surviving ember from the town’s ancestral flame, condemning the valley to a slow and hungry winter.",
    tags: ["Shrine", "Bell", "Sacrifice"],
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"
  },
  {
    number: "Session 05",
    date: "Moon 19, 1178",
    title: "The Broken Crown",
    summary:
      "The party stole into a ruined palace to find one of the crown’s relic shards, only to awaken a sleeping guardian bound to the old kings. In a battle of steel and memory, they earned the right to carry the crown’s final secret into the wilds.",
    tags: ["Palace", "Guardian", "Relic"],
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80"
  },
  {
    number: "Session 06",
    date: "Moon 2, 1179",
    title: "The Rook and the Riven Sky",
    summary:
      "The party traced the cult’s leaders to a mountain monastery where the stars were being studied as living scripture. A catastrophic omen split the sky, and the survivors realized that the ritual was not simply to destroy the land — it was to rewrite its fate.",
    tags: ["Monastery", "Celestial", "Prophecy"],
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80"
  },
  {
    number: "Session 07",
    date: "Moon 10, 1179",
    title: "First Light",
    summary:
      "At the heart of the old observatory, the party confronted the cult’s high priest beneath the rising dawn. When the fractured relic was restored to the mountain’s heart, the first true sunrise in years broke over the valley and the campaign’s first arc was finally sealed.",
    tags: ["Finale", "Dawn", "Revelation"],
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
  }
];

const sessionList = document.getElementById("session-list");
const galleryGrid = document.getElementById("gallery-grid");
const sessionCount = document.getElementById("session-count");

sessionCount.textContent = sessions.length;

sessionList.innerHTML = sessions
  .map(
    (session) => `
      <article class="session-page">
        <div class="session-visual">
          <img src="${session.image}" alt="${session.title} artwork" />
        </div>
        <div class="session-details">
          <div class="session-header">
            <span class="session-number">${session.number}</span>
            <span class="session-date">${session.date}</span>
          </div>
          <h4>${session.title}</h4>
          <p class="session-summary">${session.summary}</p>
          <div class="session-tags">
            ${session.tags.map((tag) => `<span>${tag}</span>`).join("")}
          </div>
        </div>
      </article>
    `
  )
  .join("");

galleryGrid.innerHTML = sessions
  .map(
    (session) => `
      <figure class="gallery-item">
        <img src="${session.image}" alt="${session.title} memory" />
        <figcaption>${session.title}</figcaption>
      </figure>
    `
  )
  .join("");
