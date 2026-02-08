// fct.js (version web)

export const CATEGORIES = [
  "random", "animal", "art", "body", "city", "clothing","color","country","food","history","literature","movie", 
  "music", "nature","object","science","song","space","sport","technology","transportation"
];


export const TARGET_LANGS = ["fr","es","de","it","pt","ru","zh","ja","ar","hi"];

export function randInt(n) {
  return Math.floor(Math.random() * n);
}

export function pickRandom(arr) {
  return arr[randInt(arr.length)];
}

export async function getRandomWord(category) {
  const url = `https://api.datamuse.com/words?ml=${encodeURIComponent(category)}&max=50`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Datamuse error");
  const data = await res.json();
  if (!data.length) throw new Error("No word found");
  return pickRandom(data).word;
}

export async function translate(word, lang) {
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

  if (!res.ok) throw new Error("Translate error");
  const data = await res.json();
  return data.translatedText;
}
