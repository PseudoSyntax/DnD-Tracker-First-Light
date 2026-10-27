const chapters = [
  {
    number: 1,
    title: "The Whispering Forest",
    location: "Forest of Hollow Pine",
    session: "Session 01",
    summary:
      "The party enters the Blackbriar frontier, where a forgotten lantern is said to have warmed the land before the first winter of ruin. Old roots sway like whispers, and every trail seems to remember the names of those who are already lost.",
    snippet: "A forest of ash and moonlight where a lantern-first omen sets the campaign in motion.",
    image:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    number: 2,
    title: "Ashes of the Moor",
    location: "The Emberfen",
    session: "Session 02",
    summary:
      "A ruined keep rises from a field of smoldering heather, where the cult’s first ash-mark is found beneath a collapsed bell tower. The air tastes of smoke and prophecy.",
    snippet: "A burned moor of ruined keeps, bell towers, and ash-marked cult sigils.",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
  },
  {
    number: 3,
    title: "The Shattered Tide",
    location: "Nightmere Coast",
    session: "Session 03",
    summary:
      "A drowned chapel and black tide pull the party toward an enemy they cannot name. Strange sea sigils pulse beneath the moon, and the dead follow the sound of bells across the sand.",
    snippet: "A moonlit coast haunted by drowned shrines and a dark sea ritual.",
    image:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80"
  },
  {
    number: 4,
    title: "The Iron Ridge",
    location: "Stormglass Peaks",
    session: "Session 04",
    summary:
      "The mountains answer with thunder and glacier-cold silence. Within the ruined fortress, a crown of stormsteel is hidden beyond a door that only opens to a vow.",
    snippet: "A thunder-ridden mountain pass guarding a broken crown of stormsteel.",
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"
  },
  {
    number: 5,
    title: "The Glass Marsh",
    location: "Mire of Sable Reed",
    session: "Session 05",
    summary:
      "The marsh gleams like broken glass beneath the twilight. The party follows a trail of lantern-light through reeds that whisper in a hundred old dialects, each one naming a forbidden oath.",
    snippet: "A mirrored swamp where lanterns flicker through reeds and old oaths.",
    image:
      "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80"
  },
  {
    number: 6,
    title: "The Vault of Echoes",
    location: "Lair of Silent Bells",
    session: "Session 06",
    summary:
      "Beneath the ruins of a collapsed citadel, the party uncovers a chamber of listening stone where every memory is stored in a different bell tone. The cult’s plan becomes more dreadful and more intimate.",
    snippet: "A hidden vault of resonant stone and memory-born danger.",
    image:
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80"
  },
  {
    number: 7,
    title: "The Hollow Crown",
    location: "Fane of Last Winter",
    session: "Session 07",
    summary:
      "A dead throne room opens beneath a frozen shrine, revealing the final living remnant of a kingdom that chose ritual over mercy. The party gains the choice to either break or wear the crown’s burden.",
    snippet: "A frozen shrine and a throne room where old kings do not rest quietly.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80"
  },
  {
    number: 8,
    title: "First Dawn",
    location: "Skyreach Observatory",
    session: "Session 08",
    summary:
      "At the peak of the world, the signal of the first dawn waits under a temple of stars. The final cost of the ritual is no longer hidden; it is carried in the hands of the heroes who chose to stand against it.",
    snippet: "The campaign ends beneath a rising sky and the first true dawn.",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80"
  }
];

const chapterHero = document.getElementById("chapter-hero");
const chapterList = document.getElementById("chapter-list");
const heroTitle = document.getElementById("hero-title");
const heroSummary = document.getElementById("hero-summary");
const heroLocation = document.getElementById("hero-location");
const heroSession = document.getElementById("hero-session");

let activeChapter = 0;

function renderChapters() {
  chapterList.innerHTML = chapters
    .map((chapter, index) => {
      const selected = index === activeChapter;
      return `
        <button
          class="chapter-tile ${selected ? "active" : ""}"
          data-index="${index}"
          type="button"
          aria-label="${chapter.title}"
        >
          <img src="${chapter.image}" alt="${chapter.title}" />
          <div class="tile-overlay"></div>
          <div class="tile-content">
            <span class="tile-number">Chapter ${chapter.number}</span>
            <span class="tile-name">${chapter.title}</span>
            <span class="tile-status">${chapter.session}</span>
            <span class="tile-snippet">${chapter.snippet}</span>
          </div>
        </button>
      `;
    })
    .join("");

  chapterList.querySelectorAll(".chapter-tile").forEach((button) => {
    button.addEventListener("click", () => {
      activeChapter = Number(button.dataset.index);
      renderHero();
      renderChapters();
    });
  });
}

function renderHero() {
  const chapter = chapters[activeChapter];
  chapterHero.style.backgroundImage = `linear-gradient(90deg, rgba(9, 12, 14, 0.78), rgba(9, 12, 14, 0.28)), url("${chapter.image}")`;
  heroTitle.textContent = chapter.title;
  heroSummary.textContent = chapter.summary;
  heroLocation.textContent = chapter.location;
  heroSession.textContent = chapter.session;
}

renderHero();
renderChapters();
