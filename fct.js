// fct.js fichier qui contient les fonctions utilisées dans le projet du jeu du pendule

const CATEGORIES = ["food", "color", "animal", "sport", "music", "country", "movie", "song", "city", "object", "body", "clothing", "nature", "technology", "transportation", "art", "literature", "history", "science", "space", 'random'];
const targetLangs = ["fr", "es", "de", "it", "pt", "ru", "zh", "ja", "ar", "hi"];
import readline from "readline";

// création d'une interface readline pour lire les entrées de l'utilisateur dans la console
function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question + "\n> ", answer => {
      rl.close();          // arrêt immédiat de la saisie
      resolve(answer.trim());
    });
  });
}

// fonction randInt qui retourne un entier aléatoire entre 0 et n-1
function randInt(n) {
  return Math.floor(Math.random() * n);
}

// fonction getRandomWordAndCategory qui retourne un objet contenant une catégorie et un mot aléatoire de cette catégorie
async function getRandomWordAndCategory() {
  const category = CATEGORIES[randInt(CATEGORIES.length)];

  const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(category)}&max=50`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No words for category ${category}`);
  }

  const word = data[randInt(data.length)].word;

  return {
    category,
    word
  };
}

// fonction getRandomWord qui retourne un mot aléatoire d'une catégorie donnée que le joueur a choisie
async function getRandomWord(category) {
  const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(category)}&max=50`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No words for category ${category}`);
  }
  const word = data[randInt(data.length)].word;
  return word;
}

// fonction translate qui traduit un mot d'une langue source vers une langue cible en utilisant l'API MyMemory
async function translate(word, lang) {
  const res = await fetch("https://translate.cutie.dating/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: word,
      source: "en",
      target: lang,
      format: "text"
    })
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const wordlang = data.translatedText;
  return wordlang;
}

// fonction qui demande au joueur de sélectionner les langues cibles parmi les langues disponibles
async function selectLangs() {
  const input = await ask(
    `Sélectionnez les langues cibles parmi les suivantes (séparées par des virgules) : ${targetLangs.join(", ")}`
  );

  const selectedLangs = input
    .split(",")
    .map(l => l.trim())
    .filter(l => targetLangs.includes(l));

  return selectedLangs;
}

// fonction multiple languages qui prend au hasard une langue cible parmi les langues sélectionnées par le joueur
async function randomlang(word, selectedLangs) {
  const randomLang = selectedLangs[Math.floor(Math.random() * selectedLangs.length)];
  return await translate(word, randomLang);
}

export { ask, randInt, getRandomWordAndCategory, translate, selectLangs, randomlang };