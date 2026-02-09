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
const resultP = document.getElementById("result");
const errorP = document.getElementById("error");
const usedGoodDiv = document.getElementById("usedGood");
const usedBadDiv = document.getElementById("usedBad");
const wordSlotsDiv = document.getElementById("wordSlots");

const penduleLangDiv = document.getElementById("penduleLang");
const penduleNeedle = document.getElementById("penduleNeedle");

// affichage langues
// affichage langues (cards cliquables sans checkbox visible)
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


// affichage catégories
CATEGORIES.forEach(cat => {
  const opt = document.createElement("option");
  opt.value = cat;
  opt.textContent = cat;
  categorySelect.appendChild(opt);
});

function getSelectedLangs() {
  return [...langsDiv.querySelectorAll("input:checked")].map(cb => cb.value);
}

playBtn.onclick = async () => {
  // au début d'une nouvelle partie
clearUsedLetters();

// après avoir choisi la langue (lang) et obtenu la traduction (translated)
setPendule(lang, TARGET_LANGS.indexOf(lang), TARGET_LANGS.length);
renderWordSlots(translated);
  errorP.textContent = "";
  resultP.textContent = "";

  const langs = getSelectedLangs();
  if (langs.length === 0) {
    errorP.textContent = "Choisis au moins une langue.";
    return;
  }

  let category = categorySelect.value;
  if (category === "random") {
    category = pickRandom(CATEGORIES.filter(c => c !== "random"));
  }

  try {
    const wordEn = await getRandomWord(category);
    const lang = pickRandom(langs);
    const translated = await translate(wordEn, lang);

    resultP.textContent = `${wordEn} → (${lang}) ${translated}`;
  } catch (e) {
    errorP.textContent = e.message;
  }
};

function renderWordSlots(word) {
  // word = mot secret dans la langue de jeu
  // on affiche des "_" pour chaque lettre (en gardant espaces/tirets)
  const slots = [...word].map(ch => {
    if (/[a-zàâçéèêëîïôùûüÿñæœ]/i.test(ch)) return "_";
    return ch; // espaces, tirets, etc.
  });
  wordSlotsDiv.textContent = slots.join(" ");
}

function addUsedLetter(letter, isGood) {
  const chip = document.createElement("span");
  chip.className = isGood ? "goodChip" : "badChip";
  chip.textContent = letter.toLowerCase();

  if (isGood) usedGoodDiv.appendChild(chip);
  else usedBadDiv.appendChild(chip);
}

function clearUsedLetters() {
  usedGoodDiv.innerHTML = "";
  usedBadDiv.innerHTML = "";
}

function setPendule(lang, idx, total) {
  penduleLangDiv.textContent = lang;
  // rotation simple en fonction de l’index
  const t = total <= 1 ? 0 : idx / (total - 1);   // 0..1
  const deg = -60 + t * 120;                      // -60..+60
  penduleNeedle.style.transform = `translate(-50%, -100%) rotate(${deg}deg)`;
}
