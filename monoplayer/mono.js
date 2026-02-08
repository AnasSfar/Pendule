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
