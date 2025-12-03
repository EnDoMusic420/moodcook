// ===============================
// Mood Cook – App Logik (mit optionalen Zutaten & Überrasch mich)
// ===============================

let selectedMood = null;

// 🔥 Deine Rezepte
const recipes = [
  {
    id: "lazy-pasta",
    name: "Cremige Lazy-Pasta",
    moods: ["müde", "gestresst"],
    ingredients: ["nudeln", "sahne", "käse", "knoblauch"],
    time: 15,
    difficulty: "easy",
    vibe: "Warm, cremig, perfektes Couch-Essen nach einem langen Tag.",
    image: "img/lazy-pasta.jpg"
  },
  {
    id: "ruehrei-bowl",
    name: "Lazy Rührei-Bowl",
    moods: ["müde", "neutral"],
    ingredients: ["ei", "brot", "butter"],
    time: 10,
    difficulty: "easy",
    vibe: "Wenig Abwasch, viel Comfort. Perfekt, wenn das Hirn aus ist.",
    image: "img/ruehrei.jpg"
  },
  {
    id: "reis-pfanne",
    name: "Happy Reis-Pfanne",
    moods: ["happy"],
    ingredients: ["reis", "gemüse", "öl"],
    time: 20,
    difficulty: "medium",
    vibe: "Bunt, crunchy, macht gute Laune und sieht sogar gesund aus.",
    image: "img/reis-pfanne.jpg"
  },
  {
    id: "nils-ultra-carbonara",
    name: "Nils’ Ultra-Carbonara",
    moods: ["happy", "neutral"],
    ingredients: ["nudeln", "ei", "speck", "käse", "pfeffer"],
    time: 20,
    difficulty: "medium",
    vibe: "Klassiker auf maximal lecker – perfekt, wenn du Bock auf Fett hast.",
    image: "img/carbonara.jpg"
  }
  // weitere Rezepte kannst du hier ergänzen
];

// ===============================
// DOM-Elemente
// ===============================

const moodButtons = document.querySelectorAll("#mood-buttons button");
const findBtn = document.getElementById("find-btn");
const surpriseBtn = document.getElementById("surprise-btn");
const ingredientsInput = document.getElementById("ingredients-input");
const resultsDiv = document.getElementById("results");
const allRecipesDiv = document.getElementById("all-recipes");

const navButtons = document.querySelectorAll(".navbar .nav-btn");
const views = document.querySelectorAll(".view");

function safeLogMissing(id, el) {
  if (!el || (el.length === 0 && !el.forEach)) {
    console.warn("Element nicht gefunden:", id);
  }
}

safeLogMissing("mood-buttons", moodButtons);
safeLogMissing("find-btn", findBtn);
safeLogMissing("surprise-btn", surpriseBtn);
safeLogMissing("ingredients-input", ingredientsInput);
safeLogMissing("results", resultsDiv);
safeLogMissing("all-recipes", allRecipesDiv);
safeLogMissing("navbar buttons", navButtons);
safeLogMissing("views", views);

// ===============================
// Navigation zwischen den „Seiten“
// ===============================

navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view; // "mood", "all", "about"

    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    views.forEach(v => {
      v.style.display = v.id === `view-${view}` ? "block" : "none";
    });

    if (view === "all") {
      renderAllRecipes();
    }
  });
});

// ===============================
// Mood-Auswahl – zeigt direkt Rezepte
// ===============================

moodButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedMood = btn.dataset.mood;

    moodButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // direkt suchen, auch wenn keine Zutaten eingetragen sind
    runSearch();
  });
});

// ===============================
// Button „Filtern nach Zutaten“
// ===============================

if (findBtn) {
  findBtn.addEventListener("click", () => {
    runSearch();
  });
}

// ===============================
// Button „Überrasch mich 🎲“
// ===============================

if (surpriseBtn) {
  surpriseBtn.addEventListener("click", () => {
    if (!resultsDiv) return;

    let pool;

    // Wenn eine Stimmung gewählt ist → nur Rezepte mit dieser Mood
    if (selectedMood) {
      pool = recipes.filter(r => r.moods.includes(selectedMood));
    } else {
      // sonst komplett random aus allen
      pool = recipes.slice();
    }

    if (pool.length === 0) {
      resultsDiv.textContent =
        "Keine Rezepte verfügbar. Trag erst welche in der app.js ein. 😅";
      return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const randomRecipe = pool[randomIndex];

    showResults([randomRecipe]);
  });
}

// ===============================
// Zentrale Such-Funktion
// ===============================

function runSearch() {
  if (!resultsDiv) return;

  if (!selectedMood) {
    resultsDiv.innerHTML =
      "Wähl erst eine Stimmung aus – oder nutz direkt „Überrasch mich“, dann nehm ich zufällig eins. 😌";
    return;
  }

  // Zutaten optional – wenn leer, einfach nur nach Mood filtern
  const userIngredients = ingredientsInput.value
    .toLowerCase()
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const matched = recipes.filter(recipe => {
    // Mood muss passen
    if (!recipe.moods.includes(selectedMood)) return false;

    // wenn keine Zutaten angegeben wurden → Mood reicht
    if (userIngredients.length === 0) return true;

    // Zutaten-Überschneidung, wenn welche angegeben sind
    const overlap = recipe.ingredients.filter(i =>
      userIngredients.includes(i)
    );

    // mindestens die Hälfte der Zutaten sollte vorhanden sein
    return overlap.length >= Math.ceil(recipe.ingredients.length / 2);
  });

  showResults(matched);
}

// ===============================
// Ergebnisse anzeigen
// ===============================

function showResults(recipesList) {
  if (!resultsDiv) return;

  resultsDiv.innerHTML = "";

  if (!recipesList || recipesList.length === 0) {
    resultsDiv.textContent =
      "Keine passenden Rezepte gefunden. Vielleicht andere Stimmung wählen oder Zutaten ändern? 🤔";
    return;
  }

  recipesList.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const img = document.createElement("img");
    img.className = "recipe-image";
    img.src = r.image || "img/placeholder.jpg";
    img.alt = r.name;

    const content = document.createElement("div");
    content.className = "recipe-content";

    const moodsText = r.moods.join(", ");

    content.innerHTML = `
      <h3>${r.name}</h3>
      <div class="recipe-meta">
        <span class="badge">${r.time} Min</span>
        <span class="badge">${r.difficulty}</span>
        <span class="badge">Mood: ${moodsText}</span>
      </div>
      <p>${r.vibe}</p>
      <p class="recipe-ingredients">
        <strong>Zutaten:</strong> ${r.ingredients.join(", ")}
      </p>
    `;

    card.appendChild(img);
    card.appendChild(content);
    resultsDiv.appendChild(card);
  });
}

// ===============================
// „Alle Rezepte“-Ansicht
// ===============================

function renderAllRecipes() {
  if (!allRecipesDiv) return;

  allRecipesDiv.innerHTML = "";

  if (recipes.length === 0) {
    allRecipesDiv.textContent = "Noch keine Rezepte eingetragen.";
    return;
  }

  recipes.forEach(r => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    const img = document.createElement("img");
    img.className = "recipe-image";
    img.src = r.image || "img/placeholder.jpg";
    img.alt = r.name;

    const content = document.createElement("div");
    content.className = "recipe-content";

    const moodsText = r.moods.join(", ");

    content.innerHTML = `
      <h3>${r.name}</h3>
      <div class="recipe-meta">
        <span class="badge">Moods: ${moodsText}</span>
        <span class="badge">${r.time} Min</span>
        <span class="badge">${r.difficulty}</span>
      </div>
      <p>${r.vibe}</p>
      <p class="recipe-ingredients">
        <strong>Zutaten:</strong> ${r.ingredients.join(", ")}
      </p>
    `;

    card.appendChild(img);
    card.appendChild(content);
    allRecipesDiv.appendChild(card);
  });
}

// ===============================
// Initialer Hinweistext
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  if (resultsDiv) {
    resultsDiv.innerHTML =
      "Wähl eine Stimmung aus – du musst keine Zutaten eintragen. Oder drück direkt „Überrasch mich 🎲“ für ein random Rezept.";
  }
});
