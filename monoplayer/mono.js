import {
  CATEGORIES,
  TARGET_LANGS,
  pickRandom,
  getRandomWord,
  translate
} from "../fct.js";

const langsDiv = document.getElementById("langs");
const categorySelect = document.getElementById("category");
const playBtn = document.getElementById("play");
const errorP = document.getElementById("error");
const resultDiv = document.getElementById("result");

const wordSlotsDiv = document.getElementById("wordSlots");
const usedGoodDiv = document.getElementById("usedGood");
const usedBadDiv = document.getElementById("usedBad");
const guessInput = document.getElementById("guessInput");
const guessBtn = document.getElementById("guessBtn");

const penduleLangDiv = document.getElementById("penduleLang");
const penduleNeedle = document.getElementById("penduleNeedle");

// ----- état du pendu -----
let secretWord = "";
let normalizedSecret = "";
let revealed = [];                 // tableau bool/char
let usedGood = new Set();
let usedBad = new Set();
let gameLang = "";

// --- helpers ---
function setError(msg){ errorP.textContent = msg || ""; }
function setResult(msg){ resultDiv.textContent = msg || ""; }

function normalizeLetter(ch){
  return ch
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // enlève accents
}

function normalizeWord(w){
  return [...w].map(normalizeLetter).join("");
}

function isLetter(ch){
  return /^[a-zàâçéèêëîïôùûüÿñæœ]$/i.test(ch);
}

function clearUsedUI(){
  usedGoodDiv.innerHTML = "";
  usedBadDiv.innerHTML = "";
}

function addChip(letter, good){
  const s = document.createElement("span");
  s.className = good ? "goodChip" : "badChip";
  s.textContent = letter;
  (good ? usedGoodDiv : usedBadDiv).appendChild(s);
}

function renderSlots(){
  // affiche "_" pour lettres non révélées, conserve espaces/tirets
  const out = [];
  for (let i = 0; i < secretWord.length; i++){
    const original = secretWord[i];
    const norm = normalizedSecret[i];

    if (!isLetter(original)) {
      out.push(original);
      continue;
    }
    out.push(revealed[i] ? original : "_");
  }
  wordSlotsDiv.textContent = out.join(" ");
}

function setPendule(lang){
  penduleLangDiv.textContent = lang || "—";
  const idx = TARGET_LANGS.indexOf(lang);
  const total = TARGET_LANGS.length;
  const t = (idx < 0 || total <= 1) ? 0.5 : idx / (total - 1);
  const deg = -60 + t * 120;
  if (penduleNeedle) penduleNeedle.style.transform = `translate(-50%, -100%) rotate(${deg}deg)`;
}

function getSelectedLangs(){
  return [...langsDiv.querySelectorAll('input[name="lang"]:checked')].map(cb => cb.value);
}

// ----- UI init (langues) : version "cards" si tu l'as déjà, sinon simple -----
function initLangs(){
  langsDiv.innerHTML = "";
  TARGET_LANGS.forEach((lang) => {
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "lang";
    input.value = lang;
    input.className = "langToggle";
    input.id = `lang-${lang}`;

    const label = document.createElement("label");
    label.className = "langItem";
    label.htmlFor = input.id;

    const text = document.createElement("span");
    text.className = "langText";
    text.textContent = lang;

    label.appendChild(text);
    wrapper.appendChild(input);
    wrapper.appendChild(label);
    langsDiv.appendChild(wrapper);
  });
}

function initCategories(){
  categorySelect.innerHTML = "";
  // CATEGORIES peut contenir random, sinon on l’ajoute
  const cats = CATEGORIES.includes("random") ? CATEGORIES : [...CATEGORIES, "random"];
  cats.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    categorySelect.appendChild(opt);
  });
  categorySelect.value = "random";
}

// ----- boutons all/none si présents -----
const allBtn = document.getElementById("allBtn");
const noneBtn = document.getElementById("noneBtn");
if (allBtn) allBtn.onclick = () => langsDiv.querySelectorAll('input[name="lang"]').forEach(cb => cb.checked = true);
if (noneBtn) noneBtn.onclick = () => langsDiv.querySelectorAll('input[name="lang"]').forEach(cb => cb.checked = false);

// ----- démarrer une partie -----
async function startGame(){
  setError("");
  setResult("");
  clearUsedUI();
  usedGood.clear();
  usedBad.clear();
  guessInput.value = "";
  guessInput.focus();

  const selectedLangs = getSelectedLangs();
  if (selectedLangs.length === 0) {
    setError("Choisis au moins une langue.");
    return;
  }

  let category = categorySelect.value;
  if (category === "random") {
    const pool = CATEGORIES.filter(c => c !== "random");
    category = pickRandom(pool);
  }

  // mot EN puis traduction dans une langue tirée au hasard (langue de la partie)
  const wordEn = await getRandomWord(category);
  gameLang = pickRandom(selectedLangs);
  setPendule(gameLang);

  // mot secret = traduction
  const translated = await translate(wordEn, gameLang);

  secretWord = translated.trim();
  normalizedSecret = normalizeWord(secretWord);
  revealed = Array(secretWord.length).fill(false);

  // révèle direct les non-lettres
  for (let i = 0; i < secretWord.length; i++){
    if (!isLetter(secretWord[i])) revealed[i] = true;
  }

  renderSlots();
  setResult(`Catégorie: ${category}`);
}

// ----- jouer une lettre -----
function guessLetter(){
  setError("");

  if (!secretWord) {
    setError("Clique sur Commencer d'abord.");
    return;
  }

  const raw = (guessInput.value || "").trim();
  guessInput.value = "";

  if (raw.length !== 1) {
    setError("Entre une seule lettre.");
    return;
  }

  const letter = raw.toLowerCase();
  if (!isLetter(letter)) {
    setError("Lettre invalide.");
    return;
  }

  const norm = normalizeLetter(letter);

  if (usedGood.has(norm) || usedBad.has(norm)) {
    setError("Lettre déjà utilisée.");
    return;
  }

  let found = false;
  for (let i = 0; i < normalizedSecret.length; i++){
    if (normalizedSecret[i] === norm) {
      revealed[i] = true;
      found = true;
    }
  }

  if (found) {
    usedGood.add(norm);
    addChip(letter, true);
  } else {
    usedBad.add(norm);
    addChip(letter, false);
  }

  renderSlots();

  // victoire ?
  const win = revealed.every(v => v === true);
  if (win) {
    setResult(`Gagné: "${secretWord}"`);
  }
}

// events
playBtn.onclick = () => startGame().catch(e => setError(String(e?.message ?? e)));
guessBtn.onclick = guessLetter;
guessInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") guessLetter();
});

// init
initLangs();
initCategories();
setPendule("");
renderSlots();
